/**
 * Accounts live on the identity-api server. VITRIX shows its own login / sign-up form and talks
 * to the server directly (OAuth password grant + POST /api/account/register), so visitors never
 * leave the site.
 *
 * The identity server only runs locally for now, so login is switched on only when the site
 * itself runs on localhost. On the published site (GitHub Pages) the login links are hidden and
 * every page stays open, exactly as before. When identity-api is deployed, set
 * PRODUCTION_IDENTITY_URL and add the site's origin to the server's CORS allowed origins.
 */
const LOCAL_IDENTITY_URL = 'http://localhost:8080';
const PRODUCTION_IDENTITY_URL = ''; // e.g. 'https://auth.vitrix.ge'

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const IDENTITY_URL = isLocal ? LOCAL_IDENTITY_URL : PRODUCTION_IDENTITY_URL;
export const AUTH_ENABLED = IDENTITY_URL !== '';

/** Registered in identity-api (appsettings.Development.json) with the "password" grant. */
export const CLIENT_ID = 'vitrix';

/** offline_access gives a refresh token, so members stay signed in. */
export const SCOPE = 'openid profile email roles api offline_access';
