import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../auth';

/**
 * Entry point to the student area. Passwords are never entered here: the buttons send the visitor
 * to the VITRIX identity server (log in or create account) and bring them back to `?redirect=`.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly enabled = this.auth.enabled;
  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  private readonly redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/account';

  constructor() {
    // Already signed in (e.g. back button): go straight on.
    this.auth.ready$.subscribe((signedIn) => {
      if (signedIn) {
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      }
    });
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
  }

  continue(): void {
    this.busy.set(true);
    if (this.mode() === 'register') {
      this.auth.register(this.redirect);
    } else {
      this.auth.login(this.redirect);
    }
  }
}
