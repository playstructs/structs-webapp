import {PERMISSIONS} from "../constants/Permissions";
import {normalizeMessagePayload} from "./MessagePayload";
import {registrationUint64} from "./RegistrationProof";

// Reviewed against v0.22's handlers and ante maps. Adding a builder here requires
// reviewing its semantics; the presence of a generated codec is not sufficient.
export const GAMEPLAY_PERMISSIONS = Object.freeze({
  '/structs.structs.MsgFleetMove': PERMISSIONS.PLAY,
  '/structs.structs.MsgPlanetExplore': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructActivate': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructAttack': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructBuildCancel': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructBuildInitiate': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructDeactivate': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructDefenseClear': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructDefenseSet': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructMove': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructStealthActivate': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructStealthDeactivate': PERMISSIONS.PLAY,
  '/structs.structs.MsgStructBuildComplete': PERMISSIONS.HASH_BUILD,
  '/structs.structs.MsgStructOreMinerComplete': PERMISSIONS.HASH_MINE,
  '/structs.structs.MsgStructOreRefineryComplete': PERMISSIONS.HASH_REFINE,
  '/structs.structs.MsgPlanetRaidComplete': PERMISSIONS.HASH_RAID,
  // Own-player editing and guild moderation have different permission paths.
  // The native handler, exercised by signed simulation, chooses the required bit.
  '/structs.structs.MsgPlayerUpdateName': null,
});

/** Immutable selection of an actor and message; no asset source is inferred. */
export function gameplayIntent(value) {
  const fields=['kind','version','ownerId','typeUrl','payload'];
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).length !== fields.length || Object.keys(value).some(key=>!fields.includes(key))
      || value.kind !== 'gameplay' || value.version !== 1 || typeof value.ownerId !== 'string'
      || !/^1-[1-9][0-9]{0,19}$/.test(value.ownerId) || !Object.hasOwn(GAMEPLAY_PERMISSIONS,value.typeUrl)) {
    throw new Error('Invalid gameplay intent');
  }
  registrationUint64(value.ownerId.slice(2));
  const payload=normalizeMessagePayload(value.typeUrl,value.payload);
  if (Object.hasOwn(payload,'creator')) throw new Error('Gameplay signer is selected by the queue');
  for (const item of Object.values(payload)) if (Array.isArray(item)) Object.freeze(item);
  return Object.freeze({...value,payload:Object.freeze(payload)});
}
