import {Transaction} from "../models/Transaction";

export class TransactionFactory {
  make(obj) {
    const transaction = new Transaction();
    Object.assign(transaction, obj);
    return transaction;
  }

  /**
   * @param {Object[]}list
   * @return {Transaction[]}
   */
  parseList(list) {
    return list.map(this.make);
  }
}