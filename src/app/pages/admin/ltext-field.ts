import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LTextGroup } from './forms';

/**
 * One field in both languages, side by side: English | ქართული.
 * <app-ltext-field label="Title" [group]="form.controls.title" required />
 */
@Component({
  selector: 'app-ltext-field',
  imports: [ReactiveFormsModule],
  template: `
    <fieldset class="ltext" [formGroup]="group()">
      <legend>
        {{ label() }}
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </legend>
      <label>
        <span class="lang">EN</span>
        @if (multiline()) {
          <textarea
            formControlName="en"
            [rows]="rows()"
            [attr.aria-label]="label() + ' (English)'"
          ></textarea>
        } @else {
          <input type="text" formControlName="en" [attr.aria-label]="label() + ' (English)'" />
        }
      </label>
      <label>
        <span class="lang">KA</span>
        @if (multiline()) {
          <textarea
            formControlName="ka"
            [rows]="rows()"
            lang="ka"
            [attr.aria-label]="label() + ' (Georgian)'"
          ></textarea>
        } @else {
          <input
            type="text"
            formControlName="ka"
            lang="ka"
            [attr.aria-label]="label() + ' (Georgian)'"
          />
        }
      </label>
      @if (group().controls.en.invalid && group().controls.en.touched) {
        <span class="error">Enter the English {{ label().toLowerCase() }}.</span>
      }
      @if (hint()) {
        <span class="hint">{{ hint() }}</span>
      }
    </fieldset>
  `,
})
export class LTextField {
  readonly label = input.required<string>();
  readonly group = input.required<LTextGroup>();
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly rows = input(3, { transform: numberAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly hint = input('');
}
