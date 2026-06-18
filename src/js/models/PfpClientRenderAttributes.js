export class PfpClientRenderAttributes {

  /**
   * @param {number|null} head
   * @param {number|null} neck
   * @param {number|null} body
   * @param {number|null} arms
   * @param {number|null} background
   */
  constructor(
    head = null,
    neck = null,
    body = null,
    arms = null,
    background = null
  ) {
    this.head = head;
    this.neck = neck;
    this.body = body;
    this.arms = arms;
    this.background = background;
  }

  /**
   * Builds a PfpClientRenderAttributes instance from a JSON string, a plain
   * object, or null. Returns null when the input is empty or cannot be parsed.
   *
   * @param {string|object|null} value
   * @return {PfpClientRenderAttributes|null}
   */
  static fromJson(value) {
    if (value === null || value === undefined) {
      return null;
    }

    let obj = value;

    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        return null;
      }
      try {
        obj = JSON.parse(value);
      } catch (e) {
        return null;
      }
    }

    if (!obj || typeof obj !== 'object') {
      return null;
    }

    return new PfpClientRenderAttributes(
      obj.head ?? null,
      obj.neck ?? null,
      obj.body ?? null,
      obj.arms ?? null,
      obj.background ?? null
    );
  }
}
