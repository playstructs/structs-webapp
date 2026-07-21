import {PERMISSIONS} from "../constants/Permissions";

export class PermissionManager {

  /**
   * @return {number}
   */
  getDefaultPlayerPermissions() {
    return PERMISSIONS.PLAY
      | PERMISSIONS.ASSETS_ALL
      | PERMISSIONS.SOURCE_ALLOCATION
      | PERMISSIONS.GUILD_MEMBERSHIP
      | PERMISSIONS.SUBSTATION_CONNECTION
      | PERMISSIONS.ALLOCATION_CONNECTION
      | PERMISSIONS.GUILD_TOKEN_BURN
      | PERMISSIONS.GUILD_TOKEN_MINT
      | PERMISSIONS.GUILD_ENDPOINT_UPDATE
      | PERMISSIONS.GUILD_JOIN_CONSTRAINTS_UPDATE
      | PERMISSIONS.GUILD_SUBSTATION_UPDATE
      | PERMISSIONS.PROVIDER_WITHDRAW
      | PERMISSIONS.PROVIDER_OPEN
      | PERMISSIONS.REACTOR_GUILD_CREATE
      | PERMISSIONS.HASH_ALL
      | PERMISSIONS.GUILD_UGC_UPDATE;
  }

  /**
   * @return {number}
   */
  getManageDevicesPermissions() {
    return PERMISSIONS.ADMIN
      | PERMISSIONS.UPDATE
      | PERMISSIONS.DELETE;
  }

  /**
   * @param {number} initialPermissions
   * @param {array} permissionsToAdd
   * @return {number}
   */
  addPermissions(initialPermissions, permissionsToAdd) {
    return permissionsToAdd.reduce((permissions, permissionToAdd) =>
      permissions | permissionToAdd
    , initialPermissions);
  }

  /**
   * @param initialPermissions
   * @param permissionsToRemove
   * @return {*}
   */
  removePermissions(initialPermissions, permissionsToRemove) {
    return permissionsToRemove.reduce((permissions, permissionToRemove) =>
      permissions & ~permissionToRemove
    , initialPermissions);
  }
}