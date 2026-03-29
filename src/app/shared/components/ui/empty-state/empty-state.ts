import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  public readonly description = input.required<string>();
  public readonly eyebrow = input<string | null>(null);
  public readonly title = input.required<string>();
}
