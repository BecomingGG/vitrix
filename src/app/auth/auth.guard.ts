import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Requires a signed-in visitor. If they are not signed in, they are sent to the identity server
 * login page and brought back to the page they asked for.
 * When sign-in is switched off (published site, see auth.config.ts) the page stays open to everyone.
 */
export const signedInGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (!auth.enabled) {
    return true;
  }
  return auth.ready$.pipe(
    map((signedIn) => {
      if (!signedIn) {
        auth.login(state.url);
      }
      return signedIn;
    }),
  );
};
