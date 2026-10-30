import { Component } from '@angular/core';

/** Landing page for the identity server redirect; Auth.init() finishes the login and moves on. */
@Component({
  selector: 'app-callback',
  template: `
    <section class="page-section">
      <div class="wrap">
        <p class="eyebrow" role="status">Signing you in…</p>
      </div>
    </section>
  `,
})
export class Callback {}
