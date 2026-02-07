export class AmbitUtil {

  /**
   * @param {string[]} ambitArray
   * @param {string} targetAmbit
   * @param {string|null} localAmbit
   * @return {boolean}
   */
  contains(ambitArray, targetAmbit, localAmbit = null) {
    targetAmbit = targetAmbit.toLowerCase();
    localAmbit = localAmbit ? localAmbit.toLowerCase() : '';

    return !!ambitArray.find(ambit => {
      ambit = ambit.toLowerCase();
      return ambit === targetAmbit
      || (ambit === 'local' && localAmbit && localAmbit === targetAmbit)
    });
  }

}