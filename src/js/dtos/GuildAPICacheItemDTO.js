export class GuildAPICacheItemDTO {
  constructor(value) {
    this.value = value;
    this.timestamp = Date.now();
  }
}