export class UserAgent {

  /**
   * @param {string} userAgent
   */
  constructor(userAgent) {
   this.userAgent = userAgent;
  }

  /**
   * @return {string}
   */
  getDeviceTypeAndOS() {
    const match = this.userAgent.match(/(?<=\()[^)]+/);
    return match ? match[0] : 'Unknown OS';
  }

  /**
   * Many browsers are Chrome based so always check this one last.
   *
   * @return {string|null}
   */
  isChrome() {
    return /(?<= )Chrome(?=\/)/i.test(this.userAgent)
      ? "Chrome Based"
      : null;
  }

  /**
   * @return {string|null}
   */
  isEdge() {
    return /(?<= )Edg(?=\/)/i.test(this.userAgent)
      ? "Edge"
      : null;
  }

  /**
   * @return {string|null}
   */
  isFirefox() {
    return /(?<= )Firefox(?=\/)/i.test(this.userAgent)
      ? "Firefox"
      : null;
  }

  /**
   * @return {string|null}
   */
  isOpera() {
    return /(?<= )OPR(?=\/)/i.test(this.userAgent)
      ? "Opera"
      : null;
  }

  /**
   * @return {string|null}
   */
  isSafari() {
    return /(?<= )Safari(?=\/)/i.test(this.userAgent) && !/(?<= )Chrome(?=\/)/i.test(this.userAgent)
      ? "Safari"
      : null;
  }

  /**
   * @return {string|null}
   */
  isSamsungBrowser() {
    return /(?<= )SamsungBrowser(?=\/)/i.test(this.userAgent)
      ? "Samsung"
      : null;
  }

  /**
   * If the browser is unrecognized just dump the user agent string without the device type and OS.
   *
   * @return {string}
   */
  isUnrecognizedBrowser() {
    const match = this.userAgent.match(/(?<=\) ).*/);
    return match ? match[0] : 'Unrecognized';
  }

  /**
   * @return {string}
   */
  getBrowser() {
    return this.isEdge()
      || this.isFirefox()
      || this.isOpera()
      || this.isSafari()
      || this.isSamsungBrowser()
      || this.isChrome()
      || this.isUnrecognizedBrowser();
  }
}