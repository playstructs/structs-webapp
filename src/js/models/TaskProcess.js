
export class TaskProcess {
  constructor() {
    this.state = null;
    this.worker = null;
    this.status = null;
  }

  hasWorker() {

  }

  isRunning() {

  }

  startWorker() {
    if(!this.hasWorker()) {
      // Setup Worker
    }
    this.worker.start()
  }

  stopWorker() {

  }

  sendMessage() {

  }
}
