import {TASK} from "../constants/TaskConstants";

export var task_processes = [];
export var task_waiting_queue = [];
export var task_running_queue = [];
export var task_running_count = 0;

/*
 The Task Computer is an interface for interacting with the global task variables.
 This format allows fo the Web Worker callback functions to easily write to their processes.
 */
export class TaskComputer {
  constructor() {
  }
}
TaskComputer.prototype.start = function(task_process) {
    console.log("New Process");
    const pid = task_process.getPID();
    task_processes[pid] = task_process;

    if (task_running_count > TASK.MAX_CONCURRENT_PROCESSES) {
      const sleep_pid = task_running_queue[0];
      this.pause(sleep_pid);
    }
    console.log("Going to try and start");
    task_processes[pid].start(pid);
    task_running_queue.push(pid);
    task_running_count++;

    return pid;
  }

TaskComputer.prototype.queue = function(task_process) {
    const pid = task_process.getPID();
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


TaskComputer.prototype.runNext = function() {
    if (task_running_count < TASK.MAX_CONCURRENT_PROCESSES) {
      const next_pid = task_waiting_queue.pop()
      if ((next_pid !== undefined) && (next_pid !== null) && (next_pid !== "")) {
        console.log(next_pid)
        task_processes[next_pid].start(next_pid);
        task_running_count++;
        task_running_queue.push(next_pid);
      }
    }
  }

TaskComputer.prototype.terminate = function(pid) {
    if (task_processes[pid].isRunning()){
      task_running_count--;

      const index = task_running_queue.indexOf(pid);
      if (index !== -1) {
        task_running_queue.splice(index, 1);
      }
    } else {
      const index = task_waiting_queue.indexOf(pid);
      if (index !== -1) {
        task_waiting_queue.splice(index, 1);
      }
    }

    task_processes[pid].terminate();
    task_processes[pid] = null;

    this.runNext();
  }

TaskComputer.prototype.complete = function(pid) {
    if (task_processes[pid].isRunning()){
      task_running_count--;

      const index = task_running_queue.indexOf(pid);
      if (index !== -1) {
        task_running_queue.splice(index, 1);
      }
    } else {
      const index = task_waiting_queue.indexOf(pid);
      if (index !== -1) {
        task_waiting_queue.splice(index, 1);
      }
    }

    task_processes[pid].terminate();
    task_processes[pid] = null;

    this.runNext();
  }

TaskComputer.prototype.pause = function(pid) {
    if (task_processes[pid].isRunning()){
      const index = task_running_queue.indexOf(pid);
      if (index !== -1) {
        task_running_queue.splice(index, 1);
      }

      task_waiting_queue.push(pid);

      task_running_count--;
      task_processes[pid].pause();

      this.runNext();
    }
  }

TaskComputer.prototype.resume = function(pid) {
    if (!task_processes[pid].isRunning() && !task_processes[pid].isCompleted()){

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

TaskComputer.prototype.message = function(pid, msg_type, payload) {
    if (task_processes[pid].isRunning()) {
      task_processes[pid].sendMessage(msg_type, payload);
    }
  }

TaskComputer.prototype.messageAll = function(msg_type, payload) {
    for (let i = 0; i < task_running_queue.length; i++) {
      if (task_processes[task_running_queue[i]].isRunning()) {
        task_processes[task_running_queue[i]].sendMessage(msg_type, payload);
      }
    }
  }

TaskComputer.prototype.setStatus = function(pid, new_status){
    console.log("Updating " + pid + " to status " + new_status);
    task_processes[pid].setStatus(new_status);
  }

TaskComputer.prototype.setState = function(pid, new_state) {
    task_processes[pid].setState(new_state);
  }

TaskComputer.prototype.getProcessPercentCompleteEstimate = function(pid) {
    return task_processes[pid].state.getPercentCompleteEstimate();
  }

TaskComputer.prototype.getProcessTimeRemainingEstimate = function(pid) {
    return task_processes[pid].state.getTimeRemainingEstimate();
  }

TaskComputer.prototype.commitAll = function() {
    for (let i = 0; i < task_running_queue.length; i++) {
      if (task_processes[task_running_queue[i]].isRunning()) {
        task_processes[task_running_queue[i]].commit();
      }
    }
  }

