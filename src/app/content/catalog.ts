import { Injectable, inject, signal } from '@angular/core';
import { COURSES } from '../site-data';
import { ContentApi } from './content.api';
import { CONTENT_ENABLED } from './content.config';
import { Course } from './content.models';

/** The built-in course list (site-data.ts), used until vitrix-api is available. */
const BUILT_IN: Course[] = COURSES.map((c, i) => ({
  id: c.id,
  slug: c.id,
  code: c.code,
  title: { en: c.name, ka: '' },
  summary: { en: c.summary, ka: '' },
  description: { en: c.detail, ka: '' },
  imageUrl: c.image,
  price: null,
  published: true,
  order: i,
}));

/**
 * Published courses for the public pages. Starts with the built-in list so pages render instantly,
 * then replaces it with the live list from vitrix-api when that is reachable.
 */
@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly api = inject(ContentApi);
  private loading: Promise<void> | null = null;

  readonly courses = signal<Course[]>(BUILT_IN);
  /** 'api' once the live list has loaded; lessons, tests and admin need it. */
  readonly source = signal<'built-in' | 'api'>('built-in');

  load(): Promise<void> {
    if (!CONTENT_ENABLED) {
      return Promise.resolve();
    }
    this.loading ??= this.api
      .courses()
      .then((list) => {
        this.courses.set(list.map((c) => ({ description: { en: '', ka: '' }, ...c })));
        this.source.set('api');
      })
      .catch((error) => {
        console.warn('VITRIX: course server not reachable, showing the built-in list.', error);
        this.loading = null; // try again on the next page that asks
      });
    return this.loading;
  }

  /** Call after an admin change so public pages show it. */
  refresh(): Promise<void> {
    this.loading = null;
    return this.load();
  }
}
