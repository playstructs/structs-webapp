import {Transaction} from "../models/Transaction";
import {AbstractFactory} from "../framework/AbstractFactory";
import {legacyToBase, toBase} from "../util/Units";

export class TransactionFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Transaction}
   */
  make(obj) {
    const transaction = new Transaction();
    Object.assign(transaction, obj);

    const amountP = toBase(obj.amount_p);
    if (amountP != null) {
      transaction.amount_p = amountP;
      transaction.precise = true;
    } else {
      // Legacy display amount: scale by denom when known. Default ualpha (×1e6).
      const denom = obj.denom != null ? String(obj.denom) : '';
      let exponent = 6;
      if (denom === 'ore' || denom.startsWith('ore')) {
        exponent = 0;
      } else if (denom === 'milliwatt' || denom === 'mw') {
        exponent = 0;
      } else if (denom.startsWith('uguild') || denom.startsWith('guild')) {
        exponent = 6;
      }
      transaction.amount_p = legacyToBase(obj.amount, exponent);
      transaction.precise = false;
    }

    return transaction;
  }
}
