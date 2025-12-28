import {EVENTS} from "../constants/Events";
import {FEE} from "../constants/Fee";
import {TASK} from "../constants/TaskConstants";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TASK_MANAGER_STATUS} from "../constants/TaskManagerStatus";
import {TaskProcess} from "../models/TaskProcess";
import {TaskCompletedEvent} from "../events/TaskCompletedEvent";
import {TaskManagerStatusChangedEvent} from "../events/TaskManagerStatusChangedEvent";
import {TASK_STATUS} from "../constants/TaskStatus";
import {OBJECT_TYPES} from "../constants/ObjectTypes";


/*
 * The Task Manager
 */
export class TaskManager {
    
    /**
     * @param {GameState} gameState
     * @param {GuildAPI} guildAPI
     * @param {SigningClientManager} signingClientManager
     * @param {TaskStateFactory} taskStateFactory
     */
    constructor(
      gameState,
      guildAPI,
      signingClientManager,
      taskStateFactory
    ) {
        this.gameState = gameState;
        this.guildAPI = guildAPI;
        this.signingClientManager = signingClientManager;
        this.taskStateFactory = taskStateFactory;

        this.status = TASK_MANAGER_STATUS.OFFLINE;

        this.processes = {};
        this.waiting_queue = [];
        this.running_queue = [];


        setInterval(() => {
            console.log(this.processes);
            console.log(this.waiting_queue);
            console.log(this.running_queue);
            console.log('hashrate ' + this.getProcessAverageHashrate());
            console.log('percent est. ' + this.getProcessPercentCompleteEstimateAll());
            console.log('time est. ' + this.getProcessTimeRemainingEstimateAll()/1000.0);
        }, 5000);

        /*
            TASK_STATE_CHANGED used to propagate task state throughout. Can be
            used by UI elements for updating progress bars and estimates.

            TASK_WORKER_CHANGED is used by the Web Worker and likely shouldn't
            be used by UI elements as they may miss other events such
            as Pausing and Resuming.
         */
        window.addEventListener(EVENTS.TASK_WORKER_CHANGED, function (event) {
            this.setState(event.state);
            console.log(this.processes[event.state.getPID()].state)
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

        // TASK_CMD_FORCE_RUN
        // Can be dispatched anywhere to force a process in waiting to start running
        window.addEventListener(EVENTS.TASK_CMD_FORCE_RUN, function (event) {
            this.forceRun(event.pid);
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
                    await this.signingClientManager.queueMsgPlanetRaidComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
                case TASK_TYPES.BUILD:
                    await this.signingClientManager.queueMsgStructBuildComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case TASK_TYPES.MINE:
                    await this.signingClientManager.queueMsgStructOreMinerComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;

                case TASK_TYPES.REFINE:
                    await this.signingClientManager.queueMsgStructOreRefineryComplete(
                        this.gameState.signingAccount.address,
                        event.state.object_id,
                        event.state.result_hash,
                        event.state.result_nonce
                    );
                    break;
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
    forceRun(pid){
        if (this.processes[pid]) {
            if (this.processes[pid].isWaiting()) {
                this.processes[pid].setStatus(TASK_STATUS.RUNNING);
                this.processes[pid].start();
            }
        }
    }

    /**
     * @param {string} pid
     */
    terminate(pid) {
        const running_index = this.running_queue.indexOf(pid);
        const waiting_index = this.waiting_queue.indexOf(pid);
        if ((running_index !== -1) || (waiting_index !== -1)) {
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
        const hashrate = this.getProcessAverageHashrate();
        const offsetBlock = this.getProcessBlockOffset(pid, hashrate);

        return this.processes[pid].state.getPercentCompleteEstimate(offsetBlock, hashrate);
    }

    /**
     * @return {number}
     */
    getProcessPercentCompleteEstimateAll() {
        const hashrate = this.getProcessAverageHashrate();

        let i = 0;
        let avg_complete = 0.0;
        for (const pid of Object.keys(this.processes)) {
            i++
            const offsetBlock = this.getProcessBlockOffset(pid, hashrate);
            avg_complete += this.processes[pid].state.getPercentCompleteEstimate(hashrate, offsetBlock);
        }

        if (i == 0) {
            return 1;
        }
        return avg_complete / (i);
    }

    /**
     * @param {string} pid
     * @return {number}
     */
    getProcessTimeRemainingEstimate(pid) {
        const hashrate = this.getProcessAverageHashrate();
        const offsetBlock = this.getProcessBlockOffset(pid, hashrate);

        return this.processes[pid].state.getTimeRemainingEstimate(hashrate, offsetBlock);
    }

    /**
     * @param {string} queue_pid
     * @param {number} hashRate
     * @return {number}
     */
    getProcessBlockOffset(queue_pid, hashrate) {
        let longest_block = 0;
        let running_list = [...this.running_queue];
        for (const pid of running_list) {
            if (pid === queue_pid) { return 0; }
            const current_block_length = this.processes[pid].state.getTimeRemainingEstimate(hashrate, 0 );
            longest_block = (current_block_length > longest_block) ? current_block_length : longest_block;
        }

        // Only process the waiting list if the running list has any jobs
        // Otherwise we end up with a wonky estimate on initial jobs
        if (running_list.length > 0) {
            let waiting_list = [...this.waiting_queue];
            for (const pid of waiting_list) {
                if (pid === queue_pid) { break; }
                const current_block_length = this.processes[pid].state.getTimeRemainingEstimate(hashrate, longest_block );
                longest_block = (current_block_length > longest_block) ? current_block_length : longest_block;
            }
        }
        return longest_block;

    }



    /**
     * @return {number}
     */
    getProcessTimeRemainingEstimateAll() {
        const hashrate = this.getProcessAverageHashrate();

        let longest = 0;
        for (const pid of Object.keys(this.processes)) {
            const offsetBlock = this.getProcessBlockOffset(pid, hashrate);
            const estimate = this.processes[pid].state.getTimeRemainingEstimate(hashrate, offsetBlock);
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


    /**
     * @return {number}
     */
    getProcessAverageHashrate() {
        let average = 0;
        let iterations = 0;
        for (const pid of Object.keys(this.processes)) {
            // Make sure the state is actually running and not waiting
            if (this.processes[pid].state.isRunning()) {
                average += this.processes[pid].state.getHashrate();
                iterations++
            }
        }

        if (iterations == 0 || average == 0) {
            return TASK.HASHRATE_INITIAL_ESTIMATE;
        }
        return average / iterations;
    }

    /**
     * Searches for a build process by struct ID.
     *
     * @param {string} structId
     * @return {TaskProcess|null}
     */
    getBuildProcessByStructId(structId) {
        for (const pid of Object.keys(this.processes)) {
            const process = this.processes[pid];
            const state = process.state;
            if (
                state.task_type === TASK_TYPES.BUILD
                && state.object_type === OBJECT_TYPES.STRUCT
                && state.object_id === structId
            ) {
                return process;
            }
        }
        return null;
    }


    /**
     * Restores worker tasks for the logged in player from the database.
     *
     * @return {Promise<void>}
     */
    async restoreTasksFromDB() {

        // Only restore tasks, if the task manager is not already in use.
        if (Object.keys(this.processes).length || this.running_queue.length || this.waiting_queue.length) {
            return;
        }

        const work = await this.guildAPI.getWorkByPlayerId(this.gameState.thisPlayerId);
        work.forEach((workTask) => {
            const task = this.taskStateFactory.initTaskFromWork(workTask);
            this.spawn(task);
        });
    }
}
