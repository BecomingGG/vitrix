import { Injectable, signal } from '@angular/core';

export interface Note {
  text: string;
  kind: 'success' | 'info' | 'error';
}

/** Short site-wide messages ("Welcome back", "You have been logged out"), shown as a toast. */
@Injectable({ providedIn: 'root' })
export class Notify {
  private readonly current = signal<Note | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly note = this.current.asReadonly();

  success(text: string): void {
    this.show({ text, kind: 'success' });
  }

  info(text: string): void {
    this.show({ text, kind: 'info' });
  }

  error(text: string): void {
    this.show({ text, kind: 'error' });
  }

  dismiss(): void {
    clearTimeout(this.timer);
    this.current.set(null);
  }

  private show(note: Note): void {
    clearTimeout(this.timer);
    this.current.set(note);
    this.timer = setTimeout(() => this.current.set(null), 5000);
  }
}
