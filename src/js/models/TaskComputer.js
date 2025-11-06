
export var task_processes = [];
export var next_task_process_id = 0;

export class TaskComputer {
  constructor() {}

  start(task_process) {
    const pid = next_task_process_id++;
    task_processes[pid] = task_process;
    task_processes[pid].start();
    return pid;
  }

  terminate(pid) {
    task_processes[pid].terminate();
    task_processes[pid] = null;
  }

  pause(pid) {
    task_processes[pid].pause();
  }

  resume(pid) {
    task_processes[pid].resume();
  }

  message(pid, msg) {
    if (task_processes[pid].isRunning()) {
      task_processes[pid].sendMessage(msg);
    }
  }

  messageAll(msg) {
    for (let i = 0; i < task_processes[i].length; i++) {
      if (task_processes[i].isRunning()) {
        task_processes[i].sendMessage(msg);
      }
    }
  }
}