import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";
import {exactQueryHeight} from "../util/ChainProtocol";
import {readDeviceAuthority} from "./DeviceChangePreparation";

/** Notifications prompt a native check; their status never erases a local key. */
export class SessionAuthorityManager {
  constructor(gameState, signingClientManager, onRevoked, {pollMs=60000} = {}) {
    this.gameState = gameState;
    this.signingClientManager = signingClientManager;
    this.onRevoked = onRevoked;
    this.pollMs = pollMs;
    this.session = null;
  }

  start() {
    this.stop();
    const ownerId=this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const address=this.gameState.signingAccount?.address;
    if (!ownerId || !address || this.gameState.persistenceEnabled === false) return;
    const session={ownerId,address,controller:new AbortController(),running:null,height:0n,poll:null};
    this.session=session;
    const options={signal:session.controller.signal};
    const refresh=()=>this.request();
    for (const event of ['focus','pageshow','online',EVENTS.GRASS_CONNECTED]) window.addEventListener(event,refresh,options);
    document.addEventListener('visibilitychange',()=>{
      if (document.visibilityState === 'visible') refresh();
    },options);
    session.poll=setInterval(refresh,this.pollMs);
    this.request();
  }

  stop() {
    const session=this.session;
    this.session=null;
    if (!session) return;
    session.controller.abort();
    clearInterval(session.poll);
  }

  current(session) {
    return this.session === session && !session.controller.signal.aborted
      && this.gameState.persistenceEnabled !== false
      && this.gameState.isSessionCurrent?.() !== false
      && this.gameState.signingAccount?.address === session.address
      && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id === session.ownerId;
  }

  request(height = null) {
    const session=this.session;
    if (!session || !this.current(session)) return Promise.resolve();
    for (const value of [height,this.gameState.currentBlockHeight]) {
      if (value === null || value === undefined || value === 0) continue;
      try {
        const observed=BigInt(exactQueryHeight(value));
        if (observed > session.height) session.height=observed;
      }
      catch { /* A malformed notification can prompt a read, not establish a height. */ }
    }
    if (document.visibilityState === 'hidden') return Promise.resolve();
    if (session.running) return session.running;
    session.running=this.refresh(session).finally(()=>{session.running=null;});
    return session.running;
  }

  async refresh(session) {
    const query=this.signingClientManager.chainQuery;
    if (!query || query.closed) return;
    try {
      const snapshot=await query.readSnapshot(rpc=>readDeviceAuthority(rpc,session.address));
      if (!this.current(session) || query !== this.signingClientManager.chainQuery
          || query.closed || BigInt(exactQueryHeight(snapshot.height)) < session.height) return;
      if (snapshot.data.playerId !== session.ownerId) {
        this.stop();
        await this.onRevoked();
      }
    } catch (error) {
      // An outage, stale node or malformed response is not proof of revocation.
      if (this.current(session)) console.debug('[SessionAuthority] current ownership unavailable:',error);
    }
  }
}
