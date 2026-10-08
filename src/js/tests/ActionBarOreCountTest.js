import {DTest, DTestSuite} from "../framework/DTestFramework";
import {ActionBarComponent} from "../view_models/components/hud/ActionBarComponent";
import {KeyPlayer} from "../models/KeyPlayer";
import {Player} from "../models/Player";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Covers the ore counts on the action bar of a selected extractor or refinery.
 *
 * The action bar is set up once when the page loads, before anything is
 * selected, and the counts are only drawn once a struct is. The regression these
 * tests exist for is that the count listeners were only registered if a count
 * was already on the page at setup, so they never were, and a selected refinery
 * kept showing the ore it started with until it was selected again.
 */
export class ActionBarOreCountTest extends DTestSuite {

  constructor() {
    super('ActionBarOreCountTest');
  }

  /**
   * Stands up the action bar the way the HUD does on page load, when the only
   * element it reaches for is the portrait.
   *
   * @param {string} playerType
   * @return {{elements: Object<string, object>, keyPlayer: KeyPlayer, actionBar: ActionBarComponent}}
   */
  static givenActionBarSetUpOnPageLoad(playerType) {
    const elements = {
      [`${playerType}-action-bar-portrait`]: {addEventListener: () => {}}
    };

    global.document = {
      getElementById: (id) => elements[id] ?? null
    };

    const keyPlayer = new KeyPlayer(playerType, false);
    keyPlayer.player = new Player();
    keyPlayer.player.ore = 2;
    keyPlayer.planet = {undiscovered_ore: 10};

    const actionBar = new ActionBarComponent(
      {keyPlayers: {[playerType]: keyPlayer}},
      null,
      null,
      null,
      null,
      null,
      playerType,
      'left',
      `${playerType}-action-bar`
    );
    actionBar.initPageCode();

    return {elements: elements, keyPlayer: keyPlayer, actionBar: actionBar};
  }

  /**
   * Draws a property icon and its value, as selecting a struct does.
   *
   * @param {Object<string, object>} elements
   * @param {string} valueContainerId
   * @param {string} datasetKey
   * @param {number} value
   * @return {{icon: object, valueContainer: object}}
   */
  static whenPropertyIconIsDrawn(elements, valueContainerId, datasetKey, value) {
    const icon = {dataset: {suiCheatsheet: 'icon', [datasetKey]: `${value}`}};
    const valueContainer = {
      innerHTML: `${value}`,
      closest: (selector) => selector === '[data-sui-cheatsheet]' ? icon : null
    };
    elements[valueContainerId] = valueContainer;

    return {icon: icon, valueContainer: valueContainer};
  }

  refinedOreUpdatesTheSelectedRefineryTest = new DTest('refinedOreUpdatesTheSelectedRefineryTest', function() {
    const {elements, keyPlayer, actionBar} = ActionBarOreCountTest.givenActionBarSetUpOnPageLoad(PLAYER_TYPES.PLAYER);
    const {icon, valueContainer} = ActionBarOreCountTest.whenPropertyIconIsDrawn(
      elements,
      actionBar.oreReadyContainerId,
      'oreReady',
      2
    );

    keyPlayer.setOre(1);

    this.assertEquals(`${valueContainer.innerHTML}`, '1');
    // The cheatsheet reads the count off the icon rather than the value shown.
    this.assertEquals(`${icon.dataset.oreReady}`, '1');
  });

  minedOreUpdatesTheSelectedExtractorTest = new DTest('minedOreUpdatesTheSelectedExtractorTest', function() {
    const {elements, keyPlayer, actionBar} = ActionBarOreCountTest.givenActionBarSetUpOnPageLoad(PLAYER_TYPES.PLAYER);
    const {icon, valueContainer} = ActionBarOreCountTest.whenPropertyIconIsDrawn(
      elements,
      actionBar.undiscoveredOreContainerId,
      'undiscoveredOre',
      10
    );

    keyPlayer.setPlanet({undiscovered_ore: 9});

    this.assertEquals(`${valueContainer.innerHTML}`, '9');
    this.assertEquals(`${icon.dataset.undiscoveredOre}`, '9');
  });

  // Nothing is selected, so there is nothing to update.
  oreChangeWithNothingSelectedIsHarmlessTest = new DTest('oreChangeWithNothingSelectedIsHarmlessTest', function() {
    const {keyPlayer} = ActionBarOreCountTest.givenActionBarSetUpOnPageLoad(PLAYER_TYPES.PLAYER);

    keyPlayer.setOre(1);

    this.assertEquals(keyPlayer.player.ore, 1);
  });

  // Each key player has its own action bar, drawn with its own ids.
  anotherPlayersOreLeavesTheCountAloneTest = new DTest('anotherPlayersOreLeavesTheCountAloneTest', function() {
    const {elements, actionBar} = ActionBarOreCountTest.givenActionBarSetUpOnPageLoad(PLAYER_TYPES.PLAYER);
    const {valueContainer} = ActionBarOreCountTest.whenPropertyIconIsDrawn(
      elements,
      actionBar.oreReadyContainerId,
      'oreReady',
      2
    );

    const raidEnemy = new KeyPlayer(PLAYER_TYPES.RAID_ENEMY, false);
    raidEnemy.player = new Player();
    raidEnemy.player.ore = 5;
    raidEnemy.setOre(4);

    this.assertEquals(`${valueContainer.innerHTML}`, '2');
  });
}
