import {MenuPage} from "../../framework/MenuPage";

export const LOGOUT_FROM = Object.freeze({
  ACCOUNT: 'account',
  MANAGE_DEVICE: 'manageDevice',
});

/**
 * Wording and navigation for the logout warnings, which are reached both from
 * Account > Log Out (this device) and from Manage Device (this or another device).
 *
 * @param {GameState} gameState
 * @param {PlayerAddress} playerAddress the device being logged out; its logoutFrom says which page started it
 */
export function logoutWording(gameState, playerAddress) {
  const fromAccount = playerAddress.logoutFrom === LOGOUT_FROM.ACCOUNT;
  const isThisDevice = playerAddress.address === gameState.signingAccount?.address;

  return {
    headerBtnLabel: fromAccount ? 'Log Out' : 'Manage Device',
    stayLabel: isThisDevice ? 'Stay Logged In' : 'Keep Device',
    logoutLabel: isThisDevice ? 'Log Out Now' : 'Log Out Device',
    // "If you log out" vs "If it is logged out"
    ifLoggedOut: isThisDevice ? 'If you log out' : 'If it is logged out',
    stay: () => {
      if (fromAccount) {
        MenuPage.router.goto('Account', 'index');
      } else {
        MenuPage.router.goto('Account', 'manageDevice', playerAddress);
      }
    },
  };
}
