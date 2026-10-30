import {AuthenticationError} from "../errors/AuthenticationError";

/** Retry one read/setup step at a time. Transaction submissions never belong here. */
export class StartupRecovery {
  constructor(current, {retryMs=2000,maxRetryMs=30000} = {}) {
    Object.assign(this,{current,retryMs,maxRetryMs});
    this.controller=new AbortController();
    this.listeners=new AbortController();
    this.wake=null;
    const options={signal:this.listeners.signal};
    for (const name of ['online','focus']) window.addEventListener(name,()=>this.wake?.(),options);
    window.addEventListener('storage',()=>{if(!this.current()) this.stop();},options);
    window.addEventListener('pagehide',event=>{if(!event.persisted) this.stop();},options);
  }

  get signal() { return this.controller.signal; }

  assertCurrent() {
    if (!this.current()) this.stop();
    this.signal.throwIfAborted();
  }

  stop() { this.controller.abort(); this.finish(); }

  finish() { this.listeners.abort(); }

  wait(delay) {
    this.assertCurrent();
    return new Promise((resolve,reject)=>{
      const finish=()=>{cleanup();resolve();};
      const abort=()=>{cleanup();reject(this.signal.reason);};
      const cleanup=()=>{
        clearTimeout(timer);
        this.signal.removeEventListener('abort',abort);
        if(this.wake===finish) this.wake=null;
      };
      const timer=setTimeout(finish,delay);
      this.wake=finish;
      this.signal.addEventListener('abort',abort,{once:true});
    });
  }

  async run(operation, {retryAuthentication=false} = {}) {
    let delay=this.retryMs;
    for (;;) {
      this.assertCurrent();
      try {
        const result=await operation();
        this.assertCurrent();
        return result;
      } catch(error) {
        this.assertCurrent();
        // A rejected login returns to the existing login screen. API rejection
        // alone is not proof that a native key was revoked, so never erase it.
        if(error instanceof AuthenticationError && !retryAuthentication) throw error;
        console.debug('[Startup] step unavailable; retrying:',error);
        await this.wait(delay);
        delay=Math.min(this.maxRetryMs,delay*2);
      }
    }
  }
}

/** Settle every bounded read before retrying a parallel group. */
export async function startupReads(reads) {
  const results=await Promise.allSettled(reads.map(read=>Promise.resolve().then(read)));
  const failed=results.find(result=>result.status==='rejected');
  if(failed) throw failed.reason;
  return results.map(result=>result.value);
}
