/**
 * Carries a pending Matrix login across the wallet sign-in.
 *
 * When Matrix Authentication Service sends a player to /oauth/authorize without
 * a webapp session, the server parks the request and redirects here with an
 * opaque id in the query string. Once a session exists, the browser goes back
 * to /oauth/resume and the authorization code is issued.
 *
 * The id is read from the URL once at boot and held in session storage, because
 * the SPA has no URL router and the address bar is rewritten to '/' immediately
 * so a reload does not look like a fresh OIDC request.
 */
export class OidcContinueManager {

  static QUERY_PARAM = 'oidc';

  static STORAGE_KEY = 'oidcContinueRequestId';

  constructor() {
    this.requestId = null;
  }

  /**
   * Reads the pending request id from the URL and remembers it.
   *
   * Session storage rather than local storage: a pending Matrix login belongs
   * to this tab and should not outlive it, and AuthManager.logout() clears local
   * storage wholesale.
   */
  init() {
    const fromUrl = new URLSearchParams(window.location.search).get(OidcContinueManager.QUERY_PARAM);

    if (fromUrl) {
      this.requestId = fromUrl;
      sessionStorage.setItem(OidcContinueManager.STORAGE_KEY, fromUrl);
      this.clearQueryParam();
      return;
    }

    this.requestId = sessionStorage.getItem(OidcContinueManager.STORAGE_KEY);
  }

  isPending() {
    return typeof this.requestId === 'string' && this.requestId.length > 0;
  }

  /**
   * Hands the browser back to the OIDC provider to collect the authorization
   * code. Callers should treat a true return as terminal: the page is on its way
   * out and any post-login work would be wasted.
   *
   * @returns {boolean} whether a redirect was started
   */
  resume() {
    if (!this.isPending()) {
      return false;
    }

    const requestId = this.requestId;
    this.clear();

    // A full navigation rather than fetch, so the session cookie rides along on
    // a top-level request and the provider can redirect on to Matrix.
    window.location.assign(`/oauth/resume?request_id=${encodeURIComponent(requestId)}`);

    return true;
  }

  clear() {
    this.requestId = null;
    sessionStorage.removeItem(OidcContinueManager.STORAGE_KEY);
  }

  /**
   * Drops the marker from the address bar without adding a history entry, so
   * that a reload or a back navigation does not replay a request that has
   * already been consumed.
   */
  clearQueryParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete(OidcContinueManager.QUERY_PARAM);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
}
