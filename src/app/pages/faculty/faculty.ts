import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FACULTY } from '../../site-data';

@Component({
  selector: 'app-faculty',
  imports: [RouterLink],
  templateUrl: './faculty.html',
})
export class Faculty {
  readonly faculty = FACULTY;
}
