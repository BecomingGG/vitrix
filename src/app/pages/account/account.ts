import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../auth';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  readonly user = this.auth.user;

  readonly enrolled = computed(() => {
    const ids = this.user()?.courses ?? [];
    return COURSES.filter((course) => ids.includes(course.id));
  });

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
