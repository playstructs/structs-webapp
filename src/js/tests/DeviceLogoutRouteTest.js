import {DTest, DTestSuite} from "../framework/DTestFramework";
import {deviceLogoutRoute} from "../util/DeviceLogoutRoute";

export class DeviceLogoutRouteTest extends DTestSuite {

  constructor() {
    super('DeviceLogoutRouteTest');
  }

  routeTest = new DTest('routeTest', function(params) {
    const route = deviceLogoutRoute(params.device);
    this.assertEquals(`${route.action}:${route.withAddress}`, params.expected);
  }, function() {
    const device = (overrides) => ({
      isCurrentDevice: true,
      isPrimaryDevice: false,
      canRevokeCurrentDevice: true,
      isOnlyManagingDevice: false,
      alpha: '0',
      ...overrides,
    });
    return [
      // Without revoke rights this device can only forget its own key.
      {device: device({canRevokeCurrentDevice: false, alpha: '5', isOnlyManagingDevice: true}), expected: 'logout:false'},
      {device: device({alpha: '5'}), expected: 'logoutAssetsWarning:true'},
      {device: device({alpha: '5', isOnlyManagingDevice: true}), expected: 'logoutAssetsWarning:true'},
      {device: device({isOnlyManagingDevice: true}), expected: 'logoutPermissionsWarning:true'},
      {device: device({}), expected: 'logout:true'},
      {device: device({alpha: null}), expected: 'logout:true'},
      // The primary device's Alpha is the account's, so it carries no assets warning.
      {device: device({isPrimaryDevice: true, alpha: '5'}), expected: 'logout:false'},
      {device: device({isPrimaryDevice: true, isOnlyManagingDevice: true}), expected: 'logoutPermissionsWarning:true'},
      {device: device({isCurrentDevice: false, canRevokeCurrentDevice: false}), expected: 'logout:true'},
    ];
  });
}
