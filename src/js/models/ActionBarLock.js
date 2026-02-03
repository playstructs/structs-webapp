export class ActionBarLock {

  constructor() {
    this.currentAction = '';
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
  }

  unlock() {
    this.locked = false;
  }

  /**
   * @return {boolean}
   */
  isLocked() {
    return this.locked;
  }

  clear() {
    this.unlock();
    this.setCurrentAction('');
  }

}