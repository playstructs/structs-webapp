export class NotImplementedError extends Error {
  constructor(message= 'Function not implemented') {
    super(message);
    this.name = "NotImplementedError";
  }
}
