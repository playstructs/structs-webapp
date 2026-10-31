import {TaskProcess} from '../../src/js/models/TaskProcess';
import {TaskStateFactory} from '../../src/js/factories/TaskStateFactory';
import {TASK_TYPES} from '../../src/js/constants/TaskTypes';
import {TASK_STATUS} from '../../src/js/constants/TaskStatus';
import {EVENTS} from '../../src/js/constants/Events';

// Exercises the browser's actual Worker loader without a wallet or RPC client.
if (!['127.0.0.1', 'localhost.'].includes(location.hostname)) throw new Error('Isolated localhost fixture required');
const status = document.getElementById('status');
const state = new TaskStateFactory().initStructTask('5-1', TASK_TYPES.BUILD, '3353000', '25');
state.nonce_start = 0;
state.nonce_current = 0;
state.setBlockCheckpoint('3353025');
const task = new TaskProcess(state);
const deadline = setTimeout(() => finish('FAILED: worker did not complete'), 15000);
function finish(message) {
  clearTimeout(deadline);
  task.clearWorker();
  window.removeEventListener(EVENTS.TASK_WORKER_CHANGED, changed);
  status.textContent = message;
}
function changed(event) {
  if (event.state.status === TASK_STATUS.TERMINATED) finish('FAILED: worker unavailable or incompatible');
  if (event.state.status !== TASK_STATUS.COMPLETED) return;
  const valid = state.isSameWork(event.state) && event.state.checkResultHashDifficulty();
  finish(valid ? 'PASSED: fingerprinted worker completed a valid proof. No chain transaction.' : 'FAILED: invalid proof');
}
window.addEventListener(EVENTS.TASK_WORKER_CHANGED, changed);
task.start();
