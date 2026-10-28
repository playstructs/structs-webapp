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
      thisGuild: {join_infusion_minimum: 0, reactor_ratio: 1, default_commission: 0},
      keyPlayers: {[PLAYER_TYPES.PLAYER]: {player: {alpha: walletAlpha}}}
    };
    const viewModel = new ManageAlphaViewModel(gameState, null, null, null, {fuel: infusedAlpha});

    return {viewModel, addBtn};
  }

  canAddWalletAlphaOnTopOfInfusedAlphaTest = new DTest('canAddWalletAlphaOnTopOfInfusedAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, false);
  });

  canAddBackSubtractedInfusedAlphaTest = new DTest('canAddBackSubtractedInfusedAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 0);
    viewModel.alphaToInfuse = 3;

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, false);
  });

  addStopsAtInfusedPlusWalletAlphaTest = new DTest('addStopsAtInfusedPlusWalletAlphaTest', function() {
    const {viewModel, addBtn} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);
    viewModel.alphaToInfuse = 7;

    viewModel.postToggleRender();

    this.assertEquals(addBtn.disabled, true);
    this.assertEquals(viewModel.getMaxAlphaToInfuse(), 7);
  });

  // A string fuel would otherwise turn the save check into "4" !== 4.
  unchangedInfusionHidesSaveTest = new DTest('unchangedInfusionHidesSaveTest', function() {
    const {viewModel} = ManageAlphaInfusedTest.givenManageAlpha('4', 3);

    this.assertEquals(viewModel.alphaToInfuse === viewModel.infusedAlpha, true);
    this.assertEquals(viewModel.infusedAlpha, 4);
  });
}
