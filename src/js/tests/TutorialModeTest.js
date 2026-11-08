import {DTest, DTestSuite} from "../framework/DTestFramework";
import {TutorialMode} from "../tutorial/TutorialMode";
import {onboardingTelemetry} from "../telemetry/OnboardingTelemetry";

/**
 * Covers what TutorialMode remembers: whether the player should still be
 * offered the tutorial, whether a run is a replay from the Account menu, and
 * which runs telemetry records.
 */
export class TutorialModeTest extends DTestSuite {

  constructor() {
    super('TutorialModeTest');
  }

  static givenFreshBrowser() {
    const makeStorage = () => {
      const values = new Map();
      return {
        getItem: key => (values.has(key) ? values.get(key) : null),
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
      };
    };
    global.localStorage = makeStorage();
    global.sessionStorage = makeStorage();
    window.location = {reload: () => {}, href: 'http://localhost/', replace: () => {}};
  }

  undecidedUntilStartedOrSkippedTest = new DTest('undecidedUntilStartedOrSkippedTest', function() {
    TutorialModeTest.givenFreshBrowser();
    this.assertEquals(TutorialMode.isUndecided(), true);

    TutorialMode.markStarted();
    this.assertEquals(TutorialMode.isUndecided(), false);

    TutorialModeTest.givenFreshBrowser();
    TutorialMode.markSkipped();
    this.assertEquals(TutorialMode.isUndecided(), false);
  });

  replayLastsUntilExitTest = new DTest('replayLastsUntilExitTest', function() {
    TutorialModeTest.givenFreshBrowser();
    TutorialMode.launch(true);
    this.assertEquals(TutorialMode.isReplay(), true);

    // Restarting mid-run is still the same replay.
    TutorialMode.restart();
    this.assertEquals(TutorialMode.isReplay(), true);

    TutorialMode.exit(TutorialMode.EXIT_REPLAYED);
    this.assertEquals(TutorialMode.isReplay(), false);
    this.assertEquals(TutorialMode.consumeExited(), TutorialMode.EXIT_REPLAYED);
  });

  newPlayerLaunchIsNotAReplayTest = new DTest('newPlayerLaunchIsNotAReplayTest', function() {
    TutorialModeTest.givenFreshBrowser();
    TutorialMode.launch(true);
    TutorialMode.launch();
    this.assertEquals(TutorialMode.isReplay(), false);
  });

  laterOfferRecordsNothingUntilTakenTest = new DTest('laterOfferRecordsNothingUntilTakenTest', function() {
    TutorialModeTest.givenFreshBrowser();
    global.gameState = {keyPlayers: {player: {id: '1-101'}}};

    // Looking at the offer, or declining it, leaves no record.
    onboardingTelemetry.recordNavigation('Auth', 'orientationEnd', '1-101');
    onboardingTelemetry.skipped('orientation.tutorial_offer');
    this.assertEquals(onboardingTelemetry.getSessionId(), null);
    this.assertEquals(sessionStorage.getItem('onboardingQueue'), null);

    TutorialMode.launch();
    const sessionId = onboardingTelemetry.getSessionId();
    this.assertEquals(sessionId !== null, true);
    this.assertEquals(onboardingTelemetry.getContentVersion(), 'tutorial-4');
    this.assertEquals(sessionStorage.getItem('onboardingRecorded'), '["orientation.tutorial_offer|reached"]');

    // The offer links the session to the player; later steps don't repeat the id.
    onboardingTelemetry.recordNavigation('Tutorial', 'loading', '1-101');
    const queued = JSON.parse(sessionStorage.getItem('onboardingQueue'));
    this.assertEquals(queued[0].player_id, '1-101');
    this.assertEquals(queued[1].step_key, 'tutorial.loading');
    this.assertEquals(queued[1].player_id, undefined);
    this.assertEquals(onboardingTelemetry.getSessionId(), sessionId);

    delete global.gameState;
    onboardingTelemetry.endSession();
  });

  signupSessionCarriesOnIntoItsRunTest = new DTest('signupSessionCarriesOnIntoItsRunTest', function() {
    TutorialModeTest.givenFreshBrowser();
    onboardingTelemetry.recordNavigation('Auth', 'signupConnectingToCorporate1');
    const sessionId = onboardingTelemetry.getSessionId();
    onboardingTelemetry.recordNavigation('Auth', 'orientationEnd', '1-101');

    TutorialMode.launch();

    this.assertEquals(onboardingTelemetry.getSessionId(), sessionId);
    this.assertEquals(
      sessionStorage.getItem('onboardingRecorded'),
      '["signup.connecting|reached","orientation.tutorial_offer|reached"]'
    );

    onboardingTelemetry.endSession();
  });

  skipAfterSignupIsRecordedTest = new DTest('skipAfterSignupIsRecordedTest', function() {
    TutorialModeTest.givenFreshBrowser();
    onboardingTelemetry.recordNavigation('Auth', 'signupConnectingToCorporate1');
    onboardingTelemetry.skipped('orientation.tutorial_offer');
    const sessionId = onboardingTelemetry.getSessionId();
    this.assertEquals(onboardingTelemetry.hasRecorded('orientation.tutorial_offer', 'skipped'), true);

    // Changing their mind later is a run of its own.
    TutorialMode.launch();
    this.assertEquals(onboardingTelemetry.getSessionId() !== sessionId, true);

    onboardingTelemetry.endSession();
  });

  takingTheOfferAgainStartsANewRunTest = new DTest('takingTheOfferAgainStartsANewRunTest', function() {
    TutorialModeTest.givenFreshBrowser();
    TutorialMode.launch();
    onboardingTelemetry.recordNavigation('Tutorial', 'loading');
    const sessionId = onboardingTelemetry.getSessionId();

    TutorialMode.launch();

    this.assertEquals(onboardingTelemetry.getSessionId() !== sessionId, true);

    onboardingTelemetry.endSession();
  });

  replayIsItsOwnSessionTest = new DTest('replayIsItsOwnSessionTest', function() {
    TutorialModeTest.givenFreshBrowser();
    global.gameState = {keyPlayers: {player: {id: '1-101'}}};
    onboardingTelemetry.recordNavigation('Auth', 'signupConnectingToCorporate1');
    const signupSessionId = onboardingTelemetry.getSessionId();

    TutorialMode.launch(true);

    this.assertEquals(onboardingTelemetry.getSessionId() !== signupSessionId, true);
    this.assertEquals(onboardingTelemetry.getContentVersion(), 'tutorial-4-replay');

    // The reload's loading page is the step already recorded, with the real player.
    onboardingTelemetry.recordNavigation('Tutorial', 'loading', 'simulated-player');
    onboardingTelemetry.reached('tutorial.intro.welcome');
    const queued = JSON.parse(sessionStorage.getItem('onboardingQueue'));
    this.assertEquals(queued.map(event => event.step_key).join(), 'tutorial.loading,tutorial.intro.welcome');
    this.assertEquals(queued[0].player_id, '1-101');
    this.assertEquals(JSON.parse(onboardingTelemetry.buildBody(queued)).content_version, 'tutorial-4-replay');

    delete global.gameState;
    onboardingTelemetry.endSession();
  });

  loadingOnlyCarriesThePlayerInAReplayTest = new DTest('loadingOnlyCarriesThePlayerInAReplayTest', function() {
    TutorialModeTest.givenFreshBrowser();
    onboardingTelemetry.startSession();

    onboardingTelemetry.recordNavigation('Tutorial', 'loading', '1-101');

    this.assertEquals(JSON.parse(sessionStorage.getItem('onboardingQueue'))[0].player_id, undefined);

    onboardingTelemetry.endSession();
  });
}
