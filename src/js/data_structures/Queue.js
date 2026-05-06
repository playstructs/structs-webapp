import {DoublyLinkedList} from "./DoublyLinkedList";

export class Queue {

  constructor() {
    this.list = new DoublyLinkedList();
  }

  /**
   * @param {*} value
   */
  enqueue(value) {
    this.list.addToTail(value);
  }

  /**
   * @return {*|null}
   */
  dequeue() {
    return this.list.removeFromHead();
  }

  /**
   * @return {boolean}
   */
  isEmpty() {
    return this.list.isEmpty();
  }

  /**
   * @return {number}
   */
  getSize() {
    return this.list.size;
  }
}
