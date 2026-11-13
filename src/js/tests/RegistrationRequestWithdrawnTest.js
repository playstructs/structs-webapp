import {DTest, DTestSuite} from "../framework/DTestFramework";
import {requestWasWithdrawn} from "../util/RegistrationCompletion";

export class RegistrationRequestWithdrawnTest extends DTestSuite {

  constructor() {
    super('RegistrationRequestWithdrawnTest');
  }

  withdrawnTest = new DTest('withdrawnTest', function(params) {
    this.assertEquals(String(requestWasWithdrawn(params.response, {playerId: '1-5'})), params.expected);
  }, function() {
    const status = (data) => ({data: {indexed: null, chain: {registered_player_id: ''}, ...data}});
    return [
      // Denied, failed or expired: the request is gone and nothing registered the address.
      {response: status({pending: false}), expected: 'true'},
      {response: status({pending: false, chain: null}), expected: 'true'},
      // Still waiting for the logged-in device.
      {response: status({pending: true}), expected: 'false'},
      // A server that does not report the request never ends the wait.
      {response: status({}), expected: 'false'},
      {response: status({pending: null}), expected: 'false'},
      // Indexing the registration removes the pending row too.
      {response: status({pending: false, indexed: {address: 'structs1abc', status: 'approved'}}), expected: 'false'},
      // Registered on chain but not indexed yet.
      {response: status({pending: false, chain: {registered_player_id: '1-5'}}), expected: 'false'},
      {response: null, expected: 'false'},
      {response: {}, expected: 'false'},
    ];
  });
}
