import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { COURSES, NAV } from '../site-data';
import { Mark } from '../mark';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Mark],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  private readonly router = inject(Router);
  readonly nav = NAV;
  readonly menuOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly query = signal('');

  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return [];
    }

    const pages = NAV.filter((item) => item.label.toLowerCase().includes(q)).map((item) => ({
      label: item.label,
      path: item.path,
      fragment: undefined as string | undefined,
    }));

    const courses = COURSES.filter((course) =>
      `${course.code} ${course.name}`.toLowerCase().includes(q),
    ).map((course) => ({
      label: `${course.code} — ${course.name}`,
      path: '/courses',
      fragment: course.id,
    }));

    return [...pages, ...courses];
  });

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      this.searchOpen.set(false);
      this.query.set('');
    });
  }

  toggleSearch(): void {
    this.searchOpen.update((open) => !open);
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.searchOpen.set(false);
  }

  onQuery(value: string): void {
    this.query.set(value);
  }

  @HostListener('document:keydown.escape')
  closeOverlays(): void {
    this.searchOpen.set(false);
    this.menuOpen.set(false);
  }
}
