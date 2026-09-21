import { afterNextRender, Component, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-courses',
  imports: [RouterLink],
  templateUrl: './courses.html',
})
export class Courses {
  readonly courses = COURSES;
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  constructor() {
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      if (!fragment) {
        return;
      }
      afterNextRender(
        () => {
          const section = document.getElementById(fragment);
          if (!section) {
            return;
          }
          const top = section.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top });
        },
        { injector: this.injector },
      );
    });
  }
}
