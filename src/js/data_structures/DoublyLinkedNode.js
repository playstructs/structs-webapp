export class DoublyLinkedNode {

  /**
   * @param {*} value
   */
  constructor(value) {
    this.value = value;

    /** @type {DoublyLinkedNode|null} */
    this.prev = null;

    /** @type {DoublyLinkedNode|null} */
    this.next = null;
  }
}
