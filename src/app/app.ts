import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    const router = inject(Router);
    const title = inject(Title);
    const destroyRef = inject(DestroyRef);

    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => {
        let route = router.routerState.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        const page = route.snapshot.data['title'] as string | undefined;
        title.setTitle(page ? `${page} · VITRIX` : 'VITRIX');
      });
  }
}
