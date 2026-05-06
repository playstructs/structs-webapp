import {DoublyLinkedNode} from "./DoublyLinkedNode";

export class DoublyLinkedList {

  constructor() {
    /** @type {DoublyLinkedNode|null} */
    this.head = null;

    /** @type {DoublyLinkedNode|null} */
    this.tail = null;

    this.size = 0;
  }

  /**
   * @return {boolean}
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * @param {*} value
   */
  addToTail(value) {
    const node = new DoublyLinkedNode(value);

    if (this.isEmpty()) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.size++;
  }

  /**
   * @return {*|null}
   */
  removeFromHead() {
    if (this.isEmpty()) {
      return null;
    }

    const value = this.head.value;

    if (this.size === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }

    this.size--;
    return value;
  }
}
