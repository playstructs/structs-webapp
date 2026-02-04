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

  lock() {
    this.locked = true;

    // Refresh the action bar to show the executing progress bar
    HUDViewModel.refreshActionBar();
  }

  /**
   * @param {boolean} refreshActionBar
   */
  unlock(refreshActionBar = true) {
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
    this.unlock(refreshActionBar);
    this.setActionSourceStruct(null);
    this.setCurrentAction('');
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