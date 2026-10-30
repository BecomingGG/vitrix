import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../auth';
import { Notify } from '../../notify';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-account',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly notify = inject(Notify);
  private readonly fb = inject(FormBuilder);
  readonly user = this.auth.user;

  readonly enrolled = computed(() => {
    const ids = this.user()?.courses ?? [];
    return COURSES.filter((course) => ids.includes(course.id));
  });

  /** "Delete account": shown only after the first click, and needs the password. */
  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal('');
  readonly deleteForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  logout(): void {
    this.auth.logout();
    this.notify.info('You have been logged out.');
    this.router.navigateByUrl('/');
  }

  startDelete(): void {
    this.confirmingDelete.set(true);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
    this.deleteForm.reset();
    this.deleteError.set('');
  }

  async deleteAccount(): Promise<void> {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }
    this.deleting.set(true);
    this.deleteError.set('');
    try {
      await this.auth.deleteAccount(this.deleteForm.getRawValue().password);
      this.notify.info('Your account and personal data have been deleted.');
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.deleteError.set(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      this.deleting.set(false);
    }
  }
}
