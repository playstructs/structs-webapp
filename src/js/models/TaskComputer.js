import {TASK} from "../constants/TaskConstants";

export var task_processes = [];
export var task_waiting_queue = [];
export var task_running_queue = [];
export var next_task_process_id = 0;
export var task_running_count = 0;

/*
 The Task Computer is an interface for interacting with the global task variables.
 This format allows fo the Web Worker callback functions to easily write to their processes.
 */
export class TaskComputer {
  constructor() {}

  start(task_process) {
    const pid = next_task_process_id++;
    task_processes[pid] = task_process;

    if (task_running_count > TASK.MAX_CONCURRENT_PROCESSES) {
      const sleep_pid = task_running_queue[0];
      this.pause(sleep_pid);
    }

    task_processes[pid].start(pid);
    task_running_queue.push(pid);
    task_running_count++;

    return pid;
  }

  queue(task_process) {
    const pid = next_task_process_id++;
    task_processes[pid] = task_process;

    if (task_running_count < TASK.MAX_CONCURRENT_PROCESSES) {
      task_processes[pid].start(pid);
      task_running_queue.push(pid);
      task_running_count++;
    } else {
      task_waiting_queue.push(pid);
    }

    return pid;
  }


  runNext() {
    if (task_running_count < TASK.MAX_CONCURRENT_PROCESSES) {
      const next_pid = task_waiting_queue.pop()
      task_processes[next_pid].start(next_pid);
      task_running_count++;
      task_running_queue.push(next_pid);
    }
  }

  terminate(pid) {
    task_running_count--;

    const index = task_running_queue.indexOf(pid);
    if (index !== -1) {
      task_running_queue.splice(index, 1);
    }

    task_processes[pid].terminate();
    task_processes[pid] = null;

    this.runNext();
  }

  pause(pid) {
    const index = task_running_queue.indexOf(pid);
    if (index !== -1) {
      task_running_queue.splice(index, 1);
    }

    task_waiting_queue.push(pid);

    task_running_count--;
    task_processes[pid].pause();

    this.runNext();
  }

  resume(pid) {
    if (!task_processes[pid].isRunning()){

      // Pull it out of the waiting queue
      const index = task_waiting_queue.indexOf(pid);
      if (index !== -1) {
        task_waiting_queue.splice(index, 1);
      }

      if (task_running_count < TASK.MAX_CONCURRENT_PROCESSES) {
        task_running_queue.push(pid);
        task_processes[pid].start(pid);
        task_running_count++;

      } else {
        // Add back to the next position of the waiting queue
        task_waiting_queue.push(pid);

        // Sleep the oldest
        // Which will automatically run the next in the queue after
        const sleep_pid = task_running_queue[0];
        this.pause(sleep_pid);
      }
    }
  }

  message(pid, msg_type, payload) {
    if (task_processes[pid].isRunning()) {
      task_processes[pid].sendMessage(msg_type, payload);
    }
  }

  messageAll(msg_type, payload) {
    for (let i = 0; i < task_running_queue.length; i++) {
      if (task_processes[task_running_queue[i]].isRunning()) {
        task_processes[task_running_queue[i]].sendMessage(msg_type, payload);
      }
    }
  }

  setStatus(pid, new_status){
    task_processes[pid].status = new_status
  }

  setState(pid, new_state) {
    task_processes[pid].status = new_state;
  }
}