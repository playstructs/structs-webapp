import {Transaction} from "../models/Transaction";
import {AbstractFactory} from "../framework/AbstractFactory";

export class TransactionFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Transaction}
   */
  make(obj) {
    const transaction = new Transaction();
    Object.assign(transaction, obj);
    return transaction;
  }
}