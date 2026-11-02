import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {sha256} from "js-sha256";

let state = null;
let revision = 0;
let scheduled = false;
const batchChannel = new MessageChannel();
batchChannel.port1.onmessage = work;
let sessionIterations = 0;
const taskStateFactory = new TaskStateFactory();

function publish() {
    postMessage({version: TASK.WORKER_VERSION, revision, state});
}

onmessage = function(process_request) {
    const request = process_request.data;
    if (request?.version !== TASK.WORKER_VERSION || !Number.isSafeInteger(request.revision)
        || request.revision <= revision) return;
    if (request.kind === 'start' && state === null) {
        state = taskStateFactory.make(request.state);
        if (state.status === TASK_STATUS.STARTING) state.setStatus(TASK_STATUS.WAITING);
    } else if (request.kind === 'update' && state?.isSameWork(request.state)) {
        state.updateRules(request.state);
        // A candidate found under an older rule remains useful, but must pass
        // the current rule before it can complete this task.
        if (state.isCompleted() && !state.checkResultHashDifficulty()) state.setStatus(TASK_STATUS.WAITING);
    } else {
        return;
    }
    revision = request.revision;
    publish();
    schedule();
};

function schedule() {
    if (!scheduled && !state.isCompleted()) {
        scheduled = true;
        // A posted task yields for rule updates without nested-timer clamping.
        batchChannel.port2.postMessage(null);
    }
}

function work() {
    scheduled = false;
    const difficulty = state.getCurrentDifficulty();
    if (state.result_exists && state.checkResultHashDifficulty()) {
        state.setPreviousResult(difficulty);
        publish();
        return;
    }
    // Only a received chain height/rule update wakes a waiting worker. Wall
    // time is useful for UI estimates, never for making a proof eligible.
    if (state.isWaiting()) {
        if (difficulty > TASK.DIFFICULTY_START) return;
        state.setStatus(TASK_STATUS.RUNNING);
        publish();
    }
    if (!state.isRunning()) return;
    const difficultyPrefix = '0'.repeat(difficulty);

    // Yield after bounded work so height, rule and cancellation messages can
    // be processed even while the current difficulty is too high to solve.
    for (let i = 0; i < TASK.HASH_BATCH_SIZE; i++) {
        const nonce = state.getNextNonce();
        const message = state.getMessage(nonce);
        const hash = sha256(message);
        state.iterations_since_last_start = ++sessionIterations;
        if (hash.startsWith(difficultyPrefix)) {
            state.setResult(nonce, message, hash, difficulty);
            publish();
            return;
        }
        if (state.iterations % TASK.CHECKPOINT_COMMIT === 0) publish();
    }
    schedule();
}
