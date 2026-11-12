const CONTRACT = 'structs-influence-grass-v1';
const decimal = value => typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);

/** Complete, digest-checked frames only. No API dependency or stub fallback. */
export class InfluenceAssembler {
  constructor(maxBytes = 64 * 1024 * 1024) {
    this.maxBytes = maxBytes;
    this.pending = new Map();
    this.bytes = 0;
  }
  clear() { this.pending.clear(); this.bytes = 0; }
  async accept(part) {
    if (part.contract !== CONTRACT || part.category !== 'influence_part') return null;
    if (!decimal(part.frame_id) || !Number.isInteger(part.part_index) || !Number.isInteger(part.part_count)
      || part.part_count < 1 || part.part_count > Math.ceil(this.maxBytes / 4096)
      || part.part_index < 0 || part.part_index >= part.part_count || part.encoding !== 'base64'
      || !/^[a-f0-9]{64}$/.test(part.sha256) || typeof part.payload !== 'string' || part.payload.length > 5464) {
      throw new Error('Invalid influence part');
    }
    const key = `${part.subject}:${part.frame_id}`;
    let frame = this.pending.get(key);
    if (!frame) {
      if (this.pending.size >= 1024) throw new Error('Too many incomplete influence frames');
      frame = {count: part.part_count, digest: part.sha256, parts: new Map(), bytes: 0};
      this.pending.set(key, frame);
    }
    if (frame.count !== part.part_count || frame.digest !== part.sha256) throw new Error('Conflicting influence parts');
    const bytes = Uint8Array.from(atob(part.payload), c => c.charCodeAt(0));
    if (bytes.length > 4096) throw new Error('Oversized influence part');
    if (!frame.parts.has(part.part_index)) {
      if (this.bytes + bytes.length > this.maxBytes) throw new Error('Influence assembly memory limit');
      frame.parts.set(part.part_index, bytes); frame.bytes += bytes.length; this.bytes += bytes.length;
    } else if (btoa(String.fromCharCode(...frame.parts.get(part.part_index))) !== part.payload) {
      throw new Error('Conflicting influence part');
    }
    if (frame.parts.size !== frame.count) return null;
    const body = new Uint8Array(frame.bytes); let offset = 0;
    for (let i = 0; i < frame.count; i++) { const chunk = frame.parts.get(i); body.set(chunk, offset); offset += chunk.length; }
    this.pending.delete(key); this.bytes -= frame.bytes;
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', body))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (digest !== frame.digest) throw new Error('Influence digest mismatch');
    const result = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(body));
    if (result.contract !== CONTRACT || result.subject !== part.subject || result.frame_id !== part.frame_id) throw new Error('Influence envelope mismatch');
    return result;
  }
}

/** Scope-local state, including sparse graph changes. Scores remain exact strings. */
export class InfluenceStore {
  constructor() { this.scopes = new Map(); }
  cursor(subject) { return this.scopes.get(subject)?.frameId ?? '0'; }
  apply(frame) {
    if (frame.contract !== CONTRACT || !decimal(frame.frame_id) || !decimal(frame.previous_frame_id)
      || !['patch', 'replace'].includes(frame.mode)) throw new Error('Invalid influence envelope');
    const old = this.scopes.get(frame.subject);
    if (old && BigInt(frame.frame_id) <= BigInt(old.frameId)) return false;
    if (frame.mode !== 'replace' && frame.previous_frame_id !== (old?.frameId ?? '0')) throw new Error('Influence frame gap');
    if (old && old.buildId !== frame.build_id && frame.mode !== 'replace') throw new Error('Influence generation gap');
    const replace = frame.mode === 'replace';
    const next = {
      frameId: frame.frame_id, buildId: frame.build_id, height: frame.height,
      context: frame.context, category: frame.category === 'influence_history' ? old?.category : frame.category,
      data: frame.category === 'influence_history' ? old?.data : frame.data,
      historyReady: frame.data.history?.complete ?? old?.historyReady ?? true,
      history: replace ? new Map() : new Map(old?.history),
      players: frame.data.reset_roster ? new Map() : new Map(old?.players),
    };
    for (const row of frame.data.history?.samples ?? []) next.history.set(`${row.height}:${row.entity}:${row.sector}`, row);
    for (const row of frame.data.players ?? []) {
      if (!row.exists || row.guild_id !== frame.data.guild_id) next.players.delete(row.player_id);
      else next.players.set(row.player_id, row);
    }
    this.scopes.set(frame.subject, next);
    return true;
  }
}

/**
 * One exact scope per subscriber. Initial subscription and every reconnect replay
 * over NATS, with live frames buffered during catch-up. No GuildAPI/fetch calls.
 * Call stop() when the view no longer needs this scope. onUpdate receives the
 * complete envelope plus updated scope state; onError reports connection errors.
 */
export class InfluenceStream {
  constructor(connection, subject, {store = new InfluenceStore(), onUpdate = () => {}, onError = console.warn} = {}) {
    if (!/^structs\.influence\.[a-zA-Z0-9_-]+\.[1-9][0-9]*\.(contest|scores|(?:guild|player|planet)\.[a-zA-Z0-9_-]+)$/.test(subject)) throw new Error('Invalid influence scope');
    this.connection = connection; this.subject = subject; this.store = store;
    this.onUpdate = onUpdate; this.onError = onError; this.assembler = new InfluenceAssembler();
    this.queue = Promise.resolve(); this.stopped = true;
  }
  enqueue(work) {
    this.queue = this.queue.then(() => this.stopped ? undefined : work()).catch(error => { this.onError(error); });
    return this.queue;
  }
  async accept(part) {
    const frame = await this.assembler.accept(part);
    if (frame && this.store.apply(frame)) this.onUpdate(frame, this.store.scopes.get(frame.subject));
  }
  start() {
    if (!this.stopped) return this.queue;
    this.stopped = false;
    this.subscription = this.connection.subscribe(this.subject);
    this.enqueue(() => this.recover());
    this.assemblyTimer = setInterval(() => {
      if (this.assembler.pending.size) this.enqueue(() => this.recover());
    }, 15000);
    this.consume().catch(this.onError);
    this.watchStatus().catch(this.onError);
    return this.queue;
  }
  async consume() {
    for await (const message of this.subscription) {
      this.enqueue(async () => {
        try { await this.accept(message.json()); }
        catch (error) { await this.recover(); }
      });
    }
  }
  async watchStatus() {
    this.status = this.connection.status();
    for await (const status of this.status) {
      if (this.stopped) break;
      if (status.type === 'reconnect') this.enqueue(() => this.recover());
    }
  }
  async recover() {
    let delay = 1000;
    while (!this.stopped) {
      this.assembler.clear();
      try { await this.replay(); return; }
      catch (error) {
        this.onError(error);
        await new Promise(resolve => { this.retryWake = resolve; this.retryTimer = setTimeout(resolve, delay); });
        delay = Math.min(delay * 2, 30000);
      }
    }
  }
  async replay() {
    let cursor = {after_frame_id: this.store.cursor(this.subject), part_index: 0};
    const replaySubject = this.subject.replace('structs.influence.', 'structs.influence.replay.');
    do {
      const inbox = `_INBOX.influence.${crypto.randomUUID().replaceAll('-', '')}`;
      const replies = this.connection.subscribe(inbox);
      let ended = false;
      const timeout = setTimeout(() => replies.unsubscribe(), 10000);
      try {
        this.connection.publish(replaySubject, new TextEncoder().encode(JSON.stringify(cursor)), {reply: inbox});
        for await (const message of replies) {
          const packet = message.json();
          if (packet.category === 'influence_replay_end') {
            if (packet.error) throw new Error(packet.error);
            if (packet.subject !== this.subject || !decimal(packet.after_frame_id) || !decimal(packet.through_frame_id)) throw new Error('Invalid replay end');
            cursor = {after_frame_id: packet.after_frame_id, through_frame_id: packet.through_frame_id, part_index: packet.part_index};
            ended = true;
            if (packet.done) return;
            break;
          }
          if (packet.subject !== this.subject) throw new Error('Wrong replay scope');
          await this.accept(packet);
        }
      } finally { clearTimeout(timeout); replies.unsubscribe(); }
      if (!ended) throw new Error('Influence replay timed out');
    } while (!this.stopped);
  }
  stop() { this.stopped = true; clearInterval(this.assemblyTimer); clearTimeout(this.retryTimer); this.retryWake?.(); this.subscription?.unsubscribe(); this.status?.stop?.(); this.assembler.clear(); }
}
