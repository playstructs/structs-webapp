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

    start(task_process) {
        const pid = task_process.getPID();
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

    runNext() {
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

    terminate(pid) {
        const running_index = task_running_queue.indexOf(pid);
        if (running_index !== -1) {
            task_running_queue.splice(running_index, 1);
            task_running_count--;
        }

        const waiting_index = task_waiting_queue.indexOf(pid);
        if (waiting_index !== -1) {
            task_waiting_queue.splice(waiting_index, 1);
        }

        task_processes[pid].terminate();

        this.runNext();
    }

   complete(pid) {
        const running_index = task_running_queue.indexOf(pid);
        if (running_index !== -1) {
            task_running_queue.splice(running_index, 1);
            task_running_count--;
        }

        const waiting_index = task_waiting_queue.indexOf(pid);
        if (waiting_index !== -1) {
            task_waiting_queue.splice(waiting_index, 1);
        }

        task_processes[pid].complete();

        this.runNext();
    }

    pause(pid) {
        if (task_processes[pid].isRunning()) {
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

    resume(pid) {
        if (!task_processes[pid].isRunning() && !task_processes[pid].isCompleted()) {

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


    setStatus(pid, new_status) {
        console.log("Updating " + pid + " to status " + new_status);
        task_processes[pid].setStatus(new_status);
    }

    setState(pid, new_state) {
        task_processes[pid].setState(new_state);
    }

    getProcessPercentCompleteEstimate(pid) {
        return task_processes[pid].state.getPercentCompleteEstimate();
    }

    getProcessPercentCompleteEstimateAll() {
        let i = 0;
        let avg_complete = 0.0;
        for (const key in task_processes) {
            i++
            avg_complete += task_processes[key].state.getPercentCompleteEstimate();
        }
        return avg_complete / (i);
    }

    getProcessTimeRemainingEstimate(pid) {
        return task_processes[pid].state.getTimeRemainingEstimate();
    }

    getProcessTimeRemainingEstimateAll() {
        let longest = 0;
        for (const key in task_processes) {
             const estimate = task_processes[key].state.getTimeRemainingEstimate();
             if (estimate > longest) {
                 longest = estimate;
             }
        }
        return longest;
    }

    getProcessHashrate(pid) {
        return task_processes[pid].state.getHashrate();
    }

    getProceessHashrateAll() {
        let total = 0;

        for (const key in task_processes) {
            total += task_processes[key].state.getHashrate();
        }
        return total;
    }


}
