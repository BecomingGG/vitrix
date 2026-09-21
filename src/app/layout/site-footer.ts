import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_NAV } from '../site-data';
import { Mark } from '../mark';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, Mark],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  readonly nav = FOOTER_NAV;
  readonly year = 2025;
}
