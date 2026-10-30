import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, map, of, shareReplay } from 'rxjs';
import { AUTH_ENABLED } from './auth.config';

export interface SignedInUser {
  id: string;
  email: string;
  /** Display name; falls back to the part of the email before "@". */
  name: string;
  roles: string[];
}

const RETURN_URL_KEY = 'vitrix.returnUrl';

/** Thin wrapper around the OIDC library: one place for sign-in state, login and logout. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);
  private readonly router = inject(Router);

  readonly enabled = AUTH_ENABLED;
  readonly user = signal<SignedInUser | null>(null);
  readonly isSignedIn = computed(() => this.user() !== null);

  /**
   * Restores a session from storage, or completes the login when the identity server redirects
   * back to /callback?code=... Shared, so the app shell and route guards wait for the same result.
   */
  readonly ready$: Observable<boolean> = AUTH_ENABLED
    ? this.oidc.checkAuth().pipe(
        map(({ isAuthenticated, userData }) => {
          this.user.set(isAuthenticated ? toUser(userData) : null);
          return isAuthenticated;
        }),
        shareReplay(1),
      )
    : of(false);

  constructor() {
    if (AUTH_ENABLED) {
      // Keep the signal in sync after token refreshes and logouts.
      this.oidc.userData$.subscribe(({ userData }) =>
        this.user.set(userData ? toUser(userData) : null),
      );
    }
  }

  /** Called once on startup by the app shell. */
  init(): void {
    this.ready$.subscribe((signedIn) => {
      if (window.location.pathname.startsWith('/callback')) {
        const returnUrl = sessionStorage.getItem(RETURN_URL_KEY) || '/';
        sessionStorage.removeItem(RETURN_URL_KEY);
        this.router.navigateByUrl(signedIn ? returnUrl : '/', { replaceUrl: true });
      }
    });
  }

  /** Sends the visitor to the identity server; they come back to returnUrl afterwards. */
  login(returnUrl: string = this.router.url): void {
    if (!AUTH_ENABLED) {
      return;
    }
    sessionStorage.setItem(RETURN_URL_KEY, returnUrl.startsWith('/callback') ? '/' : returnUrl);
    this.oidc.authorize();
  }

  logout(): void {
    if (AUTH_ENABLED) {
      this.oidc.logoff().subscribe();
    }
  }
}

function toUser(data: Record<string, unknown> | null | undefined): SignedInUser | null {
  if (!data) {
    return null;
  }
  const email = String(data['email'] ?? '');
  const rawName = String(data['name'] ?? data['preferred_username'] ?? '');
  const roles = data['role'];
  return {
    id: String(data['sub'] ?? ''),
    email,
    name: rawName && !rawName.includes('@') ? rawName : email.split('@')[0] || 'Account',
    roles: Array.isArray(roles) ? roles.map(String) : roles ? [String(roles)] : [],
  };
}
