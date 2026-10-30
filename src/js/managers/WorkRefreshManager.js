import {EVENTS} from "../constants/Events";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {CHAIN} from "../constants/ChainConstants";
import {protocolAtHeight} from "../util/ChainProtocol";

/** Refresh a small catalog and the current player's work, never a whole world. */
export class WorkRefreshManager {
  constructor(gameState, guildAPI, taskManager, {pollMs=60000,retryMs=2000,maxRetryMs=30000} = {}) {
    Object.assign(this,{gameState,guildAPI,taskManager,pollMs,retryMs,maxRetryMs,session:null});
  }

  start() {
    this.stop();
    const ownerId=this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const address=this.gameState.signingAccount?.address;
    if (!ownerId || !address || this.gameState.persistenceEnabled === false) return;
    const session={ownerId,address,controller:new AbortController(),running:null,timer:null,poll:null,retry:this.retryMs};
    this.session=session;
    const options={signal:session.controller.signal}, refresh=()=>this.request();
    for (const name of ['focus','pageshow','online',EVENTS.GRASS_CONNECTED]) window.addEventListener(name,refresh,options);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState === 'visible') refresh();},options);
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED,()=>{
      if (!this.current(session)) return;
      const meta=this.gameState.structTypes.snapshot_meta;
      if (!meta || meta.protocol !== protocolAtHeight(CHAIN.ID,this.gameState.currentBlockHeight)) this.request();
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
    clearTimeout(session.timer);
  }

  current(session) {
    return this.session === session && !session.controller.signal.aborted
      && this.gameState.persistenceEnabled !== false && this.gameState.isSessionCurrent?.() !== false
      && session.ownerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && session.address === this.gameState.signingAccount?.address;
  }

  request() {
    const session=this.session;
    if (!session || !this.current(session) || document.visibilityState === 'hidden') return Promise.resolve();
    if (session.running) return session.running;
    clearTimeout(session.timer);session.timer=null;
    session.running=this.refresh(session).finally(()=>{session.running=null;});
    return session.running;
  }

  async refresh(session) {
    try {
      const types=await this.guildAPI.getStructTypes(true);
      if (!this.current(session)) return;
      if (!this.gameState.setStructTypes(types)) throw new Error('Catalog snapshot is older or conflicting');
      if (await this.taskManager.spawnOutstandingWork() === false) throw new Error('Work snapshot is unavailable');
      session.retry=this.retryMs;
    } catch (error) {
      if (!this.current(session)) return;
      console.debug('[WorkRefresh] current catalog/work unavailable:',error);
      session.timer=setTimeout(()=>{session.timer=null;this.request();},session.retry);
      session.retry=Math.min(this.maxRetryMs,session.retry*2);
    }
  }
}
