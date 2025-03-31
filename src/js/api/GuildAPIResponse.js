export class GuildAPIResponse {

  constructor(
    success = false,
    errors = [],
    data = null
  ) {
    this.success = success;
    this.errors = errors;
    this.data = data;
  }
}