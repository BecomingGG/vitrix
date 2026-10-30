import { LogLevel, PassedInitialConfig } from 'angular-auth-oidc-client';

/**
 * Sign-in runs against the identity-api server (OpenID Connect).
 *
 * The identity server only runs locally for now, so sign-in is switched on only when the site
 * itself runs on localhost. On the published site (GitHub Pages) everything behaves as before.
 * When identity-api is deployed, set PRODUCTION_IDENTITY_URL and register the site's URL as a
 * redirect URI for the "vitrix" client.
 */
const LOCAL_IDENTITY_URL = 'http://localhost:8080';
const PRODUCTION_IDENTITY_URL = ''; // e.g. 'https://auth.vitrix.ge'

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const IDENTITY_URL = isLocal ? LOCAL_IDENTITY_URL : PRODUCTION_IDENTITY_URL;
export const AUTH_ENABLED = IDENTITY_URL !== '';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: IDENTITY_URL || LOCAL_IDENTITY_URL,
    clientId: 'vitrix', // registered in identity-api (appsettings.Development.json)
    redirectUrl: `${window.location.origin}/callback`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    scope: 'openid profile email roles api offline_access',
    responseType: 'code', // Authorization Code + PKCE
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    logLevel: LogLevel.Warn,
  },
};
