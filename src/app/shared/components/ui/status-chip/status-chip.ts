import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChip {
  public readonly label = input.required<string>();
  public readonly tone = input<'danger' | 'info' | 'neutral' | 'success' | 'warning'>('neutral');
}
