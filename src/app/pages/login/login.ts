import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../auth';

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

  readonly enabled = this.auth.enabled;
  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly failure = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.failure.set('');
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
    try {
      if (this.mode() === 'register') {
        await this.auth.register(name, email, password);
      } else {
        await this.auth.login(email, password);
      }
      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/account';
      await this.router.navigateByUrl(redirect);
    } catch (error) {
      this.failure.set(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      this.busy.set(false);
    }
  }
}
