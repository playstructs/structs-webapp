import {TASK} from "../constants/TaskConstants";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import { sha256 } from "js-sha256";

let state = null;

const taskStateFactory = new TaskStateFactory();

onmessage =  async function(process_request) {
    state = taskStateFactory.make(process_request.data[0]);

    /*
        If the state is starting, then start the task in a waiting state.
        Otherwise, if it's been passed as "Running" already, then force it
        to begin hashing even if difficulty is too high.
     */
    if (state.status === TASK_STATUS.STARTING){
        state.setStatus(TASK_STATUS.WAITING);
        postMessage([state]);
    }
    console.log('Start Process Request ' + state.getPID());
    await work();
}

async function work() {
    let difficulty = state.getCurrentDifficulty();

    if (state.status === TASK_STATUS.WAITING){
        while (difficulty > TASK.DIFFICULTY_START) {
            console.log('Web Worker chilling because difficulty of task is too high: ' + difficulty + ' > ' + TASK.DIFFICULTY_START);
            await new Promise(r => setTimeout(r, TASK.DIFFICULTY_START_SLEEP_DELAY));
            difficulty = state.getCurrentDifficulty();
        }
        state.setStatus(TASK_STATUS.RUNNING);
        postMessage([state]);
    }

    let sessionIterations = 1;
    while (true) {
        const nonce = state.getNextNonce();
        const message = state.getMessage(nonce);
        const hash = sha256(message);

        if (difficultyCheck(hash, difficulty)){
            state.setResult(nonce, message, hash, difficulty);
            postMessage([state]);
            break;
        }

        if (state.iterations % TASK.CHECKPOINT_COMMIT === 0) {
            state.iterations_since_last_start = sessionIterations;
            postMessage([state]);
        }

        if (state.iterations % TASK.DIFFICULTY_RECALCULATE === 0) {
            difficulty = state.getCurrentDifficulty();

            // Check to see if a previous hash result is now relevant again
            if (state.result_exists && state.result_difficulty >= difficulty) {
                state.setPreviousResult(difficulty);
                postMessage([state]);
                break;
            }
        }
        sessionIterations++;
    }
}

function difficultyCheck(hash, difficulty) {
    //console.log('dif' + difficulty + ' hash ' + hash)
    for (let position = 1; position <= difficulty; position++) {
        if (hash[position - 1] !== "0") {
            return false;
        }
    }
    return true;
}