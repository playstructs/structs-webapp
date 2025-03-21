export class GuildAPIResponse {

  /**
   * @param {object} jsonResponse
   */
  constructor(jsonResponse) {
    this.success = jsonResponse.hasOwnProperty('success') ? jsonResponse.success : false;
    this.errors = jsonResponse.hasOwnProperty('errors') ? jsonResponse.errors : [];
    this.data = jsonResponse.hasOwnProperty('data') ? jsonResponse.data : null;
  }
}