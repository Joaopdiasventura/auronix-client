import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './app-icon.html',
  styleUrl: './app-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIcon {
  public readonly label = input<string | null>(null);
  public readonly name = input.required<'dashboard' | 'payment-request' | 'profile' | 'transfer'>();
}
