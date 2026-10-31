export class GuildAPIResponse {

  constructor(
    success = false,
    errors = [],
    data = null,
    meta = null,
    total = null
  ) {
    this.success = success;
    this.errors = errors;
    this.data = data;
    this.meta = meta;
    this.total = total;
  }
}