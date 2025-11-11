
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskState} from "../models/TaskState"
import { sha256 } from "js-sha256";
import {TASK as TASKS} from "../constants/TaskConstants";

let state = null;

const taskStateFactory = new TaskStateFactory();

onmessage =  function(process_request) {
    state = taskStateFactory.make(process_request.data[0]);
    state.setStatus(TASK_STATUS.RUNNING)
    console.log('Start Process Request ' + state.getPID());
    work();
}

function work() {
    let difficulty = state.getCurrentDifficulty();

    while (true) {
        const nonce = state.getNextNonce();
        const message = state.getMessage(nonce);
        const hash = sha256(message);

        if (difficultyCheck(hash, difficulty)){
            state.setResult(nonce, message, hash);
            postMessage([state]);
            break;
        }

        if (state.iterations % TASKS.CHECKPOINT_COMMIT === 0) {
            postMessage([state]);
        }

        if (state.iterations % TASKS.DIFFICULTY_RECALCULATE === 0) {
            difficulty = state.getCurrentDifficulty();
        }
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