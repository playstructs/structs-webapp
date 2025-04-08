import { Client } from "structs-client-ts";

//TODO: Awaiting working stargate ts client
/**
 * Server Client
 */
export class Server {
  constructor() {
    this.rpcEndpoint = "wss://0.0.0.0:3000";
    this.client = null;
  }

  init(wallet) {
    this.client = new Client(
      {
        apiURL: "http://localhost:1317",
        rpcURL: "http://localhost:26657",
        prefix: "structs"
      },
      wallet
    )
  }

}
