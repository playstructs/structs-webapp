import {TASK} from "../constants/TaskConstants";
import {EVENTS} from "../constants/Events";
import {TaskCompletedEvent} from "../events/TaskCompletedEvent";


/*
 * The Task Manager
 */
export class TaskManager {
    
    /**
     * @param {GameState} gameState
     * @param {GuildAPI} guildAPI
     * @param {GrassManager} grassManager
     * @param {SigningClientManager} signingClientManager
     */
    constructor(gameState, guildAPI, grassManager, signingClientManager) {
        this.gameState = gameState;
        this.guildAPI = guildAPI;
        this.grassManager = grassManager;
        this.signingClientManager = signingClientManager;

        this.processes = [];
        this.waiting_queue = [];
        this.running_queue = [];
        this.running_count = 0;

        window.addEventListener(EVENTS.TASK_PROGRESS, function (event) {
            this.processes[event.state.getPID()].state = event.state;
            if (event.state.isCompleted()) {
                this.complete(event.state.getPID());
            }
        }.bind(this));

        window.addEventListener(EVENTS.TASK_COMPLETED, function (event) {
            console.log('It is done!' + event.state.toLog());
        }.bind(this));
    }



    start(task_process) {
        const pid = task_process.getPID();
        this.processes[pid] = task_process;

        if (this.running_count > TASK.MAX_CONCURRENT_PROCESSES) {
            const sleep_pid = this.running_queue[0];
            this.pause(sleep_pid);
        }

        this.processes[pid].start(pid);
        this.running_queue.push(pid);
        this.running_count++;

        return pid;
    }

    queue(task_process) {
        const pid = task_process.getPID();
        this.processes[pid] = task_process;

        if (this.running_count < TASK.MAX_CONCURRENT_PROCESSES) {
            this.processes[pid].start(pid);
            this.running_queue.push(pid);
            this.running_count++;
        } else {
            this.waiting_queue.push(pid);
        }

        return pid;
    }

    runNext() {
        if (this.running_count < TASK.MAX_CONCURRENT_PROCESSES) {
            const next_pid = this.waiting_queue.pop()
            if ((next_pid !== undefined) && (next_pid !== null) && (next_pid !== "")) {
                console.log(next_pid)
                this.processes[next_pid].start(next_pid);
                this.running_count++;
                this.running_queue.push(next_pid);
            }
        }
    }

    terminate(pid) {
        this.processes[pid].terminate();

        this.runningQueueRemove(pid);
        this.waitingQueueRemove(pid);

        this.runNext();
    }

   complete(pid) {
        this.processes[pid].clearWorker();

        this.runningQueueRemove(pid);
        this.waitingQueueRemove(pid);

        window.dispatchEvent(new TaskCompletedEvent(this.processes[pid].state));

        this.runNext();
    }

    waitingQueueRemove(pid){
        const waiting_index = this.waiting_queue.indexOf(pid);
        if (waiting_index !== -1) {
            this.waiting_queue.splice(waiting_index, 1);
        }
    }

    runningQueueRemove(pid) {
        const running_index = this.running_queue.indexOf(pid);
        if (running_index !== -1) {
            this.running_queue.splice(running_index, 1);
            this.running_count--;
        }
    }

    pause(pid) {
        if (this.processes[pid].isRunning()) {

            this.processes[pid].pause();
            this.runningQueueRemove(pid);

            this.waiting_queue.push(pid);

            this.runNext();
        }
    }

    resume(pid) {
        if (!this.processes[pid].isRunning() && !this.processes[pid].isCompleted()) {

            // Pull it out of the waiting queue
            this.waitingQueueRemove(pid)

            if (this.running_count < TASK.MAX_CONCURRENT_PROCESSES) {
                this.running_queue.push(pid);
                this.processes[pid].start(pid);
                this.running_count++;

            } else {
                // Add back to the next position of the waiting queue
                this.waiting_queue.push(pid);

                // Sleep the oldest
                // Which will automatically run the next in the queue after
                const sleep_pid = this.running_queue[0];
                this.pause(sleep_pid);
            }
        }
    }


    setStatus(pid, new_status) {
        console.log("Updating " + pid + " to status " + new_status);
        this.processes[pid].setStatus(new_status);
    }

    setState(pid, new_state) {
        this.processes[pid].setState(new_state);
    }

    getProcessPercentCompleteEstimate(pid) {
        return this.processes[pid].state.getPercentCompleteEstimate();
    }

    getProcessPercentCompleteEstimateAll() {
        let i = 0;
        let avg_complete = 0.0;
        for (const key in this.processes) {
            i++
            avg_complete += this.processes[key].state.getPercentCompleteEstimate();
        }
        return avg_complete / (i);
    }

    getProcessTimeRemainingEstimate(pid) {
        return this.processes[pid].state.getTimeRemainingEstimate();
    }

    getProcessTimeRemainingEstimateAll() {
        let longest = 0;
        for (const key in this.processes) {
             const estimate = this.processes[key].state.getTimeRemainingEstimate();
             if (estimate > longest) {
                 longest = estimate;
             }
        }
        return longest;
    }

    getProcessHashrate(pid) {
        return this.processes[pid].state.getHashrate();
    }

    getProceessHashrateAll() {
        let total = 0;
        for (const key in this.processes) {
            total += this.processes[key].state.getHashrate();
        }
        return total;
    }

}
