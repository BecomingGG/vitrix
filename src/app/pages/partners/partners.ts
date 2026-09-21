import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTNERS } from '../../site-data';

@Component({
  selector: 'app-partners',
  imports: [RouterLink],
  templateUrl: './partners.html',
})
export class Partners {
  readonly partners = PARTNERS;
}
