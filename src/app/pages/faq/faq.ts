import { Component, inject, signal } from '@angular/core';
import { ContentApi } from '../../content/content.api';
import { CONTENT_ENABLED } from '../../content/content.config';
import { Faq } from '../../content/content.models';
import { TrPipe } from '../../content/i18n';

/** /faq — general questions and answers, managed in the admin panel. */
@Component({
  selector: 'app-faq',
  imports: [TrPipe],
  template: `
    <section class="page-hero">
      <div class="wrap">
        <p class="eyebrow">Help</p>
        <h1>Questions &amp; answers</h1>
        <p class="lede">Admissions, courses, certificates and the student area.</p>
      </div>
    </section>
    <section class="page-section">
      <div class="wrap prose">
        @for (faq of faqs(); track faq.id) {
          <details class="faq">
            <summary>{{ faq.question | tr }}</summary>
            <p class="prose-text">{{ faq.answer | tr }}</p>
          </details>
        } @empty {
          <p>
            {{
              loading()
                ? 'Loading…'
                : 'No questions published yet. Write to us on the Contact page.'
            }}
          </p>
        }
      </div>
    </section>
  `,
})
export class FaqPage {
  readonly faqs = signal<Faq[]>([]);
  readonly loading = signal(CONTENT_ENABLED);

  constructor() {
    if (CONTENT_ENABLED) {
      inject(ContentApi)
        .faqs()
        .then((list) => this.faqs.set(list))
        .catch(() => this.faqs.set([]))
        .finally(() => this.loading.set(false));
    }
  }
}
