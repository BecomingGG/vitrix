import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../auth';
import { Notify } from '../../notify';

type Mode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(Notify);

  readonly enabled = this.auth.enabled;
  readonly mode = signal<Mode>('login');
  readonly busy = signal(false);
  readonly failure = signal('');
  /** Shown in the form, e.g. after an account was created but automatic login failed. */
  readonly success = signal('');

  constructor() {
    // /login?mode=forgot (from "Send a new link" on the reset page) or ?mode=register.
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'forgot' || mode === 'register') {
      this.setMode(mode);
    }
  }

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptPrivacy: [false],
    /** Honeypot: hidden from people, only bots fill it in (see .trap in styles.scss). */
    website: [''],
  });

  setMode(mode: Mode): void {
    this.mode.set(mode);
    this.failure.set('');
    this.success.set('');
    const { name, acceptPrivacy, password } = this.form.controls;
    password.setValidators(
      mode === 'forgot' ? null : [Validators.required, Validators.minLength(8)],
    );
    password.updateValueAndValidity();
    name.setValidators(mode === 'register' ? Validators.required : null);
    name.updateValueAndValidity();
    acceptPrivacy.setValidators(mode === 'register' ? Validators.requiredTrue : null);
    acceptPrivacy.updateValueAndValidity();
  }

  invalid(control: 'name' | 'email' | 'password' | 'acceptPrivacy'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password, acceptPrivacy, website } = this.form.getRawValue();
    this.busy.set(true);
    this.failure.set('');
    this.success.set('');
    try {
      if (this.mode() === 'forgot') {
        await this.auth.forgotPassword(email);
        this.success.set(
          `If there is an account for ${email.trim()}, we have sent it a link to choose a new ` +
            'password. It works for 24 hours; check your spam folder too.',
        );
      } else if (this.mode() === 'register') {
        await this.createAccount(name, email, password, acceptPrivacy, website);
      } else {
        await this.auth.login(email, password);
        this.notify.success(`Welcome back, ${this.auth.user()?.name ?? 'member'}.`);
        await this.goOn();
      }
    } catch (error) {
      this.failure.set(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      this.busy.set(false);
    }
  }

  /** Creates the account, then signs the new member in straight away. */
  private async createAccount(
    name: string,
    email: string,
    password: string,
    acceptPrivacy: boolean,
    website: string,
  ): Promise<void> {
    // Errors here stay on the Create account tab.
    await this.auth.register(name, email, password, { acceptPrivacy, website });

    try {
      await this.auth.login(email, password);
    } catch {
      // The account exists, only the automatic login failed: let them log in themselves.
      this.setMode('login');
      this.form.patchValue({ email, password: '' });
      this.form.markAsUntouched();
      this.success.set('Account created. Log in with your new password.');
      return;
    }

    this.notify.success(
      `Account created. Welcome to VITRIX, ${this.auth.user()?.name ?? name}! ` +
        `We sent a confirmation link to ${email.trim()}.`,
    );
    await this.goOn();
  }

  private async goOn(): Promise<void> {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/account';
    await this.router.navigateByUrl(redirect.startsWith('/') ? redirect : '/account');
  }
}
