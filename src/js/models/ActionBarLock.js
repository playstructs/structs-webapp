import {HUDViewModel} from "../view_models/HUDViewModel";
import {Struct} from "./Struct";

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
