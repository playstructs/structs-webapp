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
        expected: 49
      },
      {
        permissionsToAdd: [PERMISSIONS.PLAY],
        expected: 49
      },
      {
        permissionsToAdd: [PERMISSIONS.ASSETS],
        expected: 57
      },
      {
        permissionsToAdd: [PERMISSIONS.PERMISSIONS],
        expected: 113
      },
      {
        permissionsToAdd: [
          PERMISSIONS.ASSETS,
          PERMISSIONS.PERMISSIONS
        ],
        expected: 121
      },
      {
        permissionsToAdd: [
          PERMISSIONS.ASSETS,
          PERMISSIONS.PERMISSIONS,
          PERMISSIONS.UPDATE,
          PERMISSIONS.DELETE
        ],
        expected: 127
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
        initialPermissions: 49,
        permissionsToRemove: [],
        expected: 49
      },
      {
        initialPermissions: PERMISSIONS.PLAY
          | PERMISSIONS.ASSOCIATIONS
          | PERMISSIONS.GRID,
        permissionsToRemove: [PERMISSIONS.ASSOCIATIONS],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.GRID
      },
      {
        initialPermissions: PERMISSIONS.PLAY
          | PERMISSIONS.UPDATE
          | PERMISSIONS.DELETE
          | PERMISSIONS.ASSETS
          | PERMISSIONS.ASSOCIATIONS
          | PERMISSIONS.GRID
          | PERMISSIONS.PERMISSIONS,
        permissionsToRemove: [
          PERMISSIONS.UPDATE,
          PERMISSIONS.ASSETS,
          PERMISSIONS.GRID,
        ],
        expected: PERMISSIONS.PLAY
          | PERMISSIONS.DELETE
          | PERMISSIONS.ASSOCIATIONS
          | PERMISSIONS.PERMISSIONS
      }
    ];
  });
}
