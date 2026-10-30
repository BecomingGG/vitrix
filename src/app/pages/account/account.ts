import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../auth';
import { Notify } from '../../notify';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly notify = inject(Notify);
  readonly user = this.auth.user;

  readonly enrolled = computed(() => {
    const ids = this.user()?.courses ?? [];
    return COURSES.filter((course) => ids.includes(course.id));
  });

  logout(): void {
    this.auth.logout();
    this.notify.info('You have been logged out.');
    this.router.navigateByUrl('/');
  }
}
