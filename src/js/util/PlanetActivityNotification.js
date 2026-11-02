import {isObjectId} from "./ExactInteger";
/** PostgreSQL NOTIFY sends only the event key when its payload exceeds 8 KB. */
export async function resolvePlanetActivityNotification(message, gameState) {
  if (message.stub !== true && message.stub !== 'true') return message;
  if (!message.subject?.startsWith('structs.planet.')) return message;
  const {planet_id:planet, player_id:player, time, category} = message;
  const seq = String(message.seq);
  if (!isObjectId(planet,2) || !isObjectId(player,1)
      || message.subject !== `structs.planet.${planet}.${player}`
      || !/^(0|[1-9][0-9]{0,9})$/.test(seq) || BigInt(seq) > 2147483647n
      || typeof time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(time)
      || typeof category !== 'string' || !/^[a-z_]+$/.test(category)) {
    throw new Error('Invalid planet activity notification key');
  }
  const account = gameState.signingAccount?.address;
  const current = () => gameState.signingAccount?.address === account && gameState.isSessionCurrent?.() !== false
    && Object.values(gameState.keyPlayers).some(key => key.id === player && key.getPlanetId?.() === planet);
  if (!current()) return null;
  const row = await gameState.guildAPI.getPlanetActivityEvent(planet,seq,time);
  if (!current()) return null;
  if (!row || row.planet_id !== planet || String(row.seq) !== seq || row.time !== time || row.category !== category
      || !row.detail || typeof row.detail !== 'object' || Array.isArray(row.detail)
      || !/^[1-9][0-9]*$/.test(String(row.block_height))) {
    throw new Error('Planet activity does not match its notification');
  }
  return {...row,subject:message.subject,player_id:player};
}
