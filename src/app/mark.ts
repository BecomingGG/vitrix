import { Component } from '@angular/core';

let nextMark = 0;

@Component({
  selector: 'app-mark',
  template: `
    <svg viewBox="0 0 100 92" aria-hidden="true">
      <defs>
        <linearGradient [attr.id]="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="42%" stop-color="#c8c8c8" />
          <stop offset="100%" stop-color="#6f6f6f" />
        </linearGradient>
        <linearGradient [attr.id]="steelAlt" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4f4f4" />
          <stop offset="55%" stop-color="#9a9a9a" />
          <stop offset="100%" stop-color="#efefef" />
        </linearGradient>
      </defs>
      <path [attr.fill]="'url(#' + steel + ')'" d="M2 2h26L62 90H36Z" />
      <path [attr.fill]="'url(#' + steelAlt + ')'" d="M98 2H72L38 90h26Z" />
      <polyline
        class="ecg"
        points="4,50 16,50 22,44 28,50 34,50 39,58 47,14 55,72 61,50 70,50 78,42 86,50 96,50"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .ecg {
      fill: none;
      stroke: #ff1a2e;
      stroke-width: 4.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 4px rgba(255, 26, 46, 0.95));
    }
  `,
})
export class Mark {
  private readonly id = nextMark++;
  readonly steel = `vitrix-steel-${this.id}`;
  readonly steelAlt = `vitrix-steel-alt-${this.id}`;
}
