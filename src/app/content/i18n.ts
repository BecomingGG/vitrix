import { Pipe, PipeTransform, signal } from '@angular/core';
import { LText } from './content.models';

export type Lang = 'en' | 'ka';

/** Current site language. English for now; a language switch can set this later. */
export const lang = signal<Lang>('en');

/** Text in the current language, falling back to the other language if not translated yet. */
export function tr(text: LText | null | undefined): string {
  if (!text) {
    return '';
  }
  const other: Lang = lang() === 'en' ? 'ka' : 'en';
  return text[lang()] || text[other] || '';
}

export function emptyText(): LText {
  return { en: '', ka: '' };
}

/** {{ course.title | tr }} */
@Pipe({ name: 'tr', pure: false })
export class TrPipe implements PipeTransform {
  transform(text: LText | null | undefined): string {
    return tr(text);
  }
}
