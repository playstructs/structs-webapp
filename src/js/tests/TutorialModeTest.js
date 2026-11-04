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

  laterOfferStartsTelemetrySessionTest = new DTest('laterOfferStartsTelemetrySessionTest', function() {
    TutorialModeTest.givenFreshBrowser();
    this.assertEquals(onboardingTelemetry.getSessionId(), null);

    onboardingTelemetry.recordNavigation('Auth', 'orientationEnd');
    this.assertEquals(onboardingTelemetry.getSessionId() !== null, true);
    this.assertEquals(sessionStorage.getItem('onboardingRecorded'), '["orientation.tutorial_offer|reached"]');

    // The launch reloads the page; the run carries on in the same session.
    const sessionId = onboardingTelemetry.getSessionId();
    TutorialMode.launch();
    this.assertEquals(onboardingTelemetry.getSessionId(), sessionId);

    onboardingTelemetry.endSession();
  });

  replayIsNotRecordedTest = new DTest('replayIsNotRecordedTest', function() {
    TutorialModeTest.givenFreshBrowser();
    onboardingTelemetry.startSession();

    TutorialMode.launch(true);
    onboardingTelemetry.recordNavigation('Tutorial', 'loading');

    this.assertEquals(onboardingTelemetry.getSessionId(), null);
    this.assertEquals(sessionStorage.getItem('onboardingRecorded'), null);
  });
}
