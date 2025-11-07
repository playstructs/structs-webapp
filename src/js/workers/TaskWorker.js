
import {TASK_MESSAGE_TYPES} from "../constants/TaskMessageTypes";
import {TASK_STATUS} from "../constants/TaskStatus";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskState} from "../models/TaskState"

let state = null;
let config = null;
let pid = null;

const taskStateFactory = new TaskStateFactory();

onmessage =  function(process_request) {
    console.log('New Process Request');

    const msg_type = process_request.data[0];

    switch (msg_type) {
        case TASK_MESSAGE_TYPES.START:
            pid = process_request.data[1];
            state = taskStateFactory.make(process_request.data[2]);
            config = process_request.data[3];

            postMessage([pid, TASK_MESSAGE_TYPES.STARTED]);
            work();
            break;

        case TASK_MESSAGE_TYPES.PAUSE:
            postMessage([pid, TASK_MESSAGE_TYPES.COMMIT, state]);
            postMessage([pid, TASK_MESSAGE_TYPES.PAUSED]);
            break;

        case TASK_MESSAGE_TYPES.COMMIT:
            postMessage([pid, TASK_MESSAGE_TYPES.COMMIT, state]);
            break;

        case TASK_MESSAGE_TYPES.BLOCK_UPDATE:
            const block = process_request.data[1];
            state.setBlockCurrent(block);
            break;

        default:
            console.debug('[' + pid + '] Why is this in my worker?');
    }
}

function work() {
    // TODO work in the target difficulty start parameter, but this might be better outside the worker.

    while (true) {
        sha256().then(hashCheck);
    }
}

async function sha256() {
    const nonce = state.getNextNonce();
    const message = state.getMessage(nonce);

    /* unapologetic slop */

    // Encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // Hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // Convert ArrayBuffer -> byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { "nonce":nonce, "message":message, "hash": hashHex };
}

const hashCheck = function (hash_result) {
    console.log(hash_result);

    const difficulty = state.getCurrentDifficulty()

    for (let position = 1; position <= difficulty; position++) {
        if (hash_result.hash[position - 1] !== "0") {
            return false;
        }
    }

    postMessage([pid, TASK_MESSAGE_TYPES.COMPLETED, hash_result.nonce]);
};

