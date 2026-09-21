import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PILLARS } from '../../site-data';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class About {
  readonly pillars = PILLARS;
}
