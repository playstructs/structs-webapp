import {PERMISSIONS} from "../constants/Permissions";

export class PermissionManager {

  /**
   * @return {number}
   */
  getDefaultPlayerPermissions() {
    return PERMISSIONS.PLAY
      | PERMISSIONS.ASSOCIATIONS
      | PERMISSIONS.GRID;
  }

  /**
   * @return {number}
   */
  getManageDevicesPermissions() {
    return PERMISSIONS.UPDATE
      | PERMISSIONS.DELETE
      | PERMISSIONS.PERMISSIONS;
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