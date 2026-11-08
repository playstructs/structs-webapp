import {EVENTS} from "../constants/Events";
import {TASK} from "../constants/TaskConstants";
import {ORE_TASK_TYPES, TASK_TYPES} from "../constants/TaskTypes";
import {TASK_MANAGER_STATUS} from "../constants/TaskManagerStatus";
import {TaskProcess} from "../models/TaskProcess";
import {TaskCompletedEvent} from "../events/TaskCompletedEvent";
import {TaskManagerStatusChangedEvent} from "../events/TaskManagerStatusChangedEvent";
import {TASK_STATUS} from "../constants/TaskStatus";
import {OBJECT_TYPES} from "../constants/ObjectTypes";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {RAID_STATUS} from "../constants/RaidStatus";
import {CHAIN} from "../constants/ChainConstants";
import {maxQueryHeight, validateReadSnapshot} from "../util/ChainProtocol";
import {workUint64} from "../util/WorkDifficulty";
import {TX_STATUS} from "../models/SigningTransaction";
import {workMessageIdentity, workSubmissionMatches, workSubmissionCommit, workAttemptHeight} from "../util/WorkSubmission";


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

        /** @type {Promise<void>|null} In-flight work lookup, shared by concurrent callers. */
        this.outstanding_work_lookup = null;

        /** @type {Promise<Work[]>|null} In-flight work request, shared by concurrent callers. */
        this.work_request = null;
        this.workSession = 0;
        this.workSnapshot = null;
        this.workHeightFloor = 0n;
        this.proofObservers = new Map();
        this.proofController = new AbortController();
        this.proofRetryNeeded = false;

        /** @type {Object<string, number>} Ore clocks that arrived while the planet was still raided. */
        this.held_ore_clocks = {};

        /** @type {number} Blocks left in which to look for refine work the indexer has yet to list. */
        this.refine_work_lookups_remaining = 0;

        /*
            TASK_STATE_CHANGED used to propagate task state throughout. Can be
            used by UI elements for updating progress bars and estimates.

            TASK_WORKER_CHANGED is used by the Web Worker and likely shouldn't
            be used by UI elements as they may miss other events such
            as Pausing and Resuming.
         */
        window.addEventListener(EVENTS.TASK_WORKER_CHANGED, function (event) {
            const process = this.processes[event.state.getPID()];
            if (!process || !process.state.isSameWork(event.state)) {
                return;
            }
            this.setState(event.state);
            if (event.state.status === TASK_STATUS.TERMINATED) {
                this.terminate(event.state.getPID());
                return;
            }
            if (event.state.isCompleted()) {

                event.state.setBlockCheckpoint(this.gameState.currentBlockHeight);
                // Recheck the actual proof at the latest observed block.
                if (event.state.checkResultHashDifficulty()) {
                    this.complete(event.state.getPID());
                } else {
                    event.state.setStatus(TASK_STATUS.STARTING);
                    process.start();
                }

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
            this.handleSpawnCommand(event.state);
        }.bind(this));


        // TASK_CMD_RECONCILE
        // Can be dispatched anywhere the chain may have handed the player work
        // that no local task is covering yet.
        window.addEventListener(EVENTS.TASK_CMD_RECONCILE, function (event) {
            this.requireObservedWork();
            this.spawnOutstandingWork();
        }.bind(this));

        // TASK_CMD_REFRESH_ORE
        // Dispatched when a planet's shared mine or refine clock changes, which
        // starts, restarts or stops the work of every eligible struct on it.
        window.addEventListener(EVENTS.TASK_CMD_REFRESH_ORE, function (event) {
            this.refreshOreTasks(event.taskType, event.blockStart);
        }.bind(this));

        // TASK_CMD_AWAIT_REFINE_WORK
        // Dispatched when the player's stored ore rises from zero, which makes
        // refining possible again without moving the refine clock.
        window.addEventListener(EVENTS.TASK_CMD_AWAIT_REFINE_WORK, function (event) {
            this.awaitRefineWork();
        }.bind(this));

        window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, function (event) {
            for (const process of Object.values(this.processes)) {
                process.setBlockCheckpoint(this.gameState.currentBlockHeight);
            }
            this.lookForAwaitedRefineWork();
            this.retryCompletedProofs();
            if (this.proofRetryNeeded) {
                this.proofRetryNeeded = false;
                this.spawnOutstandingWork();
            }
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

        // A finished hash is only a candidate; queueing and inclusion are
        // tracked separately by submitCompletedProof().
        window.addEventListener(EVENTS.TASK_COMPLETED, event => {
            this.submitCompletedProof(event.state);
        });

        // Add Console Utilities
        setInterval(() => this.StatusAll(), TASK.AUTOMATIC_STATUS_INTERVAL);

    }

    StatusAll() {
        console.log(this.processes);
        console.log(this.waiting_queue);
        console.log(this.running_queue);
        console.log('hashrate ' + this.getProcessAverageHashrate());
        console.log('percent est. ' + this.getProcessPercentCompleteEstimateAll());
        console.log('time est. ' + this.getProcessTimeRemainingEstimateAll()/1000.0);
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
     * A spawn command asks for the current authoritative work.
     *
     * @param {TaskState} task_state
     */
    handleSpawnCommand(task_state) {
        this.requireObservedWork();
        this.spawnOutstandingWork();
    }

    /**
     * Whether a saved proof for this work already settles or covers it, so the
     * task must not hash again.
     *
     * @param {TaskState} task_state
     * @param {string} pid
     * @return {boolean}
     */
    hasSavedSubmission(task_state, pid) {
        try {
            const existing = this.signingClientManager.queue.findWorkSubmission(task_state);
            if (!existing) {
                return false;
            }
            if (existing.status === TX_STATUS.SUCCEEDED) {
                workSubmissionCommit(existing, task_state, this.signingClientManager.registry);
                this.sweep(pid);
                return true;
            }
            if (!existing.isTerminal()) {
                this.sweep(pid);
                this.observeWorkSubmission(task_state, existing);
                return true;
            }
            // A failed attempt is no reason to hash or retry against the same
            // stale projection. A newer work snapshot is needed first.
            return task_state.rules_height == null
                || workUint64(task_state.rules_height) <= workAttemptHeight(existing);
        } catch (error) {
            console.warn('[TaskManager] saved proof needs reconciliation:', error);
            return true;
        }
    }

    /**
     * @param {TaskState} task_state
     * @return {string}
     */
    spawn(task_state) {
        const pid = task_state.getPID();

        task_state.setBlockCheckpoint(this.gameState.currentBlockHeight);

        if (this.hasSavedSubmission(task_state, pid)) {
            return pid;
        }

        if (this.processes[pid]?.state.isCompleted() && !this.processes[pid].state.isSameWork(task_state)) {
            // Replacing a local candidate never erases its queued or signed record.
            this.sweep(pid);
        }
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
        // A completed candidate awaiting queue capacity is in neither lane,
        // but authoritative removal of its work must still discard it.
        if (this.processes[pid]) {
            this.processes[pid].terminate();

            this.runningQueueRemove(pid);
            this.waitingQueueRemove(pid);

            delete this.processes[pid];

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
     * Offers every completed proof to the signing queue again.
     */
    retryCompletedProofs() {
        if (!this.gameState.signingAccount?.address) {
            return;
        }
        for (const process of Object.values(this.processes)) {
            if (process.state.isCompleted()) {
                this.submitCompletedProof(process.state);
            }
        }
    }

    /**
     * Queues a completed proof for signing, unless a saved submission already
     * covers this work or the proof no longer meets the difficulty.
     *
     * @param {TaskState} state
     * @return {Promise<void>|undefined} the outcome observer, once the proof is queued
     */
    submitCompletedProof(state) {
        if (
            !this.gameState.signingAccount?.address
            || this.gameState.isSessionCurrent?.() === false
            || !this.processes[state.getPID()]?.state.isSameWork(state)
        ) {
            return;
        }
        const queue = this.signingClientManager.queue;
        try {
            const existing = queue.findWorkSubmission(state);
            if (existing) {
                if (!existing.isTerminal() || existing.status === TX_STATUS.SUCCEEDED) {
                    return this.observeWorkSubmission(state, existing);
                }
                if (state.rules_height == null || workUint64(state.rules_height) <= workAttemptHeight(existing)) {
                    this.sweep(state.getPID());
                    this.workHeightFloor = this.workHeightFloor > workAttemptHeight(existing) + 1n
                        ? this.workHeightFloor
                        : workAttemptHeight(existing) + 1n;
                    this.proofRetryNeeded = true;
                    return;
                }
            }
            state.setBlockCheckpoint(this.gameState.currentBlockHeight);
            if (!state.checkResultHashDifficulty()) {
                this.sweep(state.getPID());
                this.requireObservedWork();
                this.proofRetryNeeded = true;
                return;
            }
            const message = workMessageIdentity(state);
            const payload = {[message.field]: state.object_id, proof: state.result_hash, nonce: state.result_nonce};
            if (!workSubmissionMatches({message: {typeUrl: message.typeUrl, payload}}, state, this.signingClientManager.registry)) {
                throw new Error('Completed proof does not match its work identity');
            }
            const id = queue.enqueueGameplayImmediate(message.typeUrl, payload);
            return this.observeWorkSubmission(state, queue.getTransaction(id));
        } catch (error) {
            // A full queue, unknown evidence or unavailable storage leaves the
            // completed candidate in memory. A later block may enqueue it only
            // if the durable queue proves that no submission already owns it.
            console.debug('[TaskManager] completed proof awaiting queue:', error);
        }
    }

    /**
     * Waits for a queued proof to settle, then raises the work height floor and
     * asks for fresh work. Concurrent callers share one observer per transaction.
     *
     * @param {TaskState} state
     * @param {SigningTransaction} tx
     * @return {Promise<void>}
     */
    observeWorkSubmission(state, tx) {
        if (this.proofObservers.has(tx.id)) {
            return this.proofObservers.get(tx.id);
        }
        const session = this.workSession;
        const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
        const address = this.gameState.signingAccount?.address;
        const current = () => session === this.workSession
            && address === this.gameState.signingAccount?.address
            && ownerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
            && this.gameState.isSessionCurrent?.() !== false;
        const observation = this.signingClientManager.queue.whenSettled(tx.id, this.proofController.signal)
            .then(result => {
                if (!current()) {
                    return;
                }
                const height = result.status === TX_STATUS.SUCCEEDED
                    ? BigInt(workSubmissionCommit(result, state, this.signingClientManager.registry))
                    : workAttemptHeight(result) + 1n;
                if (height > this.workHeightFloor) {
                    this.workHeightFloor = height;
                }
                const process = this.processes[state.getPID()];
                if (process?.state.isSameWork(state)) {
                    this.sweep(state.getPID());
                }
                this.proofRetryNeeded = true;
            })
            .catch(error => {
                if (current()) {
                    console.warn('[TaskManager] proof outcome unavailable:', error);
                }
            })
            .finally(() => {
                if (this.proofObservers.get(tx.id) === observation) {
                    this.proofObservers.delete(tx.id);
                }
            });
        this.proofObservers.set(tx.id, observation);
        return observation;
    }


    /**
     * @param {string} pid
     */
    pause(pid) {
        if (this.processes[pid]) {
            if (this.processes[pid].canPause()) {

                const estimatedHashrate = this.getProcessAverageHashrate();
                const estimatedBlockStartOffset = this.getProcessBlockOffset(pid, estimatedHashrate);

                this.processes[pid].pause(estimatedHashrate, estimatedBlockStartOffset);
                this.runningQueueRemove(pid);

                this.waiting_queue.push(pid);

                this.runNext();
            }
        }
    }

    pauseAll() {
        let pause_list = [...this.running_queue];

        const estimatedHashrate = this.getProcessAverageHashrate();

        for (const pid of pause_list) {
            if (this.processes[pid].canPause()) {
                const estimatedBlockStartOffset = this.getProcessBlockOffset(pid, estimatedHashrate);

                this.processes[pid].pause(estimatedHashrate, estimatedBlockStartOffset);
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

        return this.processes[pid].state.getPercentCompleteEstimate(hashrate, offsetBlock);
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

        if (this.processes[pid]) {
            return this.processes[pid].state.getTimeRemainingEstimate(hashrate, offsetBlock);
        }

        return 0;
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
        return this.getProcessByStructIdAndType(structId, TASK_TYPES.BUILD);
    }

    /**
     * Searches for a process associated with a given struct ID and task type.
     *
     * @param {string} structId
     * @param {string} taskType see TASK_TYPES
     * @return {TaskProcess|null}
     */
    getProcessByStructIdAndType(structId, taskType) {
        for (const pid of Object.keys(this.processes)) {
            const process = this.processes[pid];
            const state = process.state;
            if (
                state.task_type === taskType
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

        return this.spawnOutstandingWork();
    }

    /**
     * Collects the process IDs of every task of a given type.
     *
     * @param {string} taskType see TASK_TYPES
     * @return {string[]}
     */
    getProcessIdsByType(taskType) {
        return Object.keys(this.processes).filter(
            (pid) => this.processes[pid].state.task_type === taskType
        );
    }

    /**
     * @param {string} taskType see TASK_TYPES
     */
    terminateAllByType(taskType) {
        for (const pid of this.getProcessIdsByType(taskType)) {
            this.terminate(pid);
        }
    }

    /**
     * Mining and refining are refused by the chain for as long as a raider sits
     * on the planet, so no hash found during that window can be redeemed.
     *
     * @return {boolean}
     */
    isPlayerPlanetRaided() {
        return this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetRaidInfo.isRaidActive();
    }

    /**
     * Brings the running mine or refine tasks in line with a shared planet
     * clock, after fetching the structs that clock currently covers.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @param {number} block_start Zero when the clock has been cleared.
     * @return {Promise<void>}
     */
    async refreshOreTasks(taskType, block_start) {
        // A notification, even one with a zero or cleared clock, only asks for
        // a refresh. Only the ready snapshot may replace or remove real work.
        this.requireObservedWork();
        try {
            const work = await this.fetchWork();
            this.syncOreTasks(taskType, work);
        } catch (error) {
            console.warn('[TaskManager] could not refresh ore work:', error);
        }
    }

    /**
     * Starts, replaces and stops the tasks of one ore type so they match the
     * work the chain currently recognises.
     *
     * Every eligible struct on a planet shares that planet's clock, and the
     * chain no longer reports a per-struct stop: a rig going offline leaves the
     * clock untouched, so the work list is the only signal that it should no
     * longer be hashing.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @param {Work[]} work
     * @param {number|null} block_start The clock as reported by GRASS. Only the
     *   tutorial hashes against it; real work uses the indexed record.
     */
    syncOreTasks(taskType, work, block_start = null) {
        if (!this.isWorkCurrent(work)) {
            return;
        }
        const eligible = this.isPlayerPlanetRaided()
            ? []
            : work.filter((workTask) =>
                workTask.category === taskType
                && workUint64(this.taskBlockStart(workTask, block_start)) > 0n
            );
        const eligible_ids = eligible.map((workTask) => workTask.object_id);

        for (const pid of this.getProcessIdsByType(taskType)) {
            if (!eligible_ids.includes(pid)) {
                this.terminate(pid);
            }
        }

        for (const workTask of eligible) {
            const task_block_start = this.taskBlockStart(workTask, block_start);

            // Without a clock there is nothing to hash against.
            if (task_block_start === null || String(task_block_start) === '0') {
                continue;
            }

            // Respawn even when the range is unchanged, so the task picks up the
            // new source height. TaskProcess keeps its nonces at the same anchor
            // and refuses older rules.
            this.spawn(this.taskStateFactory.initTaskFromWork({...workTask, block_start: task_block_start}));
        }
    }

    /**
     * The clock a work task hashes against. Real work always uses the indexed
     * record; a GRASS clock is only a prompt to fetch it.
     *
     * @param {Work} workTask
     * @param {number|null} block_start
     * @return {number|string|null}
     */
    taskBlockStart(workTask, block_start) {
        return workTask.block_start;
    }

    /**
     * Requests the player's outstanding work, sharing one request between
     * concurrent callers so a block that changes both ore clocks, or a reconcile
     * landing alongside one, only asks once.
     *
     * @return {Promise<Work[]>}
     */
    fetchWork() {
        if (!this.work_request) {
            const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
            const address = this.gameState.signingAccount?.address;
            const session = this.workSession;
            this.work_request = this.guildAPI
                .getWorkByPlayerId(ownerId)
                .then(work => {
                    if (
                        session !== this.workSession
                        || ownerId !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
                        || address !== this.gameState.signingAccount?.address
                        || this.gameState.isSessionCurrent?.() === false
                    ) {
                        throw new Error('Work session changed');
                    }
                    this.acceptWorkSnapshot(work, {ownerId, address, session});
                    return work;
                })
                .finally(() => {
                    if (session === this.workSession) {
                        this.work_request = null;
                    }
                });
        }

        return this.work_request;
    }

    /**
     * Refuses a work snapshot older than, or conflicting with, the one already
     * applied, then records it as the current snapshot.
     *
     * @param {Work[]} work
     * @param {{ownerId: string, address: string, session: number}} scope
     */
    acceptWorkSnapshot(work, scope) {
        const {ownerId} = scope;
        const meta = work.snapshot_meta;
        validateReadSnapshot(
            meta,
            {
                chainId: CHAIN.ID,
                height: maxQueryHeight(meta?.observed_tip, this.gameState.currentBlockHeight || meta?.observed_tip),
            },
            ['work']
        );
        const height = BigInt(meta.height);
        if (
            height < this.workHeightFloor
            || (this.workSnapshot?.ownerId === ownerId && height < BigInt(this.workSnapshot.height))
        ) {
            throw new Error('Work snapshot is older than the current state');
        }
        const rows = JSON.stringify(work
            .map(({snapshot_meta, ...item}) => item)
            .sort((a, b) => a.object_id < b.object_id ? -1 : a.object_id > b.object_id ? 1 : 0));
        if (
            this.workSnapshot?.ownerId === ownerId
            && this.workSnapshot.height === meta.height
            && this.workSnapshot.rows !== rows
        ) {
            throw new Error('Work snapshot changed at the same height');
        }
        this.workSnapshot = {ownerId, height: meta.height, rows};
        work.workSession = scope;
    }

    /**
     * @param {Work[]} work
     * @return {boolean} whether the work came from the current session and is the latest applied snapshot
     */
    isWorkCurrent(work) {
        const scope = work.workSession;
        return scope?.session === this.workSession
            && scope.ownerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
            && scope.address === this.gameState.signingAccount?.address
            && this.gameState.isSessionCurrent?.() !== false
            && work.snapshot_meta?.height === this.workSnapshot?.height;
    }

    /**
     * Requires the next accepted work snapshot to be at least as new as the
     * current block.
     */
    requireObservedWork() {
        const height = BigInt(this.gameState.currentBlockHeight);
        if (height > this.workHeightFloor) {
            this.workHeightFloor = height;
        }
    }

    /**
     * Drops every task, request and proof observer belonging to the current
     * session, so nothing from it can act after sign-out or a player change.
     */
    closeSession() {
        this.workSession++;
        this.proofController.abort();
        this.proofController = new AbortController();
        this.proofObservers.clear();
        this.proofRetryNeeded = false;
        this.work_request = null;
        this.outstanding_work_lookup = null;
        this.workSnapshot = null;
        this.workHeightFloor = 0n;
        this.refine_work_lookups_remaining = 0;
        this.held_ore_clocks = {};
        this.setManagerStatus(TASK_MANAGER_STATUS.OFFLINE);
        for (const process of Object.values(this.processes)) {
            process.clearWorker();
        }
        this.processes = {};
        this.waiting_queue = [];
        this.running_queue = [];
    }

    /**
     * Starts looking for the refine work that stored ore rising from zero
     * makes available.
     *
     * Extracting ore leaves the refine clock alone, so no clock event follows
     * to start the refineries and only the work list knows. The ore change can
     * reach the browser before the indexer lists that work, so the lookup is
     * repeated on the next few blocks until a refine task is running.
     *
     * Only refine work is synced. The mine clock moves in the same block as the
     * ore, and the work record may still carry the old one.
     */
    awaitRefineWork() {
        this.refine_work_lookups_remaining = TASK.REFINE_WORK_LOOKUP_BLOCKS;
        this.lookForAwaitedRefineWork();
    }

    /**
     * @return {Promise<void>}
     */
    lookForAwaitedRefineWork() {
        if (this.refine_work_lookups_remaining <= 0) {
            return Promise.resolve();
        }

        if (this.getProcessIdsByType(TASK_TYPES.REFINE).length) {
            this.refine_work_lookups_remaining = 0;
            return Promise.resolve();
        }

        this.refine_work_lookups_remaining--;

        return this.fetchWork()
            .then((work) => this.startAwaitedRefineWork(work))
            .catch((error) => {
                console.warn('[TaskManager] could not look for refine work:', error);
            });
    }

    /**
     * @param {Work[]} work
     */
    startAwaitedRefineWork(work) {
        // A refine task started while the request was out runs on the clock
        // GRASS reported, which leads the work record.
        if (this.getProcessIdsByType(TASK_TYPES.REFINE).length) {
            return;
        }

        this.syncOreTasks(TASK_TYPES.REFINE, work);
    }

    /**
     * Picks up outstanding work the player isn't running yet, such as refining
     * that only became possible once ore changed hands during a raid.
     *
     * A complete snapshot reconciles removals as well as new work. Ore tasks
     * additionally depend on the planet's shared clocks and raid state.
     *
     * @return {Promise<boolean>} false when no current work snapshot was available
     */
    async spawnOutstandingWork() {
        if (!this.outstanding_work_lookup) {
            const session = this.workSession;
            this.outstanding_work_lookup = this.fetchAndSpawnOutstandingWork()
                .then(() => true)
                .catch((error) => {
                    console.warn('[TaskManager] could not pick up outstanding work:', error);
                    return false;
                })
                .finally(() => {
                    if (session === this.workSession) {
                        this.outstanding_work_lookup = null;
                    }
                });
        }

        return this.outstanding_work_lookup;
    }

    /**
     * @return {Promise<void>}
     */
    async fetchAndSpawnOutstandingWork() {
        const work = await this.fetchWork();
        if (!this.isWorkCurrent(work)) {
            return;
        }

        const identities = new Set(work.map(item => item.object_id));
        for (const [pid, process] of Object.entries(this.processes)) {
            if (!ORE_TASK_TYPES.includes(process.state.task_type) && !identities.has(pid)) {
                this.terminate(pid);
            }
        }

        work.forEach((workTask) => {
            // Ore work runs off the planet's shared clock and is reconciled
            // below, where the stops this pass cannot see are handled too.
            if (ORE_TASK_TYPES.includes(workTask.category)) {
                return;
            }

            const task = this.taskStateFactory.initTaskFromWork(workTask);

            // A raid task may only run while the targeted planet's shield is
            // vulnerable. The backend work record can persist outside that
            // window, so don't restore a raid task whose planet is no longer
            // SHIELDS_VULNERABLE.
            if (
                task.task_type === TASK_TYPES.RAID
                && !this.isRaidTaskShieldVulnerable(task)
            ) {
                this.terminate(task.getPID());
                return;
            }

            this.spawn(task);
        });

        for (const taskType of ORE_TASK_TYPES) {
            this.syncOreTasks(taskType, work, this.consumeHeldOreClock(taskType));
        }
    }

    /**
     * Takes back the ore clock that was held while the planet was raided. The
     * chain announces a given clock once, so this is the only copy of it and it
     * leads whatever the indexer has written.
     *
     * @param {string} taskType see ORE_TASK_TYPES
     * @return {number|null}
     */
    consumeHeldOreClock(taskType) {
        const block_start = this.held_ore_clocks[taskType] ?? null;
        delete this.held_ore_clocks[taskType];

        return block_start;
    }

    /**
     * Determines whether the planet targeted by a raid task currently has a
     * vulnerable shield, which is the only state in which the raid task is
     * allowed to run.
     *
     * @param {TaskState} task
     * @return {boolean}
     */
    isRaidTaskShieldVulnerable(task) {
        const raidInfo = this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo;
        return (
            raidInfo.planet_id === task.target_id
            && raidInfo.status === RAID_STATUS.SHIELDS_VULNERABLE
        );
    }
}
