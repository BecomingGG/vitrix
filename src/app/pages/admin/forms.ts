import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LText } from '../../content/content.models';

export type LTextGroup = FormGroup<{
  en: import('@angular/forms').FormControl<string>;
  ka: import('@angular/forms').FormControl<string>;
}>;

/** A form group for a text in English + Georgian. English is required when `required` is set. */
export function ltextGroup(fb: FormBuilder, value?: LText | null, required = false): LTextGroup {
  return fb.nonNullable.group({
    en: [value?.en ?? '', required ? [Validators.required] : []],
    ka: [value?.ka ?? ''],
  });
}

/** "Advanced Cardiac Life Support" -> "advanced-cardiac-life-support" (letters, digits, dashes). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Moves item i by delta (-1 up, +1 down) and returns a new array. */
export function move<T>(list: T[], i: number, delta: number): T[] {
  const j = i + delta;
  if (j < 0 || j >= list.length) {
    return list;
  }
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}
