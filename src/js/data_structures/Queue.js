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

  /**
   * @param {function(*): boolean} predicate
   * @return {boolean}
   */
  some(predicate) {
    let node = this.list.head;
    while (node) {
      if (predicate(node.value)) {
        return true;
      }
      node = node.next;
    }
    return false;
  }
}
