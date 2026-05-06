export class AnimationError extends Error {
  constructor(message, detail = {}) {
    super(message);
    this.detail = detail;
  }
}