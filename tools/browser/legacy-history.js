// Test-only page on the isolated real-stack origin. Never part of production.
export {};
if (location.hostname !== '127.0.0.1') throw new Error('Fixture requires localhost');
const fixture = await (await fetch('/js/fixture-public.json', {cache: 'no-store'})).json();
if (fixture.isolation !== 'structs-v022-browser') throw new Error('Wrong fixture origin');

const id = 'review2-legacy-unknown';
const queueKey = `signingQueue:ws://${location.host}/fixture/rpc:${fixture.actor}`;
const journalKey = `signingJournal:${fixture.chainId}:${fixture.actor}:${id}`;
const output = document.querySelector('pre');
const render = () => {
  const record = JSON.parse(localStorage.getItem(journalKey) || 'null');
  output.textContent = JSON.stringify({
    secureContext: isSecureContext,
    webLocks: typeof navigator.locks?.request === 'function',
    backupPresent: localStorage.getItem(queueKey + '.corrupt') !== null,
    historicalPhase: record?.phase ?? null,
    outcome: record?.transaction?.status ?? null,
    signedIdentity: !!record?.transaction?.submission,
  }, null, 2);
};
document.querySelector('button').onclick = () => {
  if (localStorage.getItem(queueKey + '.corrupt') !== null) {
    throw new Error('An existing backup must not be overwritten');
  }
  localStorage.setItem(queueKey + '.corrupt', JSON.stringify({
    version: 2, savedAt: 1, immediateQueue: [], actionQueue: [],
    inFlight: {
      id, accountAddress: fixture.actor, createdAt: 1, attempts: 1,
      status: 'in_flight', isAction: false,
      message: {typeUrl: '/structs.structs.MsgPlayerUpdateName',
        payload: {playerId: '1-1', name: 'ShouldNeverReplay'}},
    },
  }));
  render();
};
render();
