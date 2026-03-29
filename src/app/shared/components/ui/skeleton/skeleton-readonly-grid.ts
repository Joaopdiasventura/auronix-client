import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from './skeleton';

@Component({
  selector: 'app-skeleton-readonly-grid',
  imports: [Skeleton],
  template: `
    <div class="readonly-grid" aria-hidden="true">
      @for (item of items(); track item) {
        <div class="readonly-field">
          <app-skeleton [width]="resolveWidth(labelWidths(), item, '5rem')" height="0.65rem" />
          <app-skeleton [width]="resolveWidth(valueWidths(), item, '10rem')" height="0.95rem" />
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
  },
})
export class SkeletonReadonlyGrid {
  public readonly fields = input(3);
  public readonly labelWidths = input<string[]>([]);
  public readonly valueWidths = input<string[]>([]);

  protected readonly items = computed(() =>
    Array.from({ length: this.fields() }, (_, index) => index),
  );

  protected resolveWidth(widths: string[], index: number, fallback: string): string {
    return widths[index] || fallback;
  }
}
