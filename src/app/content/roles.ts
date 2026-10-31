import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Auth, Member } from '../auth';
import { CONTENT_ENABLED } from './content.config';

/** admin: everything (incl. enrollments, results). editor: courses, lessons, FAQ, tests. */
export type StaffRole = 'admin' | 'editor';

export function hasRole(member: Member | null, ...roles: StaffRole[]): boolean {
  return !!member && member.roles.some((role) => (roles as string[]).includes(role));
}

export const isStaff = (member: Member | null) => hasRole(member, 'admin', 'editor');
export const isAdmin = (member: Member | null) => hasRole(member, 'admin');

/** Route guard: signed in with one of the roles; others go to /login or home. */
export function roleGuard(...roles: StaffRole[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (!auth.enabled || !CONTENT_ENABLED) {
      return router.createUrlTree(['/']);
    }
    return auth.ready$.pipe(
      map(() => {
        if (!auth.signedIn()) {
          return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
        }
        return hasRole(auth.user(), ...roles) ? true : router.createUrlTree(['/']);
      }),
    );
  };
}
