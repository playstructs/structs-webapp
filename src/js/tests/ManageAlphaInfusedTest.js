import {DTest, DTestSuite} from "../framework/DTestFramework";
import {ManageAlphaViewModel} from "../view_models/guild/ManageAlphaViewModel";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Covers the add button on Manage Alpha when the player already has alpha
 * infused. It used to be capped at the wallet balance alone, so a player with
 * 4 alpha infused and 3 in their wallet could not add any.
 */
export class ManageAlphaInfusedTest extends DTestSuite {

  constructor() {
    super('ManageAlphaInfusedTest');
  }

  static createElement() {
    const classSet = new Set();
    return {
      disabled: false,
      innerText: '',
      innerHTML: '',
      classList: {
        add: (name) => classSet.add(name),
        remove: (name) => classSet.delete(name),
        contains: (name) => classSet.has(name)
      }
    };
  }

  /**
   * @param {number|string} infusedAlpha as the API returns it
   * @param {number} walletAlpha
   * @return {{viewModel: ManageAlphaViewModel, addBtn: object}}
   */
  static givenManageAlpha(infusedAlpha, walletAlpha) {
    const addBtn = ManageAlphaInfusedTest.createElement();
    const elements = {'manage-alpha-add': addBtn};
    const other = ManageAlphaInfusedTest.createElement();

    global.document = {
      getElementById: (id) => elements[id] ?? other,
      querySelector: () => other
    };

    const gameState = {
      currentBlockHeight: 3353000,
      thisGuild: {join_infusion_minimum: 0, reactor_ratio: 1, default_commission: 0},
      keyPlayers: {[PLAYER_TYPES.PLAYER]: {player: {alpha: walletAlpha}}}
    };
    const viewModel = new ManageAlphaViewModel(gameState, null, null, {fuel: infusedAlpha});
    const whole = BigInt(infusedAlpha);
    viewModel.state = {protocol:'v0.22.0',height:'3353000',initialAlpha:whole,maxAlpha:whole+BigInt(walletAlpha),
      fuel:whole*1000000n,funds:BigInt(walletAlpha)*1000000n,ownerPower:whole*1000000n,
      minimum:0n,ratio:1n,commission:'0',source:'vault',
      positions:[{address:'vault',fuel:whole*1000000n,available:whole*1000000n,ownerPower:whole*1000000n}]};
    viewModel.ready = true;
    viewModel.infusedAlpha = whole;
    viewModel.alphaToInfuse = whole;

    return {viewModel, addBtn};
  }

  canAddWalletAlphaOnTopOfInfusedAlphaTest = new DTest('canAddWalletAlphaOnTopOfInfusedAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, false);
  });

  canAddBackSubtractedInfusedAlphaTest = new DTest('canAddBackSubtractedInfusedAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 0);
    viewModel.alphaToInfuse = 3n;

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, false);
  });

  addStopsAtInfusedPlusWalletAlphaTest = new DTest('addStopsAtInfusedPlusWalletAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);
    viewModel.alphaToInfuse = 7n;

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, true);
    this.assertEquals(viewModel.getMaxAlphaToInfuse().toString(), '7');
  });

  // A string fuel would otherwise turn the save check into "4" !== 4.
  unchangedInfusionHidesSaveTest = new DTest('unchangedInfusionHidesSaveTest', function() {
    const {viewModel} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);

    this.assertEquals(viewModel.alphaToInfuse === viewModel.infusedAlpha, true);
    this.assertEquals(viewModel.infusedAlpha.toString(), '4');
  });
}
