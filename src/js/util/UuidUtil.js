export class UuidUtil {

  /**
   * Generates a unique-enough id for client-side queue items.
   * Works in insecure contexts (plain http) and old browsers, unlike
   * crypto.randomUUID which requires a secure context.
   *
   * @return {string}
   */
  static generate() {
    const time = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 10);
    const rand2 = Math.random().toString(36).slice(2, 10);
    return `${time}-${rand}-${rand2}`;
  }
}
