export class NumberFormatter {

  constructor() {
    this.scale = {
      '1': 'k',
      '2': 'M',
      '3': 'G',
      '4': 'T',
      '5': 'P',
      '6': 'E',
      '7': 'Z',
      '8': 'Y',
      '9': 'R',
      '10': 'Q'
    }
  }

  /**
   * @param {number|string} number
   * @return {string}
   */
  format(number) {
    const intString = `${parseInt(`${number}`)}`;
    const numDigits = intString.length;

    if (numDigits <= 3) {
      return intString;
    }

    let remainderDigits = numDigits % 3;
    remainderDigits = remainderDigits === 0 ? 3 : remainderDigits;
    const scaleIndex = ((numDigits - remainderDigits) / 3);
    const unit = this.scale[scaleIndex];

    return intString.substring(0, remainderDigits) + unit;
  }

  /**
   * @param {number} ms milliseconds
   * @return {string}
   */
  formatMilliseconds(ms) {
    const timeParts = [];

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      timeParts.push `${hours}h`;
    }

    if (minutes > 0) {
      timeParts.push `${minutes}m`;
    }

    return timeParts.join(' ');
  }
}
