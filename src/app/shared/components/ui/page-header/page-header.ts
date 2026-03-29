import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  public readonly description = input<string | null>(null);
  public readonly kicker = input<string | null>(null);
  public readonly title = input.required<string>();
}
