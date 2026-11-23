import {DTest, DTestSuite} from "../framework/DTestFramework";
import {SectorBlitzFormat} from "../util/SectorBlitzFormat";
import {SectorBlitzManager} from "../managers/SectorBlitzManager";
import {SECTOR_BLITZ, SECTOR_BLITZ_PHASES} from "../constants/SectorBlitzConstants";
import {SectorBlitzDialogueSequence} from "../view_models/components/sequences/SectorBlitzDialogueSequence";
import {RaidTarget} from "../util/RaidTarget";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";
import {GuildAPI} from "../api/GuildAPI";
import {SectorBlitzHTML} from "../view_models/sector_blitz/SectorBlitzHTML";

/**
 * A manager whose phase can be evaluated without the flag, a session or live updates.
 */
class TestSectorBlitzManager extends SectorBlitzManager {
  constructor(height, contests) {
    super({currentBlockHeight: height}, null, null);
    this.contests = contests;
  }
  isEnabled() { return true; }
  isSignedIn() { return true; }
  restartLiveUpdates() {}
}

const contest = (id, start, end) => ({contest_id: `${id}`, start_height: `${start}`, end_height: `${end}`, source_height: '0'});

export class SectorBlitzTest extends DTestSuite {

  constructor() {
    super('SectorBlitzTest');
  }

  pointsTest = new DTest('pointsTest', function(params) {
    this.assertEquals(SectorBlitzFormat.points(params.value), params.expected);
  }, function() {
    return [
      {value: '0', expected: '0'},
      {value: '920', expected: '920'},
      {value: '1100', expected: '1.1k'},
      {value: '6300', expected: '6.3k'},
      {value: '10100', expected: '10.1k'},
      {value: '10000', expected: '10k'},
      {value: '123456', expected: '123k'},
      {value: '2500000', expected: '2.5M'},
    ];
  });

  rankTest = new DTest('rankTest', function(params) {
    this.assertEquals(SectorBlitzFormat.rank(params.rank), params.expected);
  }, function() {
    return [
      {rank: '1', expected: '#001'},
      {rank: '99', expected: '#099'},
      {rank: '1234', expected: '#1234'},
      {rank: null, expected: ''},
    ];
  });

  remainingTest = new DTest('remainingTest', function(params) {
    this.assertEquals(SectorBlitzFormat.remaining(params.ms), params.expected);
  }, function() {
    const minute = 60 * 1000;
    return [
      {ms: 0, expected: '0D 0H 0M'},
      {ms: ((4 * 24 + 23) * 60 + 16) * minute + 59000, expected: '4D 23H 16M'},
      {ms: -5, expected: '0D 0H 0M'},
    ];
  });

  escapeTest = new DTest('escapeTest', function() {
    this.assertEquals(SectorBlitzFormat.escape('<b>"Bone" & Co\'</b>'), '&lt;b&gt;&quot;Bone&quot; &amp; Co&#39;&lt;/b&gt;');
  });

  phaseTest = new DTest('phaseTest', function(params) {
    const manager = new TestSectorBlitzManager(params.height, [contest(1, 100, 200), contest(2, 1000, 2000)]);
    const {phase, contest: current} = manager.evaluatePhase();
    this.assertEquals(phase, params.phase);
    this.assertEquals(current?.contest_id ?? null, params.contestId);
  }, function() {
    const resultsBlocks = SECTOR_BLITZ.RESULTS_DISPLAY_BLOCKS;
    return [
      {height: 99, phase: SECTOR_BLITZ_PHASES.NONE, contestId: null},
      {height: 100, phase: SECTOR_BLITZ_PHASES.ACTIVE, contestId: '1'},
      {height: 199, phase: SECTOR_BLITZ_PHASES.ACTIVE, contestId: '1'},
      {height: 200, phase: SECTOR_BLITZ_PHASES.RESULTS, contestId: '1'},
      // A new contest takes over from the previous one's results.
      {height: 1000, phase: SECTOR_BLITZ_PHASES.ACTIVE, contestId: '2'},
      {height: 2000 + resultsBlocks - 1, phase: SECTOR_BLITZ_PHASES.RESULTS, contestId: '2'},
      {height: 2000 + resultsBlocks, phase: SECTOR_BLITZ_PHASES.NONE, contestId: null},
    ];
  });

  resultsBlocksTest = new DTest('resultsBlocksTest', function() {
    // 14 days of 6 second blocks.
    this.assertEquals(SECTOR_BLITZ.RESULTS_DISPLAY_BLOCKS, 201600);
  });

  resultsCopyTest = new DTest('resultsCopyTest', function(params) {
    const sequence = SectorBlitzDialogueSequence.results(params.winners);
    const text = sequence.dialogueSequence[1].screenContent.replace(/<[^>]+>/g, '');
    this.assertEquals(text, params.expected);
  }, function() {
    return [
      {
        winners: [{name: 'Challenge, Inc.', sectors: [44]}],
        expected: 'Challenge, Inc. used the opportunity to establish a firm grasp on key galactic sectors, securing sector 044.'
      },
      {
        winners: [{name: 'Challenge, Inc.', sectors: [44, 999]}],
        expected: 'Challenge, Inc. used the opportunity to establish a firm grasp on key galactic sectors, securing sectors 044 and 999.'
      },
      {
        winners: [{name: 'Challenge, Inc.', sectors: [44, 127, 999]}],
        expected: 'Challenge, Inc. used the opportunity to establish a firm grasp on key galactic sectors, securing sector 044, 127, and 999.'
      },
      {
        winners: [{name: 'Challenge, Inc.', sectors: [44]}, {name: 'SN.Corporation', sectors: [127]}],
        expected: 'Challenge, Inc. used the opportunity to establish a firm grasp on galactic sector 044 while SN.Corporation secured sector 127.'
      },
    ];
  });

  raidTargetTest = new DTest('raidTargetTest', function(params) {
    this.assertEquals(RaidTarget.buttonLabel(params.target), params.expected);
  }, function() {
    return [
      {target: {planet_id: '2-1', under_attack: 0}, expected: 'Raid'},
      {target: {planet_id: '2-1', under_attack: '1'}, expected: 'View'},
      {target: {planet_id: '2-1', under_attack: true}, expected: 'View'},
      {target: {planet_id: null, under_attack: false}, expected: 'View'},
    ];
  });

  publicGuildRowTest = new DTest('publicGuildRowTest', function(params) {
    const html = SectorBlitzHTML.publicGuildRowHTML({
      guild_id: '0-1', points: '1100', sectors_controlled: params.sectors, rank: params.rank, profile: params.profile,
    });
    const shown = [...html.matchAll(/data-sui-tooltip="([^"]*)"[^>]*>\s*<span>([^<]*)<\/span>/g)].map(match => [match[1], match[2]]);
    this.assertEquals(JSON.stringify(shown), JSON.stringify([
      ['Sectors Controlled', params.expectedSectors],
      ['Influence Points', '1.1k'],
      ['Position', params.expectedRank],
    ]));
  }, function() {
    return [
      {sectors: 2, rank: '1', profile: {name: 'SN.Corporation'}, expectedSectors: '2', expectedRank: '#001'},
      {sectors: 0, rank: '12', profile: {name: 'SN.Corporation'}, expectedSectors: '0', expectedRank: '#012'},
      {sectors: 0, rank: '1234', profile: null, expectedSectors: '0', expectedRank: '#1234'},
    ];
  });

  playerSearchCoversEverySectorTest = new DTest('playerSearchCoversEverySectorTest', function(params) {
    const scan = new ScanViewModel({}, null, {sector: 4});
    scan.isContest = params.isContest;
    scan.contestId = params.isContest ? '7' : null;

    const request = scan.buildPlayerSearchRequest('1-61');
    const query = GuildAPI.prototype.buildRaidSearchParams.call(null, request);
    this.assertEquals(query.get('search_string'), '1-61');
    this.assertEquals(query.has('sector'), false);
    this.assertEquals(query.get('contest_id'), params.expectedContestId);

    // Back from the results still returns to the Scan for the Sector Map's sector.
    this.assertEquals(new ScanViewModel({}, null, request).sector, params.expectedBackSector);
  }, function() {
    return [
      {isContest: true, expectedContestId: '7', expectedBackSector: 4},
      {isContest: false, expectedContestId: null, expectedBackSector: null},
    ];
  });
}
