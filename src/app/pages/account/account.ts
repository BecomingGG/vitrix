import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../auth';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);
  readonly user = this.auth.user;

  readonly enrolled = computed(() => {
    const ids = this.user()?.courses ?? [];
    return COURSES.filter((course) => ids.includes(course.id));
  });

  /** Signs out on the identity server too; it sends the visitor back to the home page. */
  logout(): void {
    this.auth.logout();
  }
}
