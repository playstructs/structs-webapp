export class TaskComputer {
  constructor() {
    this.processes = null;
    this.next_pid = null;
  }

  start(task_process) {
    const pid = this.next_pid++;
    this.processes[pid] = task_process;
    this.processes[pid].startWorker();
    return pid;
  }

  terminate(pid) {
    this.processes[pid].stopWorker();
    this.processes[pid] = null;
  }

  pause(pid) {
    this.processes[pid].stopWorker();
  }

  resume(pid) {
    this.processes[pid].startWorker();
  }

  message(pid, msg) {
    if (this.processes[pid].isRunning()) {
      this.processes[pid].sendMessage(msg);
    }
  }

  messageAll(msg) {
    for (let i = 0; i < this.processes[i].length; i++) {
      if (this.processes[i].isRunning()) {
        this.processes[i].sendMessage(msg);
      }
    }
  }
}