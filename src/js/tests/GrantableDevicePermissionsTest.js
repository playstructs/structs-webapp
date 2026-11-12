import {DTest, DTestSuite} from "../framework/DTestFramework";
import {grantableDevicePermissions} from "../util/DeviceChangeIntent";
import {PERMISSIONS} from "../constants/Permissions";
import {PermissionManager} from "../managers/PermissionManager";

export class GrantableDevicePermissionsTest extends DTestSuite {

  constructor() {
    super('GrantableDevicePermissionsTest');
  }

  grantableTest = new DTest('grantableTest', function(params) {
    const grantable = grantableDevicePermissions(params.permissions);
    this.assertEquals(`${grantable.manageDevices}:${grantable.transferAssets}`, params.expected);
  }, function() {
    const manage = PERMISSIONS.ADMIN | PERMISSIONS.UPDATE | PERMISSIONS.DELETE;
    const base = PERMISSIONS.PLAY | PERMISSIONS.SOURCE_ALLOCATION;
    return [
      {permissions: String(PERMISSIONS.ALL), expected: 'true:true'},
      {permissions: PERMISSIONS.ALL, expected: 'true:true'},
      // A device approved with the defaults and neither box ticked.
      {permissions: String(base), expected: 'false:false'},
      {permissions: String(base | manage), expected: 'true:false'},
      {permissions: String(base | PERMISSIONS.ASSETS_ALL), expected: 'false:true'},
      // Part of a group is not enough to grant the whole group.
      {permissions: String(base | PERMISSIONS.ADMIN | PERMISSIONS.UPDATE), expected: 'false:false'},
      {permissions: String(base | PERMISSIONS.TOKEN_TRANSFER), expected: 'false:false'},
      {permissions: String(new PermissionManager().getDefaultPlayerPermissions()), expected: 'false:true'},
      {permissions: null, expected: 'false:false'},
      {permissions: '0', expected: 'false:false'},
    ];
  });
}
