/**
 * Picks the next page for logging out a device, so every Log Out button walks
 * the same assets and permissions warnings before anything is revoked.
 *
 * @param {object} device
 * @param {boolean} device.isCurrentDevice
 * @param {boolean} device.isPrimaryDevice
 * @param {boolean} device.canRevokeCurrentDevice
 * @param {boolean} device.isOnlyManagingDevice
 * @param {string|number|null} device.alpha
 * @return {{action: string, withAddress: boolean}} Auth route, and whether it takes the device's PlayerAddress
 */
export function deviceLogoutRoute({
  isCurrentDevice,
  isPrimaryDevice,
  canRevokeCurrentDevice,
  isOnlyManagingDevice,
  alpha,
}) {
  if (isCurrentDevice && !canRevokeCurrentDevice) {
    return {action: 'logout', withAddress: false};
  }
  if (!isPrimaryDevice && alpha && BigInt(alpha) > 0n) {
    return {action: 'logoutAssetsWarning', withAddress: true};
  }
  if (isOnlyManagingDevice) {
    return {action: 'logoutPermissionsWarning', withAddress: true};
  }
  return {action: 'logout', withAddress: !isPrimaryDevice};
}
