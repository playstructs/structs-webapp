// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               unknown
// source: structs/structs/keys.proto

/* eslint-disable */

export const protobufPackage = "structs.structs";

export enum objectType {
  guild = 0,
  player = 1,
  planet = 2,
  reactor = 3,
  substation = 4,
  struct = 5,
  allocation = 6,
  infusion = 7,
  address = 8,
  fleet = 9,
  provider = 10,
  agreement = 11,
  UNRECOGNIZED = -1,
}

export function objectTypeFromJSON(object: any): objectType {
  switch (object) {
    case 0:
    case "guild":
      return objectType.guild;
    case 1:
    case "player":
      return objectType.player;
    case 2:
    case "planet":
      return objectType.planet;
    case 3:
    case "reactor":
      return objectType.reactor;
    case 4:
    case "substation":
      return objectType.substation;
    case 5:
    case "struct":
      return objectType.struct;
    case 6:
    case "allocation":
      return objectType.allocation;
    case 7:
    case "infusion":
      return objectType.infusion;
    case 8:
    case "address":
      return objectType.address;
    case 9:
    case "fleet":
      return objectType.fleet;
    case 10:
    case "provider":
      return objectType.provider;
    case 11:
    case "agreement":
      return objectType.agreement;
    case -1:
    case "UNRECOGNIZED":
    default:
      return objectType.UNRECOGNIZED;
  }
}

export function objectTypeToJSON(object: objectType): string {
  switch (object) {
    case objectType.guild:
      return "guild";
    case objectType.player:
      return "player";
    case objectType.planet:
      return "planet";
    case objectType.reactor:
      return "reactor";
    case objectType.substation:
      return "substation";
    case objectType.struct:
      return "struct";
    case objectType.allocation:
      return "allocation";
    case objectType.infusion:
      return "infusion";
    case objectType.address:
      return "address";
    case objectType.fleet:
      return "fleet";
    case objectType.provider:
      return "provider";
    case objectType.agreement:
      return "agreement";
    case objectType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum gridAttributeType {
  ore = 0,
  fuel = 1,
  capacity = 2,
  load = 3,
  structsLoad = 4,
  power = 5,
  connectionCapacity = 6,
  connectionCount = 7,
  allocationPointerStart = 8,
  allocationPointerEnd = 9,
  proxyNonce = 10,
  lastAction = 11,
  nonce = 12,
  ready = 13,
  checkpointBlock = 14,
  UNRECOGNIZED = -1,
}

export function gridAttributeTypeFromJSON(object: any): gridAttributeType {
  switch (object) {
    case 0:
    case "ore":
      return gridAttributeType.ore;
    case 1:
    case "fuel":
      return gridAttributeType.fuel;
    case 2:
    case "capacity":
      return gridAttributeType.capacity;
    case 3:
    case "load":
      return gridAttributeType.load;
    case 4:
    case "structsLoad":
      return gridAttributeType.structsLoad;
    case 5:
    case "power":
      return gridAttributeType.power;
    case 6:
    case "connectionCapacity":
      return gridAttributeType.connectionCapacity;
    case 7:
    case "connectionCount":
      return gridAttributeType.connectionCount;
    case 8:
    case "allocationPointerStart":
      return gridAttributeType.allocationPointerStart;
    case 9:
    case "allocationPointerEnd":
      return gridAttributeType.allocationPointerEnd;
    case 10:
    case "proxyNonce":
      return gridAttributeType.proxyNonce;
    case 11:
    case "lastAction":
      return gridAttributeType.lastAction;
    case 12:
    case "nonce":
      return gridAttributeType.nonce;
    case 13:
    case "ready":
      return gridAttributeType.ready;
    case 14:
    case "checkpointBlock":
      return gridAttributeType.checkpointBlock;
    case -1:
    case "UNRECOGNIZED":
    default:
      return gridAttributeType.UNRECOGNIZED;
  }
}

export function gridAttributeTypeToJSON(object: gridAttributeType): string {
  switch (object) {
    case gridAttributeType.ore:
      return "ore";
    case gridAttributeType.fuel:
      return "fuel";
    case gridAttributeType.capacity:
      return "capacity";
    case gridAttributeType.load:
      return "load";
    case gridAttributeType.structsLoad:
      return "structsLoad";
    case gridAttributeType.power:
      return "power";
    case gridAttributeType.connectionCapacity:
      return "connectionCapacity";
    case gridAttributeType.connectionCount:
      return "connectionCount";
    case gridAttributeType.allocationPointerStart:
      return "allocationPointerStart";
    case gridAttributeType.allocationPointerEnd:
      return "allocationPointerEnd";
    case gridAttributeType.proxyNonce:
      return "proxyNonce";
    case gridAttributeType.lastAction:
      return "lastAction";
    case gridAttributeType.nonce:
      return "nonce";
    case gridAttributeType.ready:
      return "ready";
    case gridAttributeType.checkpointBlock:
      return "checkpointBlock";
    case gridAttributeType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum allocationType {
  static = 0,
  dynamic = 1,
  automated = 2,
  providerAgreement = 3,
  UNRECOGNIZED = -1,
}

export function allocationTypeFromJSON(object: any): allocationType {
  switch (object) {
    case 0:
    case "static":
      return allocationType.static;
    case 1:
    case "dynamic":
      return allocationType.dynamic;
    case 2:
    case "automated":
      return allocationType.automated;
    case 3:
    case "providerAgreement":
      return allocationType.providerAgreement;
    case -1:
    case "UNRECOGNIZED":
    default:
      return allocationType.UNRECOGNIZED;
  }
}

export function allocationTypeToJSON(object: allocationType): string {
  switch (object) {
    case allocationType.static:
      return "static";
    case allocationType.dynamic:
      return "dynamic";
    case allocationType.automated:
      return "automated";
    case allocationType.providerAgreement:
      return "providerAgreement";
    case allocationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum guildJoinBypassLevel {
  /** closed - Feature off */
  closed = 0,
  /** permissioned - Only those with permissions can do it */
  permissioned = 1,
  /** member - All members of the guild can contribute */
  member = 2,
  UNRECOGNIZED = -1,
}

export function guildJoinBypassLevelFromJSON(object: any): guildJoinBypassLevel {
  switch (object) {
    case 0:
    case "closed":
      return guildJoinBypassLevel.closed;
    case 1:
    case "permissioned":
      return guildJoinBypassLevel.permissioned;
    case 2:
    case "member":
      return guildJoinBypassLevel.member;
    case -1:
    case "UNRECOGNIZED":
    default:
      return guildJoinBypassLevel.UNRECOGNIZED;
  }
}

export function guildJoinBypassLevelToJSON(object: guildJoinBypassLevel): string {
  switch (object) {
    case guildJoinBypassLevel.closed:
      return "closed";
    case guildJoinBypassLevel.permissioned:
      return "permissioned";
    case guildJoinBypassLevel.member:
      return "member";
    case guildJoinBypassLevel.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum guildJoinType {
  invite = 0,
  request = 1,
  direct = 2,
  proxy = 3,
  UNRECOGNIZED = -1,
}

export function guildJoinTypeFromJSON(object: any): guildJoinType {
  switch (object) {
    case 0:
    case "invite":
      return guildJoinType.invite;
    case 1:
    case "request":
      return guildJoinType.request;
    case 2:
    case "direct":
      return guildJoinType.direct;
    case 3:
    case "proxy":
      return guildJoinType.proxy;
    case -1:
    case "UNRECOGNIZED":
    default:
      return guildJoinType.UNRECOGNIZED;
  }
}

export function guildJoinTypeToJSON(object: guildJoinType): string {
  switch (object) {
    case guildJoinType.invite:
      return "invite";
    case guildJoinType.request:
      return "request";
    case guildJoinType.direct:
      return "direct";
    case guildJoinType.proxy:
      return "proxy";
    case guildJoinType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum registrationStatus {
  proposed = 0,
  approved = 1,
  denied = 2,
  revoked = 3,
  UNRECOGNIZED = -1,
}

export function registrationStatusFromJSON(object: any): registrationStatus {
  switch (object) {
    case 0:
    case "proposed":
      return registrationStatus.proposed;
    case 1:
    case "approved":
      return registrationStatus.approved;
    case 2:
    case "denied":
      return registrationStatus.denied;
    case 3:
    case "revoked":
      return registrationStatus.revoked;
    case -1:
    case "UNRECOGNIZED":
    default:
      return registrationStatus.UNRECOGNIZED;
  }
}

export function registrationStatusToJSON(object: registrationStatus): string {
  switch (object) {
    case registrationStatus.proposed:
      return "proposed";
    case registrationStatus.approved:
      return "approved";
    case registrationStatus.denied:
      return "denied";
    case registrationStatus.revoked:
      return "revoked";
    case registrationStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum ambit {
  none = 0,
  water = 1,
  land = 2,
  air = 3,
  space = 4,
  local = 5,
  UNRECOGNIZED = -1,
}

export function ambitFromJSON(object: any): ambit {
  switch (object) {
    case 0:
    case "none":
      return ambit.none;
    case 1:
    case "water":
      return ambit.water;
    case 2:
    case "land":
      return ambit.land;
    case 3:
    case "air":
      return ambit.air;
    case 4:
    case "space":
      return ambit.space;
    case 5:
    case "local":
      return ambit.local;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ambit.UNRECOGNIZED;
  }
}

export function ambitToJSON(object: ambit): string {
  switch (object) {
    case ambit.none:
      return "none";
    case ambit.water:
      return "water";
    case ambit.land:
      return "land";
    case ambit.air:
      return "air";
    case ambit.space:
      return "space";
    case ambit.local:
      return "local";
    case ambit.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum raidStatus {
  initiated = 0,
  ongoing = 2,
  attackerDefeated = 1,
  raidSuccessful = 3,
  demilitarized = 4,
  UNRECOGNIZED = -1,
}

export function raidStatusFromJSON(object: any): raidStatus {
  switch (object) {
    case 0:
    case "initiated":
      return raidStatus.initiated;
    case 2:
    case "ongoing":
      return raidStatus.ongoing;
    case 1:
    case "attackerDefeated":
      return raidStatus.attackerDefeated;
    case 3:
    case "raidSuccessful":
      return raidStatus.raidSuccessful;
    case 4:
    case "demilitarized":
      return raidStatus.demilitarized;
    case -1:
    case "UNRECOGNIZED":
    default:
      return raidStatus.UNRECOGNIZED;
  }
}

export function raidStatusToJSON(object: raidStatus): string {
  switch (object) {
    case raidStatus.initiated:
      return "initiated";
    case raidStatus.ongoing:
      return "ongoing";
    case raidStatus.attackerDefeated:
      return "attackerDefeated";
    case raidStatus.raidSuccessful:
      return "raidSuccessful";
    case raidStatus.demilitarized:
      return "demilitarized";
    case raidStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum planetStatus {
  active = 0,
  complete = 1,
  UNRECOGNIZED = -1,
}

export function planetStatusFromJSON(object: any): planetStatus {
  switch (object) {
    case 0:
    case "active":
      return planetStatus.active;
    case 1:
    case "complete":
      return planetStatus.complete;
    case -1:
    case "UNRECOGNIZED":
    default:
      return planetStatus.UNRECOGNIZED;
  }
}

export function planetStatusToJSON(object: planetStatus): string {
  switch (object) {
    case planetStatus.active:
      return "active";
    case planetStatus.complete:
      return "complete";
    case planetStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum fleetStatus {
  onStation = 0,
  away = 1,
  UNRECOGNIZED = -1,
}

export function fleetStatusFromJSON(object: any): fleetStatus {
  switch (object) {
    case 0:
    case "onStation":
      return fleetStatus.onStation;
    case 1:
    case "away":
      return fleetStatus.away;
    case -1:
    case "UNRECOGNIZED":
    default:
      return fleetStatus.UNRECOGNIZED;
  }
}

export function fleetStatusToJSON(object: fleetStatus): string {
  switch (object) {
    case fleetStatus.onStation:
      return "onStation";
    case fleetStatus.away:
      return "away";
    case fleetStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum structAttributeType {
  health = 0,
  status = 1,
  blockStartBuild = 2,
  blockStartOreMine = 3,
  blockStartOreRefine = 4,
  protectedStructIndex = 5,
  typeCount = 6,
  UNRECOGNIZED = -1,
}

export function structAttributeTypeFromJSON(object: any): structAttributeType {
  switch (object) {
    case 0:
    case "health":
      return structAttributeType.health;
    case 1:
    case "status":
      return structAttributeType.status;
    case 2:
    case "blockStartBuild":
      return structAttributeType.blockStartBuild;
    case 3:
    case "blockStartOreMine":
      return structAttributeType.blockStartOreMine;
    case 4:
    case "blockStartOreRefine":
      return structAttributeType.blockStartOreRefine;
    case 5:
    case "protectedStructIndex":
      return structAttributeType.protectedStructIndex;
    case 6:
    case "typeCount":
      return structAttributeType.typeCount;
    case -1:
    case "UNRECOGNIZED":
    default:
      return structAttributeType.UNRECOGNIZED;
  }
}

export function structAttributeTypeToJSON(object: structAttributeType): string {
  switch (object) {
    case structAttributeType.health:
      return "health";
    case structAttributeType.status:
      return "status";
    case structAttributeType.blockStartBuild:
      return "blockStartBuild";
    case structAttributeType.blockStartOreMine:
      return "blockStartOreMine";
    case structAttributeType.blockStartOreRefine:
      return "blockStartOreRefine";
    case structAttributeType.protectedStructIndex:
      return "protectedStructIndex";
    case structAttributeType.typeCount:
      return "typeCount";
    case structAttributeType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum planetAttributeType {
  planetaryShield = 0,
  repairNetworkQuantity = 1,
  defensiveCannonQuantity = 2,
  coordinatedGlobalShieldNetworkQuantity = 3,
  lowOrbitBallisticsInterceptorNetworkQuantity = 4,
  advancedLowOrbitBallisticsInterceptorNetworkQuantity = 5,
  lowOrbitBallisticsInterceptorNetworkSuccessRateNumerator = 6,
  lowOrbitBallisticsInterceptorNetworkSuccessRateDenominator = 7,
  orbitalJammingStationQuantity = 8,
  advancedOrbitalJammingStationQuantity = 9,
  blockStartRaid = 10,
  UNRECOGNIZED = -1,
}

export function planetAttributeTypeFromJSON(object: any): planetAttributeType {
  switch (object) {
    case 0:
    case "planetaryShield":
      return planetAttributeType.planetaryShield;
    case 1:
    case "repairNetworkQuantity":
      return planetAttributeType.repairNetworkQuantity;
    case 2:
    case "defensiveCannonQuantity":
      return planetAttributeType.defensiveCannonQuantity;
    case 3:
    case "coordinatedGlobalShieldNetworkQuantity":
      return planetAttributeType.coordinatedGlobalShieldNetworkQuantity;
    case 4:
    case "lowOrbitBallisticsInterceptorNetworkQuantity":
      return planetAttributeType.lowOrbitBallisticsInterceptorNetworkQuantity;
    case 5:
    case "advancedLowOrbitBallisticsInterceptorNetworkQuantity":
      return planetAttributeType.advancedLowOrbitBallisticsInterceptorNetworkQuantity;
    case 6:
    case "lowOrbitBallisticsInterceptorNetworkSuccessRateNumerator":
      return planetAttributeType.lowOrbitBallisticsInterceptorNetworkSuccessRateNumerator;
    case 7:
    case "lowOrbitBallisticsInterceptorNetworkSuccessRateDenominator":
      return planetAttributeType.lowOrbitBallisticsInterceptorNetworkSuccessRateDenominator;
    case 8:
    case "orbitalJammingStationQuantity":
      return planetAttributeType.orbitalJammingStationQuantity;
    case 9:
    case "advancedOrbitalJammingStationQuantity":
      return planetAttributeType.advancedOrbitalJammingStationQuantity;
    case 10:
    case "blockStartRaid":
      return planetAttributeType.blockStartRaid;
    case -1:
    case "UNRECOGNIZED":
    default:
      return planetAttributeType.UNRECOGNIZED;
  }
}

export function planetAttributeTypeToJSON(object: planetAttributeType): string {
  switch (object) {
    case planetAttributeType.planetaryShield:
      return "planetaryShield";
    case planetAttributeType.repairNetworkQuantity:
      return "repairNetworkQuantity";
    case planetAttributeType.defensiveCannonQuantity:
      return "defensiveCannonQuantity";
    case planetAttributeType.coordinatedGlobalShieldNetworkQuantity:
      return "coordinatedGlobalShieldNetworkQuantity";
    case planetAttributeType.lowOrbitBallisticsInterceptorNetworkQuantity:
      return "lowOrbitBallisticsInterceptorNetworkQuantity";
    case planetAttributeType.advancedLowOrbitBallisticsInterceptorNetworkQuantity:
      return "advancedLowOrbitBallisticsInterceptorNetworkQuantity";
    case planetAttributeType.lowOrbitBallisticsInterceptorNetworkSuccessRateNumerator:
      return "lowOrbitBallisticsInterceptorNetworkSuccessRateNumerator";
    case planetAttributeType.lowOrbitBallisticsInterceptorNetworkSuccessRateDenominator:
      return "lowOrbitBallisticsInterceptorNetworkSuccessRateDenominator";
    case planetAttributeType.orbitalJammingStationQuantity:
      return "orbitalJammingStationQuantity";
    case planetAttributeType.advancedOrbitalJammingStationQuantity:
      return "advancedOrbitalJammingStationQuantity";
    case planetAttributeType.blockStartRaid:
      return "blockStartRaid";
    case planetAttributeType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techWeaponSystem {
  primaryWeapon = 0,
  secondaryWeapon = 1,
  UNRECOGNIZED = -1,
}

export function techWeaponSystemFromJSON(object: any): techWeaponSystem {
  switch (object) {
    case 0:
    case "primaryWeapon":
      return techWeaponSystem.primaryWeapon;
    case 1:
    case "secondaryWeapon":
      return techWeaponSystem.secondaryWeapon;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techWeaponSystem.UNRECOGNIZED;
  }
}

export function techWeaponSystemToJSON(object: techWeaponSystem): string {
  switch (object) {
    case techWeaponSystem.primaryWeapon:
      return "primaryWeapon";
    case techWeaponSystem.secondaryWeapon:
      return "secondaryWeapon";
    case techWeaponSystem.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techWeaponControl {
  noWeaponControl = 0,
  guided = 1,
  unguided = 2,
  UNRECOGNIZED = -1,
}

export function techWeaponControlFromJSON(object: any): techWeaponControl {
  switch (object) {
    case 0:
    case "noWeaponControl":
      return techWeaponControl.noWeaponControl;
    case 1:
    case "guided":
      return techWeaponControl.guided;
    case 2:
    case "unguided":
      return techWeaponControl.unguided;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techWeaponControl.UNRECOGNIZED;
  }
}

export function techWeaponControlToJSON(object: techWeaponControl): string {
  switch (object) {
    case techWeaponControl.noWeaponControl:
      return "noWeaponControl";
    case techWeaponControl.guided:
      return "guided";
    case techWeaponControl.unguided:
      return "unguided";
    case techWeaponControl.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techActiveWeaponry {
  noActiveWeaponry = 0,
  guidedWeaponry = 1,
  unguidedWeaponry = 2,
  attackRun = 3,
  selfDestruct = 4,
  UNRECOGNIZED = -1,
}

export function techActiveWeaponryFromJSON(object: any): techActiveWeaponry {
  switch (object) {
    case 0:
    case "noActiveWeaponry":
      return techActiveWeaponry.noActiveWeaponry;
    case 1:
    case "guidedWeaponry":
      return techActiveWeaponry.guidedWeaponry;
    case 2:
    case "unguidedWeaponry":
      return techActiveWeaponry.unguidedWeaponry;
    case 3:
    case "attackRun":
      return techActiveWeaponry.attackRun;
    case 4:
    case "selfDestruct":
      return techActiveWeaponry.selfDestruct;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techActiveWeaponry.UNRECOGNIZED;
  }
}

export function techActiveWeaponryToJSON(object: techActiveWeaponry): string {
  switch (object) {
    case techActiveWeaponry.noActiveWeaponry:
      return "noActiveWeaponry";
    case techActiveWeaponry.guidedWeaponry:
      return "guidedWeaponry";
    case techActiveWeaponry.unguidedWeaponry:
      return "unguidedWeaponry";
    case techActiveWeaponry.attackRun:
      return "attackRun";
    case techActiveWeaponry.selfDestruct:
      return "selfDestruct";
    case techActiveWeaponry.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techPassiveWeaponry {
  noPassiveWeaponry = 0,
  counterAttack = 1,
  strongCounterAttack = 2,
  advancedCounterAttack = 3,
  lastResort = 4,
  UNRECOGNIZED = -1,
}

export function techPassiveWeaponryFromJSON(object: any): techPassiveWeaponry {
  switch (object) {
    case 0:
    case "noPassiveWeaponry":
      return techPassiveWeaponry.noPassiveWeaponry;
    case 1:
    case "counterAttack":
      return techPassiveWeaponry.counterAttack;
    case 2:
    case "strongCounterAttack":
      return techPassiveWeaponry.strongCounterAttack;
    case 3:
    case "advancedCounterAttack":
      return techPassiveWeaponry.advancedCounterAttack;
    case 4:
    case "lastResort":
      return techPassiveWeaponry.lastResort;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techPassiveWeaponry.UNRECOGNIZED;
  }
}

export function techPassiveWeaponryToJSON(object: techPassiveWeaponry): string {
  switch (object) {
    case techPassiveWeaponry.noPassiveWeaponry:
      return "noPassiveWeaponry";
    case techPassiveWeaponry.counterAttack:
      return "counterAttack";
    case techPassiveWeaponry.strongCounterAttack:
      return "strongCounterAttack";
    case techPassiveWeaponry.advancedCounterAttack:
      return "advancedCounterAttack";
    case techPassiveWeaponry.lastResort:
      return "lastResort";
    case techPassiveWeaponry.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techUnitDefenses {
  noUnitDefenses = 0,
  defensiveManeuver = 1,
  signalJamming = 2,
  armour = 3,
  indirectCombatModule = 4,
  stealthMode = 5,
  perimeterFencing = 6,
  reinforcedWalls = 7,
  UNRECOGNIZED = -1,
}

export function techUnitDefensesFromJSON(object: any): techUnitDefenses {
  switch (object) {
    case 0:
    case "noUnitDefenses":
      return techUnitDefenses.noUnitDefenses;
    case 1:
    case "defensiveManeuver":
      return techUnitDefenses.defensiveManeuver;
    case 2:
    case "signalJamming":
      return techUnitDefenses.signalJamming;
    case 3:
    case "armour":
      return techUnitDefenses.armour;
    case 4:
    case "indirectCombatModule":
      return techUnitDefenses.indirectCombatModule;
    case 5:
    case "stealthMode":
      return techUnitDefenses.stealthMode;
    case 6:
    case "perimeterFencing":
      return techUnitDefenses.perimeterFencing;
    case 7:
    case "reinforcedWalls":
      return techUnitDefenses.reinforcedWalls;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techUnitDefenses.UNRECOGNIZED;
  }
}

export function techUnitDefensesToJSON(object: techUnitDefenses): string {
  switch (object) {
    case techUnitDefenses.noUnitDefenses:
      return "noUnitDefenses";
    case techUnitDefenses.defensiveManeuver:
      return "defensiveManeuver";
    case techUnitDefenses.signalJamming:
      return "signalJamming";
    case techUnitDefenses.armour:
      return "armour";
    case techUnitDefenses.indirectCombatModule:
      return "indirectCombatModule";
    case techUnitDefenses.stealthMode:
      return "stealthMode";
    case techUnitDefenses.perimeterFencing:
      return "perimeterFencing";
    case techUnitDefenses.reinforcedWalls:
      return "reinforcedWalls";
    case techUnitDefenses.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techOreReserveDefenses {
  noOreReserveDefenses = 0,
  coordinatedReserveResponseTracker = 1,
  rapidResponsePackage = 2,
  activeScanning = 3,
  monitoringStation = 4,
  oreBunker = 5,
  UNRECOGNIZED = -1,
}

export function techOreReserveDefensesFromJSON(object: any): techOreReserveDefenses {
  switch (object) {
    case 0:
    case "noOreReserveDefenses":
      return techOreReserveDefenses.noOreReserveDefenses;
    case 1:
    case "coordinatedReserveResponseTracker":
      return techOreReserveDefenses.coordinatedReserveResponseTracker;
    case 2:
    case "rapidResponsePackage":
      return techOreReserveDefenses.rapidResponsePackage;
    case 3:
    case "activeScanning":
      return techOreReserveDefenses.activeScanning;
    case 4:
    case "monitoringStation":
      return techOreReserveDefenses.monitoringStation;
    case 5:
    case "oreBunker":
      return techOreReserveDefenses.oreBunker;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techOreReserveDefenses.UNRECOGNIZED;
  }
}

export function techOreReserveDefensesToJSON(object: techOreReserveDefenses): string {
  switch (object) {
    case techOreReserveDefenses.noOreReserveDefenses:
      return "noOreReserveDefenses";
    case techOreReserveDefenses.coordinatedReserveResponseTracker:
      return "coordinatedReserveResponseTracker";
    case techOreReserveDefenses.rapidResponsePackage:
      return "rapidResponsePackage";
    case techOreReserveDefenses.activeScanning:
      return "activeScanning";
    case techOreReserveDefenses.monitoringStation:
      return "monitoringStation";
    case techOreReserveDefenses.oreBunker:
      return "oreBunker";
    case techOreReserveDefenses.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techPlanetaryDefenses {
  noPlanetaryDefense = 0,
  defensiveCannon = 1,
  /**
   * lowOrbitBallisticInterceptorNetwork - advancedLowOrbitBallisticInterceptorNetwork  = 3;
   * repairNetwork                                = 4;
   * coordinatedGlobalShieldNetwork               = 5;
   * orbitalJammingStation                        = 6;
   * advancedOrbitalJammingStation                = 7;
   */
  lowOrbitBallisticInterceptorNetwork = 2,
  UNRECOGNIZED = -1,
}

export function techPlanetaryDefensesFromJSON(object: any): techPlanetaryDefenses {
  switch (object) {
    case 0:
    case "noPlanetaryDefense":
      return techPlanetaryDefenses.noPlanetaryDefense;
    case 1:
    case "defensiveCannon":
      return techPlanetaryDefenses.defensiveCannon;
    case 2:
    case "lowOrbitBallisticInterceptorNetwork":
      return techPlanetaryDefenses.lowOrbitBallisticInterceptorNetwork;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techPlanetaryDefenses.UNRECOGNIZED;
  }
}

export function techPlanetaryDefensesToJSON(object: techPlanetaryDefenses): string {
  switch (object) {
    case techPlanetaryDefenses.noPlanetaryDefense:
      return "noPlanetaryDefense";
    case techPlanetaryDefenses.defensiveCannon:
      return "defensiveCannon";
    case techPlanetaryDefenses.lowOrbitBallisticInterceptorNetwork:
      return "lowOrbitBallisticInterceptorNetwork";
    case techPlanetaryDefenses.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techStorageFacilities {
  noStorageFacilities = 0,
  dock = 1,
  hanger = 2,
  fleetBase = 3,
  UNRECOGNIZED = -1,
}

export function techStorageFacilitiesFromJSON(object: any): techStorageFacilities {
  switch (object) {
    case 0:
    case "noStorageFacilities":
      return techStorageFacilities.noStorageFacilities;
    case 1:
    case "dock":
      return techStorageFacilities.dock;
    case 2:
    case "hanger":
      return techStorageFacilities.hanger;
    case 3:
    case "fleetBase":
      return techStorageFacilities.fleetBase;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techStorageFacilities.UNRECOGNIZED;
  }
}

export function techStorageFacilitiesToJSON(object: techStorageFacilities): string {
  switch (object) {
    case techStorageFacilities.noStorageFacilities:
      return "noStorageFacilities";
    case techStorageFacilities.dock:
      return "dock";
    case techStorageFacilities.hanger:
      return "hanger";
    case techStorageFacilities.fleetBase:
      return "fleetBase";
    case techStorageFacilities.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techPlanetaryMining {
  noPlanetaryMining = 0,
  oreMiningRig = 1,
  UNRECOGNIZED = -1,
}

export function techPlanetaryMiningFromJSON(object: any): techPlanetaryMining {
  switch (object) {
    case 0:
    case "noPlanetaryMining":
      return techPlanetaryMining.noPlanetaryMining;
    case 1:
    case "oreMiningRig":
      return techPlanetaryMining.oreMiningRig;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techPlanetaryMining.UNRECOGNIZED;
  }
}

export function techPlanetaryMiningToJSON(object: techPlanetaryMining): string {
  switch (object) {
    case techPlanetaryMining.noPlanetaryMining:
      return "noPlanetaryMining";
    case techPlanetaryMining.oreMiningRig:
      return "oreMiningRig";
    case techPlanetaryMining.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techPlanetaryRefineries {
  noPlanetaryRefinery = 0,
  oreRefinery = 1,
  UNRECOGNIZED = -1,
}

export function techPlanetaryRefineriesFromJSON(object: any): techPlanetaryRefineries {
  switch (object) {
    case 0:
    case "noPlanetaryRefinery":
      return techPlanetaryRefineries.noPlanetaryRefinery;
    case 1:
    case "oreRefinery":
      return techPlanetaryRefineries.oreRefinery;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techPlanetaryRefineries.UNRECOGNIZED;
  }
}

export function techPlanetaryRefineriesToJSON(object: techPlanetaryRefineries): string {
  switch (object) {
    case techPlanetaryRefineries.noPlanetaryRefinery:
      return "noPlanetaryRefinery";
    case techPlanetaryRefineries.oreRefinery:
      return "oreRefinery";
    case techPlanetaryRefineries.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum techPowerGeneration {
  noPowerGeneration = 0,
  smallGenerator = 1,
  mediumGenerator = 2,
  largeGenerator = 3,
  UNRECOGNIZED = -1,
}

export function techPowerGenerationFromJSON(object: any): techPowerGeneration {
  switch (object) {
    case 0:
    case "noPowerGeneration":
      return techPowerGeneration.noPowerGeneration;
    case 1:
    case "smallGenerator":
      return techPowerGeneration.smallGenerator;
    case 2:
    case "mediumGenerator":
      return techPowerGeneration.mediumGenerator;
    case 3:
    case "largeGenerator":
      return techPowerGeneration.largeGenerator;
    case -1:
    case "UNRECOGNIZED":
    default:
      return techPowerGeneration.UNRECOGNIZED;
  }
}

export function techPowerGenerationToJSON(object: techPowerGeneration): string {
  switch (object) {
    case techPowerGeneration.noPowerGeneration:
      return "noPowerGeneration";
    case techPowerGeneration.smallGenerator:
      return "smallGenerator";
    case techPowerGeneration.mediumGenerator:
      return "mediumGenerator";
    case techPowerGeneration.largeGenerator:
      return "largeGenerator";
    case techPowerGeneration.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum providerAccessPolicy {
  openMarket = 0,
  guildMarket = 1,
  closedMarket = 2,
  UNRECOGNIZED = -1,
}

export function providerAccessPolicyFromJSON(object: any): providerAccessPolicy {
  switch (object) {
    case 0:
    case "openMarket":
      return providerAccessPolicy.openMarket;
    case 1:
    case "guildMarket":
      return providerAccessPolicy.guildMarket;
    case 2:
    case "closedMarket":
      return providerAccessPolicy.closedMarket;
    case -1:
    case "UNRECOGNIZED":
    default:
      return providerAccessPolicy.UNRECOGNIZED;
  }
}

export function providerAccessPolicyToJSON(object: providerAccessPolicy): string {
  switch (object) {
    case providerAccessPolicy.openMarket:
      return "openMarket";
    case providerAccessPolicy.guildMarket:
      return "guildMarket";
    case providerAccessPolicy.closedMarket:
      return "closedMarket";
    case providerAccessPolicy.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
