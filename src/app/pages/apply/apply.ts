import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { COURSES } from '../../site-data';

@Component({
  selector: 'app-apply',
  imports: [ReactiveFormsModule],
  templateUrl: './apply.html',
})
export class Apply {
  private readonly fb = inject(FormBuilder);
  readonly courses = COURSES;
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    course: ['', Validators.required],
    background: ['', Validators.required],
  });

  invalid(control: 'name' | 'email' | 'course' | 'background'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent.set(true);
  }
}
