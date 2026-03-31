import {DTest, DTestSuite} from "../framework/DTestFramework";
import {PermissionManager} from "../managers/PermissionManager";
import {PERMISSIONS} from "../constants/Permissions";

export class PermissionManagerTest extends DTestSuite {

  constructor() {
    super('PermissionManagerTest');
  }

  addPermissionsTest = new DTest('addPermissionsTest', function(params) {
    const permissionManager = new PermissionManager();
    this.assertEquals(
      permissionManager.addPermissions(
        permissionManager.getDefaultPlayerPermissions(),
        params.permissionsToAdd
      ),
      params.expected
    );
  }, function() {
    return [
      {
        permissionsToAdd: [],
        expected: 15732481
      },
      {
        permissionsToAdd: [PERMISSIONS.PLAY],
        expected: 15732481
      },
      {
        permissionsToAdd: [PERMISSIONS.ASSETS_ALL],
        expected: 15732721
      },
      {
        permissionsToAdd: [PERMISSIONS.ADMIN],
        expected: 15732483
      },
      {
        permissionsToAdd: [
          PERMISSIONS.ASSETS_ALL,
          PERMISSIONS.ADMIN
        ],
        expected: 15732723
      },
      {
        permissionsToAdd: [
          PERMISSIONS.ASSETS_ALL,
          PERMISSIONS.ADMIN,
          PERMISSIONS.UPDATE,
          PERMISSIONS.DELETE
        ],
        expected: 15732735
      },
    ];
  });

  removePermissionsTest = new DTest('removePermissionsTest', function(params) {
    const permissionManager = new PermissionManager();
    this.assertEquals(
      permissionManager.removePermissions(
        params.initialPermissions,
        params.permissionsToRemove
      ),
      params.expected
    );
  }, function() {
    return [
      {
        initialPermissions: 15732481,
        permissionsToRemove: [],
        expected: 15732481
      },
      {
        initialPermissions: PERMISSIONS.PLAY
          | PERMISSIONS.SOURCE_ALLOCATION
          | PERMISSIONS.GUILD_MEMBERSHIP
          | PERMISSIONS.SUBSTATION_CONNECTION
          | PERMISSIONS.ALLOCATION_CONNECTION
          | PERMISSIONS.HASH_ALL,
        permissionsToRemove: [PERMISSIONS.GUILD_MEMBERSHIP],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.SOURCE_ALLOCATION
          | PERMISSIONS.SUBSTATION_CONNECTION
          | PERMISSIONS.ALLOCATION_CONNECTION
          | PERMISSIONS.HASH_ALL
      },
      {
        initialPermissions: PERMISSIONS.PLAY
          | PERMISSIONS.ADMIN
          | PERMISSIONS.UPDATE
          | PERMISSIONS.DELETE
          | PERMISSIONS.ASSETS_ALL
          | PERMISSIONS.SOURCE_ALLOCATION
          | PERMISSIONS.GUILD_MEMBERSHIP
          | PERMISSIONS.SUBSTATION_CONNECTION
          | PERMISSIONS.ALLOCATION_CONNECTION
          | PERMISSIONS.HASH_ALL,
        permissionsToRemove: [
          PERMISSIONS.UPDATE,
          PERMISSIONS.ASSETS_ALL,
          PERMISSIONS.HASH_ALL,
        ],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.ADMIN
          | PERMISSIONS.DELETE
          | PERMISSIONS.SOURCE_ALLOCATION
          | PERMISSIONS.GUILD_MEMBERSHIP
          | PERMISSIONS.SUBSTATION_CONNECTION
          | PERMISSIONS.ALLOCATION_CONNECTION
      }
    ];
  });
}
