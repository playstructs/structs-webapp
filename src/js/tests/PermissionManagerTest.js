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
        params.initialPermissions,
        params.permissionsToAdd
      ),
      params.expected
    );
  }, function() {
    return [
      {
        initialPermissions: PERMISSIONS.PLAY | PERMISSIONS.SOURCE_ALLOCATION,
        permissionsToAdd: [],
        expected: PERMISSIONS.PLAY | PERMISSIONS.SOURCE_ALLOCATION
      },
      {
        initialPermissions: PERMISSIONS.PLAY | PERMISSIONS.SOURCE_ALLOCATION,
        permissionsToAdd: [PERMISSIONS.PLAY],
        expected: PERMISSIONS.PLAY | PERMISSIONS.SOURCE_ALLOCATION
      },
      {
        initialPermissions: PERMISSIONS.PLAY,
        permissionsToAdd: [PERMISSIONS.ADMIN],
        expected: PERMISSIONS.PLAY | PERMISSIONS.ADMIN
      },
      {
        initialPermissions: PERMISSIONS.PLAY,
        permissionsToAdd: [PERMISSIONS.ASSETS_ALL],
        expected: PERMISSIONS.PLAY | PERMISSIONS.ASSETS_ALL
      },
      {
        initialPermissions: PERMISSIONS.PLAY | PERMISSIONS.GUILD_MEMBERSHIP,
        permissionsToAdd: [
          PERMISSIONS.ADMIN,
          PERMISSIONS.UPDATE,
          PERMISSIONS.DELETE
        ],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.GUILD_MEMBERSHIP
          | PERMISSIONS.ADMIN
          | PERMISSIONS.UPDATE
          | PERMISSIONS.DELETE
      },
      {
        // TOKEN_TRANSFER is one of the bits ASSETS_ALL already covers, so it
        // contributes nothing beyond the composite.
        initialPermissions: PERMISSIONS.PLAY,
        permissionsToAdd: [
          PERMISSIONS.ASSETS_ALL,
          PERMISSIONS.TOKEN_TRANSFER,
          PERMISSIONS.HASH_ALL
        ],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.ASSETS_ALL
          | PERMISSIONS.HASH_ALL
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
        initialPermissions: 32509697,
        permissionsToRemove: [],
        expected: 32509697
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
