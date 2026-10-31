import {HUDViewModel} from "../view_models/HUDViewModel";
import {Struct} from "./Struct";
import {TX_STATUS} from "./SigningTransaction";

export class ActionBarLock {

  constructor() {

    /** @type {string} See STRUCT_ACTIONS */
    this.currentAction = '';

    /** @type {Struct} The struct that is the source of this action. */
    this.actionSourceStruct = null;

    /** @type {boolean} */
    this.locked = false;
    this.operationController = null;
    this.completionManaged = false;
  }

  /**
   * @param {string} action
   */
  setCurrentAction(action) {
    if (this.locked) {
      console.warn(`Cannot set current action, ActionBarLock is locked for action ${this.currentAction}`);
    } else {
      this.currentAction = action;
    }
  }

  /**
   * @return {string}
   */
  getCurrentAction() {
    return this.currentAction;
  }

  lock({completionManaged = false} = {}) {
    this.operationController?.abort();
    this.operationController = new AbortController();
    this.completionManaged = completionManaged;
    this.locked = true;

    // Refresh the action bar to show the executing progress bar
    HUDViewModel.refreshActionBar();
    return this.operationController.signal;
  }

  /**
   * Hold the existing action control through enqueue and settlement. A refused
   * enqueue has no transaction event, so its caller must release this lock.
   * A late failure must never clear a different action selected in the meantime.
   *
   * @param {function(): Promise<SigningTransaction|object>} operation
   * @param {function(object): void} [onSuccess]
   * @return {Promise<boolean>}
   */
  async run(operation, onSuccess = () => {}) {
    const signal = this.lock({completionManaged: true});
    try {
      const transaction = await operation();
      if (signal.aborted) return false;
      if (transaction?.status !== TX_STATUS.SUCCEEDED) {
        this.clear();
        return false;
      }
      onSuccess(transaction);
      if (!signal.aborted) this.clear();
      return true;
    } catch (error) {
      if (!signal.aborted) {
        console.warn('[ActionBarLock] action was not completed:', error);
        this.clear();
      }
      return false;
    }
  }

  /**
   * @param {boolean} refreshActionBar
   */
  unlock(refreshActionBar = true) {
    this.operationController?.abort();
    this.completionManaged = false;
    this.locked = false;

    if (refreshActionBar) {
      // Refresh the action bar to end the executing progress bar and show the relevant action bar
      HUDViewModel.refreshActionBar();
    }
  }

  /**
   * @return {boolean}
   */
  isLocked() {
    return this.locked;
  }

  /**
   * @param {boolean} refreshActionBar
   */
  clear(refreshActionBar = true) {
    this.unlock(false);
    this.setActionSourceStruct(null);
    this.setCurrentAction('');
    if (refreshActionBar) HUDViewModel.refreshActionBar();
  }

  /** Notifications cannot settle an operation owned by a committed-result observer. */
  clearFromNotification() {
    if (!this.completionManaged) this.clear();
  }

  /**
   * @param {Struct} struct
   */
  setActionSourceStruct(struct) {
    this.actionSourceStruct = struct;
  }

  /**
   * @return {Struct}
   */
  getActionSourceStruct() {
    return this.actionSourceStruct;
  }

}
