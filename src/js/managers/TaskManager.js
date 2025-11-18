import {TASK} from "../constants/TaskConstants";
import {EVENTS} from "../constants/Events";
import {FEE} from "../constants/Fee";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskProcess} from "../models/TaskProcess";
import {TaskCompletedEvent} from "../events/TaskCompletedEvent";


/*
 * The Task Manager
 */
export class TaskManager {
    
    /**
     * @param {GameState} gameState
     * @param {GuildAPI} guildAPI
     * @param {SigningClientManager} signingClientManager
     */
    constructor(gameState, guildAPI, signingClientManager) {
        this.gameState = gameState;
        this.guildAPI = guildAPI;
        this.signingClientManager = signingClientManager;

        this.processes = {};
        this.waiting_queue = [];
        this.running_queue = [];
        this.running_count = 0;

        /*
            TASK_PROGRESS used to propagate task state throughout. Can be
            used by UI elements for updating progress bars and estimates.

            Only Web Worker message handlers should dispatch this event.
         */
        window.addEventListener(EVENTS.TASK_PROGRESS, function (event) {
            this.processes[event.state.getPID()].state = event.state;
            if (event.state.isCompleted()) {
                this.complete(event.state.getPID());
            }
        }.bind(this));

        /*
            TASK_SPAWN can be dispatched anywhere to execute new tasks.
         */
        window.addEventListener(EVENTS.TASK_SPAWN, function (event) {

            event.state.setBlockCheckpoint(this.gameState.currentBlockHeight);

            if (this.processes[event.state.getPID()]) {
                if (event.state.block_start >= this.processes[event.state.getPID()].state.block_start) {
                    this.processes[event.state.getPID()].replaceState(event.state);
                }
            } else {
                let process = new TaskProcess(event.state);
                this.queue(process);
            }
        }.bind(this));

        /*
            TASK_KILL can be dispatched anywhere to kill tasks.
         */
        window.addEventListener(EVENTS.TASK_KILL, function (event) {
            if (this.processes[event.pid]) {
                this.terminate(event.pid);
            }
        }.bind(this));

        window.addEventListener(EVENTS.TASK_COMPLETED, async function (event) {
            console.log('It is done! \n ' + event.state.toLog());

            // TODO - restructure this to not be switch based
            // TODO - add result verification (check hash, difficulty, etc)
            // TODO - More complex result handling, currently assumes
            //          only processing your own work.
            //
                // If the Task belongs to this user
                    // Create a transactions
                // else
                    // submit to guild

            let msg;
            switch (event.state.task_type) {
                case TASK_TYPES.RAID:
                    msg = this.signingClientManager.createMsgPlanetRaidComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
                case TASK_TYPES.BUILD:
                    msg = this.signingClientManager.createMsgStructBuildComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case TASK_TYPES.MINE:
                    msg = this.signingClientManager.createMsgStructOreMinerComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case TASK_TYPES.REFINE:
                    msg = this.signingClientManager.createMsgStructOreRefineryComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
            }

            try {
                await this.gameState.signingClient.signAndBroadcast(
                    this.gameState.signingAccount.address,
                    [msg],
                    FEE
                );
            } catch (error) {
                console.log('Sign and Broadcast Error:', error);
            }
        }.bind(this));

    }

    /**
     * @param {TaskProcess} task_process
     * @return {string}
     */
    start(task_process) {
        const pid = task_process.getPID();
        this.processes[pid] = task_process;

        if (this.running_count === TASK.MAX_CONCURRENT_PROCESSES) {
            const sleep_pid = this.running_queue[0];
            this.pause(sleep_pid);
        }

        this.processes[pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
        this.processes[pid].start(pid);
        this.running_queue.push(pid);
        this.running_count++;

        return pid;
    }

    /**
     * @param {TaskProcess} task_process
     * @return {string}
     */
    queue(task_process) {
        const pid = task_process.getPID();
        this.processes[pid] = task_process;

        if (this.running_count < TASK.MAX_CONCURRENT_PROCESSES) {
            this.processes[pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
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
            if ((next_pid !== undefined)
                && (next_pid !== null)
                && (next_pid !== "")
            ) {
                console.log(next_pid)
                this.processes[next_pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                this.processes[next_pid].start(next_pid);
                this.running_count++;
                this.running_queue.push(next_pid);
            }
        }
    }

    /**
     * @param {string} pid
     */
    terminate(pid) {
        this.processes[pid].terminate();

        this.runningQueueRemove(pid);
        this.waitingQueueRemove(pid);

        this.runNext();
    }

    /**
     * @param {string} pid
     */
   complete(pid) {
        this.processes[pid].clearWorker();

        this.runningQueueRemove(pid);
        this.waitingQueueRemove(pid);

        window.dispatchEvent(new TaskCompletedEvent(this.processes[pid].state));

        this.runNext();
    }

    /**
     * @param {string} pid
     */
    clear(pid) {
        if (this.processes[pid]) {
            this.terminate(pid);
        }
        delete this.processes[pid];

        this.runNext();
    }


    clearAllFinished() {
        for (const pid of Object.keys(this.processes)) {
            if (this.processes[pid].state.isTerminated() || this.processes[pid].state.isCompleted()) {
                delete this.processes[pid];
            }
        }
    }

    /**
     * @param {string} pid
     */
    waitingQueueRemove(pid){
        const waiting_index = this.waiting_queue.indexOf(pid);
        if (waiting_index !== -1) {
            this.waiting_queue.splice(waiting_index, 1);
        }
    }

    /**
     * @param {string} pid
     */
    runningQueueRemove(pid) {
        const running_index = this.running_queue.indexOf(pid);
        if (running_index !== -1) {
            this.running_queue.splice(running_index, 1);
            this.running_count--;
        }
    }

    /**
     * @param {string} pid
     */
    pause(pid) {
        if (this.processes[pid].isRunning()) {

            this.processes[pid].pause();
            this.runningQueueRemove(pid);

            this.waiting_queue.push(pid);

            this.runNext();
        }
    }

    /**
     * @param {string} pid
     */
    resume(pid) {
        if (!this.processes[pid].isRunning()
            && !this.processes[pid].isCompleted()
        ) {
            // Pull it out of the waiting queue
            this.waitingQueueRemove(pid)

            if (this.running_count < TASK.MAX_CONCURRENT_PROCESSES) {
                this.running_queue.push(pid);
                this.processes[pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
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


    /**
     * @param {string} pid
     * @param {string} new_status
     */
    setStatus(pid, new_status) {
        console.log("Updating " + pid + " to status " + new_status);
        this.processes[pid].setStatus(new_status);
    }

    /**
     * @param {string} pid
     * @param {TaskState} new_state
     */
    setState(pid, new_state) {
        this.processes[pid].setState(new_state);
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessPercentCompleteEstimate(pid) {
        return this.processes[pid].state.getPercentCompleteEstimate();
    }

    /**
     * @return {number}
     */
    getProcessPercentCompleteEstimateAll() {
        let i = 0;
        let avg_complete = 0.0;
        for (const pid of Object.keys(this.processes)) {
            i++
            avg_complete += this.processes[pid].state.getPercentCompleteEstimate();
        }
        return avg_complete / (i);
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessTimeRemainingEstimate(pid) {
        return this.processes[pid].state.getTimeRemainingEstimate();
    }

    /**
     * @return {number}
     */
    getProcessTimeRemainingEstimateAll() {
        let longest = 0;
        for (const pid of Object.keys(this.processes)) {
             const estimate = this.processes[pid].state.getTimeRemainingEstimate();
             if (estimate > longest) {
                 longest = estimate;
             }
        }
        return longest;
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessHashrate(pid) {
        return this.processes[pid].state.getHashrate();
    }

    /**
     * @return {number}
     */
    getProceessHashrateAll() {
        let total = 0;
        for (const pid of Object.keys(this.processes)) {
            total += this.processes[pid].state.getHashrate();
        }
        return total;
    }
}
