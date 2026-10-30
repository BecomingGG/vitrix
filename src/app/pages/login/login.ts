import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../auth';
import { Notify } from '../../notify';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(Notify);

  readonly enabled = this.auth.enabled;
  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly failure = signal('');
  /** Shown in the form, e.g. after an account was created but automatic login failed. */
  readonly success = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.failure.set('');
    this.success.set('');
    const name = this.form.controls.name;
    name.setValidators(mode === 'register' ? Validators.required : null);
    name.updateValueAndValidity();
  }

  invalid(control: 'name' | 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.failure.set('');
    this.success.set('');
    try {
      if (this.mode() === 'register') {
        await this.createAccount(name, email, password);
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
  private async createAccount(name: string, email: string, password: string): Promise<void> {
    await this.auth.register(name, email, password); // errors here stay on the Create account tab

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

    this.notify.success(`Account created. Welcome to VITRIX, ${this.auth.user()?.name ?? name}!`);
    await this.goOn();
  }

  private async goOn(): Promise<void> {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/account';
    await this.router.navigateByUrl(redirect.startsWith('/') ? redirect : '/account');
  }
}
