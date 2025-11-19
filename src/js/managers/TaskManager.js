import {EVENTS} from "../constants/Events";
import {FEE} from "../constants/Fee";
import {TASK} from "../constants/TaskConstants";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TASK_MANAGER_STATUS} from "../constants/TaskManagerStatus";
import {TaskProcess} from "../models/TaskProcess";
import {TaskCompletedEvent} from "../events/TaskCompletedEvent";
import {TaskManagerStatusChangedEvent} from "../events/TaskManagerStatusChangedEvent";


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

        this.status = TASK_MANAGER_STATUS.ONLINE;

        this.processes = {};
        this.waiting_queue = [];
        this.running_queue = [];

        /*
            TASK_PROGRESS used to propagate task state throughout. Can be
            used by UI elements for updating progress bars and estimates.

            TASK_WORKER_PROGRESS is used by the Web Worker and likely shouldn't
            be used by UI elements as they may miss other events such
            as Pausing and Resuming.
         */
        window.addEventListener(EVENTS.TASK_WORKER_CHANGED, function (event) {
            this.setState(event.state);
            if (event.state.isCompleted()) {
                this.complete(event.state.getPID());
            }
        }.bind(this));

        // TASK_CMD_MANAGER_PAUSE
        // Can be dispatched anywhere to halt the Task Manager
        window.addEventListener(EVENTS.TASK_CMD_MANAGER_PAUSE, function (event) {
            this.setManagerStatus(TASK_MANAGER_STATUS.OFFLINE);
            this.pauseAll();
        }.bind(this));

        // TASK_CMD_MANAGER_RESUME
        // Can be dispatched anywhere to resume the Task Manager
        window.addEventListener(EVENTS.TASK_CMD_MANAGER_RESUME, function (event) {
            this.setManagerStatus(TASK_MANAGER_STATUS.ONLINE);
            this.resumeAll();
        }.bind(this));

        // TASK_CMD_KILL
        // Can be dispatched anywhere to kill tasks.
        window.addEventListener(EVENTS.TASK_CMD_KILL, function (event) {
            this.terminate(event.pid);
        }.bind(this));

        // TASK_CMD_PAUSE
        // Can be dispatched anywhere to pause a job
        window.addEventListener(EVENTS.TASK_CMD_PAUSE, function (event) {
            this.pause(event.pid);
        }.bind(this));

        // TASK_CMD_RESUME
        // Can be dispatched anywhere to resume a job
        window.addEventListener(EVENTS.TASK_CMD_RESUME, function (event) {
            this.resume(event.pid);
        }.bind(this));

        // TASK_CMD_SPAWN
        // Can be dispatched anywhere to execute new tasks.
        window.addEventListener(EVENTS.TASK_CMD_SPAWN, function (event) {
            this.spawn(event.state);
        }.bind(this));


        // TASK_CMD_SWEEP
        // Can be dispatched anywhere to remove a job from the processes object
        window.addEventListener(EVENTS.TASK_CMD_SWEEP, function (event) {
            this.sweep(event.pid);
        }.bind(this));

        // TASK_CMD_SWEEP_ALL
        // Can be dispatched anywhere to remove all finished jobs from the processes object
        window.addEventListener(EVENTS.TASK_CMD_SWEEP_ALL, function (event) {
            this.sweepAll();
        }.bind(this));

        // Handle a completed task
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

    canStartTask() {
        return this.isOnline() && this.running_queue.length < TASK.MAX_CONCURRENT_PROCESSES
    }

    // TODO I'd like to change this to === but I'm not sure if something will currently send it over
    isAtCapacity() {
        return this.running_queue.length >= TASK.MAX_CONCURRENT_PROCESSES
    }

    isOnline() {
        return this.status === TASK_MANAGER_STATUS.ONLINE;
    }

    /**
     * @param {string} new_status
     */
    setManagerStatus(new_status) {
        this.status = new_status;
        window.dispatchEvent(new TaskManagerStatusChangedEvent(this.status));
    }

    /**
     * @param {TaskState} task_state
     * @return {string}
     */
    spawn(task_state) {
        const pid = task_state.getPID();

        task_state.setBlockCheckpoint(this.gameState.currentBlockHeight);

        if (this.processes[pid]) {
            this.processes[pid].replaceState(task_state);
        } else {
            this.processes[pid] = new TaskProcess(task_state);
            if (this.canStartTask()) {
                this.processes[pid].start(pid);
                this.running_queue.push(pid);
            } else {
                this.waiting_queue.push(pid);
            }
        }
        return pid;
    }

    runNext() {
        if (this.canStartTask()) {
            const next_pid = this.waiting_queue.pop()
            if (next_pid !== undefined) {
                console.log(next_pid)
                this.processes[next_pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                this.processes[next_pid].start(next_pid);
                this.running_queue.push(next_pid);
            }
        }
    }

    /**
     * @param {string} pid
     */
    terminate(pid) {
        if (this.processes[pid]){
            this.processes[pid].terminate();

            this.runningQueueRemove(pid);
            this.waitingQueueRemove(pid);

            this.runNext();
        }
    }

    /**
     * @param {string} pid
     */
    complete(pid) {
       if (this.processes[pid]) {
           this.processes[pid].clearWorker();

           this.runningQueueRemove(pid);
           this.waitingQueueRemove(pid);

           window.dispatchEvent(new TaskCompletedEvent(this.processes[pid].state));

           this.runNext();
       }
    }


    /**
     * @param {string} pid
     */
    pause(pid) {
        if (this.processes[pid]) {
            if (this.processes[pid].canPause()) {

                this.processes[pid].pause();
                this.runningQueueRemove(pid);

                this.waiting_queue.push(pid);

                this.runNext();
            }
        }
    }

    pauseAll() {
        let pause_list = [...this.running_queue];
        for (const pid of pause_list) {
            if (this.processes[pid].canPause()) {
                this.processes[pid].pause();
                this.runningQueueRemove(pid);

                this.waiting_queue.push(pid);
            }
        }
    }

    /**
     * @param {string} pid
     */
    resume(pid) {
        if (this.processes[pid]
            && this.processes[pid].canResume()
        ) {
            // Pull it out of the waiting queue
            this.waitingQueueRemove(pid)

            if (this.canStartTask()) {
                this.running_queue.push(pid);
                this.processes[pid].state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                this.processes[pid].start(pid);

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

    resumeAll() {
        let resume_list = [...this.waiting_queue];
        for (const pid of resume_list) {
            if (this.isAtCapacity()) {
                break;
            }
            this.resume(pid);
        }
    }


    /**
     * @param {string} pid
     */
    sweep(pid) {
        if (this.processes[pid]) {
            this.terminate(pid);
            delete this.processes[pid];
        }
    }


    sweepAll() {
        let sweep_list = [];
        for (const pid of Object.keys(this.processes)) {
            if (this.processes[pid].canSweep()) {
                sweep_list.push(pid);
            }
        }

        for (const pid of sweep_list) {
            delete this.processes[pid];
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
        }
    }


    /**
     * @param {TaskState} new_state
     */
    setState(new_state) {
        this.processes[new_state.getPID()].setState(new_state);
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
    getProcessHashrateAll() {
        let total = 0;
        for (const pid of Object.keys(this.processes)) {
            total += this.processes[pid].state.getHashrate();
        }
        return total;
    }
}
