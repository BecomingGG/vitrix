import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { AUTH_ENABLED } from './auth.config';

export interface Member {
  id: string;
  name: string;
  email: string;
  roles: string[];
  /** Course ids from COURSES. Filled by the future purchase flow (from an API). */
  courses: string[];
}

const RETURN_URL_KEY = 'vitrix.returnUrl';

/**
 * Current member + login / register / logout, backed by the identity-api server.
 * Pages and the guard only use this public API, not the OIDC library directly.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly oidc = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly current = signal<Member | null>(null);

  /** False on the published site until the identity server is deployed (see auth.config.ts). */
  readonly enabled = AUTH_ENABLED;
  readonly user = this.current.asReadonly();
  readonly signedIn = computed(() => this.current() !== null);

  /**
   * Restores the session from storage, or finishes a login coming back to /callback?code=...
   * Shared, so the app shell and the guard wait for the same result.
   */
  readonly ready$: Observable<boolean> = AUTH_ENABLED
    ? this.oidc.checkAuth().pipe(
        map(({ isAuthenticated, userData }) => {
          this.current.set(isAuthenticated ? toMember(userData) : null);
          return isAuthenticated;
        }),
        // Identity server down or unreachable: carry on signed out instead of breaking the site.
        catchError((error: unknown) => {
          console.warn('VITRIX: identity server not reachable, continuing signed out.', error);
          this.current.set(null);
          return of(false);
        }),
        shareReplay(1),
      )
    : of(false);

  constructor() {
    if (AUTH_ENABLED) {
      // Stay in sync after token refreshes and logouts.
      this.oidc.userData$.subscribe(({ userData }) =>
        this.current.set(userData ? toMember(userData) : null),
      );
    }
  }

  /** Called once on startup by the app shell. */
  init(): void {
    this.ready$.subscribe((signedIn) => {
      if (window.location.pathname.startsWith('/callback')) {
        const returnUrl = sessionStorage.getItem(RETURN_URL_KEY) || '/account';
        sessionStorage.removeItem(RETURN_URL_KEY);
        this.router.navigateByUrl(signedIn ? returnUrl : '/login', { replaceUrl: true });
      }
    });
  }

  /** Opens the identity server's login page; comes back to `redirect` afterwards. */
  login(redirect = '/account'): void {
    this.go(redirect);
  }

  /** Opens the identity server's "create account" page; comes back to `redirect` afterwards. */
  register(redirect = '/account'): void {
    this.go(redirect, { screen: 'register' });
  }

  /** Signs out on the identity server too, then returns to the home page. */
  logout(): void {
    if (AUTH_ENABLED) {
      this.oidc.logoff().subscribe();
    }
  }

  private go(redirect: string, customParams?: Record<string, string>): void {
    if (!AUTH_ENABLED) {
      return;
    }
    const safe = redirect.startsWith('/') && !redirect.startsWith('/callback') ? redirect : '/';
    sessionStorage.setItem(RETURN_URL_KEY, safe);
    this.oidc.authorize(undefined, customParams ? { customParams } : undefined);
  }
}

/** Members only. Visitors who are not signed in go to /login and come back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.enabled) {
    return true; // published site: no accounts yet, keep pages open
  }
  return auth.ready$.pipe(
    map((signedIn) =>
      signedIn ? true : router.createUrlTree(['/login'], { queryParams: { redirect: state.url } }),
    ),
  );
};

function toMember(data: Record<string, unknown> | null | undefined): Member | null {
  if (!data) {
    return null;
  }
  const email = String(data['email'] ?? '');
  const rawName = String(data['name'] ?? data['preferred_username'] ?? '');
  const roles = data['role'];
  return {
    id: String(data['sub'] ?? ''),
    email,
    // The identity server uses the email as user name until profiles get a real name.
    name: rawName && !rawName.includes('@') ? rawName : email.split('@')[0] || 'Member',
    roles: Array.isArray(roles) ? roles.map(String) : roles ? [String(roles)] : [],
    courses: [],
  };
}
