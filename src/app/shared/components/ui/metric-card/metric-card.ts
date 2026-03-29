import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCard {
  public readonly helper = input.required<string>();
  public readonly label = input.required<string>();
  public readonly tone = input<'info' | 'negative' | 'neutral' | 'positive'>('neutral');
  public readonly value = input.required<string>();
}
