import {GuildAPIResponse} from "../api/GuildAPIResponse";
import {GuildAPIError} from "../errors/GuildAPIError";

export class GuildAPIResponseFactory {
  make(jsonResponse) {
    if (!jsonResponse.hasOwnProperty('success')
      || typeof jsonResponse.success !== 'boolean'
      || !jsonResponse.hasOwnProperty('errors')
      || !jsonResponse.hasOwnProperty('data')
    ) {
      throw new GuildAPIError('Invalid response from server');
    }

    return new GuildAPIResponse(
      jsonResponse.success,
      jsonResponse.errors,
      jsonResponse.data
    );
  }
}