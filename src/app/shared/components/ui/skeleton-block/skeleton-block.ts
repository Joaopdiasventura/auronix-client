import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-block',
  templateUrl: './skeleton-block.html',
  styleUrl: './skeleton-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
  },
})
export class SkeletonBlock {
  public readonly kind = input<'form' | 'lines' | 'panel' | 'table'>('panel');
  public readonly rows = input(3);

  protected readonly items = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => index),
  );
}
