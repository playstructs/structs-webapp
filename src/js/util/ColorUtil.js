export class ColorUtil {
  /**
   * @param {string} address base36 address
   * @param {number} colorIndex which slice of the string to use for the color
   * @return {string}
   */
  getHexColorFromBase36Address(address, colorIndex) {
    const addressPartBase36 = address.substring(address.length - colorIndex * 5 - 5, address.length - colorIndex * 5);
    const addressPartBase16 = parseInt(addressPartBase36, 36).toString(16);
    const hexColor = addressPartBase16.slice(-6);
    return `#${hexColor}`;
  }
}