import {MenuPage} from './framework/MenuPage';
import {AuthController} from "./controllers/AuthController";
import {GameState} from "./models/GameState";
import {GuildAPI} from "./api/GuildAPI";
import {WalletManager} from "./managers/WalletManager";
import {AuthManager} from "./managers/AuthManager";
import {GrassManager} from "./framework/GrassManager";
import {BlockListener} from "./grass_listeners/BlockListener";
import {HUDViewModel} from "./view_models/HUDViewModel";
import {AccountController} from "./controllers/AccountController";

import { MsgPlanetExplore } from "./ts/structs.structs/types/structs/structs/tx";
import {SigningStargateClient} from "@cosmjs/stargate";
import { defaultRegistryTypes } from '@cosmjs/stargate';
import {Registry} from "@cosmjs/proto-signing";
// noinspection ES6PreferShortImport
import { msgTypes } from './ts/structs.structs/registry';
import { FEE } from "./constants/Fee";


// localStorage.clear();

const gameState = new GameState();
global.gameState = gameState;

const guildAPI = new GuildAPI();
global.guildAPI = guildAPI;

const walletManager = new WalletManager();
global.walletManager = walletManager;

const grassManager = new GrassManager(
  "ws://localhost:1443",
  "structs.>"
);
const authManager = new AuthManager(
  gameState,
  guildAPI,
  walletManager,
  grassManager
);

const blockListener = new BlockListener(gameState);

const authController = new AuthController(
  gameState,
  guildAPI,
  walletManager,
  authManager
);
const accountController = new AccountController(
  gameState,
  guildAPI,
  authManager
);

MenuPage.gameState = gameState;
MenuPage.router.registerController(authController);
MenuPage.router.registerController(accountController);
MenuPage.initListeners();

grassManager.registerListener(blockListener);
grassManager.init();

const hudContainer = document.getElementById('hud-container');

const hud = new HUDViewModel(gameState);
hudContainer.innerHTML = hud.render();
hud.initPageCode();

await gameState.load();
gameState.thisGuild = await guildAPI.getThisGuild();

if (gameState.lastSaveBlockHeight === 0) {
  MenuPage.router.goto('Auth', 'index');
} else {
  MenuPage.close();
  MenuPage.router.restore('Account', 'index');

  // TODO: Create separate signer class
  let wsUrl;
  let registry;
  let client;

  try {

    wsUrl = `ws://${window.location.hostname}:26657`;
    console.log("🌐 Connecting to chain at:", {wsUrl});

    console.log("✅ Tendermint client created");

    console.log('Creating registry...')
    registry = new Registry([...defaultRegistryTypes, ...msgTypes]);
    console.log('✅ Registry created')

    console.log("✍️ Creating signing client...");
    client = await SigningStargateClient.connectWithSigner(
      wsUrl,
      gameState.wallet,
      {
        registry,
      },
    );
    console.log("✅ Signing client created");
  } catch (error) {
    console.error("❌ Error during connection:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  try {

    console.log("🔄 Creating message...");
    const msg = {
      typeUrl: '/structs.structs.MsgPlanetExplore',
      value: MsgPlanetExplore.fromPartial({
        creator: gameState.thisPlayer.primary_address,
        playerId: gameState.thisPlayerId
      }),
    }

    console.log("📡 Broadcasting transaction...");
    console.log("Transaction details:", {
      address: gameState.thisPlayer.primary_address,
      message: msg,
      FEE
    });

    const result = await client.signAndBroadcast(
      gameState.thisPlayer.primary_address,
      [msg],
      FEE
    );

    console.log("✅ Transaction successful!");
    console.log("📋 Transaction result:", {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed,
      gasWanted: result.gasWanted
    });

  } catch (error) {
    console.error("❌ Error during signing/broadcasting:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}
