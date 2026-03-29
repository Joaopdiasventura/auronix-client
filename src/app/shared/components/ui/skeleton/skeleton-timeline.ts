import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from './skeleton';

@Component({
  selector: 'app-skeleton-timeline',
  imports: [Skeleton],
  template: `
    <div class="skeleton-timeline" aria-hidden="true">
      @for (item of items(); track item) {
        <div class="skeleton-timeline__item">
          <app-skeleton height="0.875rem" shape="circle" width="0.875rem" />

          <div class="skeleton-timeline__content">
            <app-skeleton height="0.95rem" width="8rem" />
            <app-skeleton height="0.8rem" width="6.75rem" />
            <app-skeleton height="0.85rem" width="100%" />
            <app-skeleton height="0.85rem" width="82%" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .skeleton-timeline {
        display: grid;
        gap: 0;
      }

      .skeleton-timeline__item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--stack-md);
        align-items: start;
        padding: 0.125rem 0 0.875rem;
      }

      .skeleton-timeline__item:last-child {
        padding-bottom: 0;
      }

      .skeleton-timeline__content {
        display: grid;
        gap: var(--stack-xs);
        padding-bottom: 0.125rem;
        border-bottom: 1px solid var(--color-stroke);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
  },
})
export class SkeletonTimeline {
  public readonly steps = input(2);

  protected readonly items = computed(() =>
    Array.from({ length: this.steps() }, (_, index) => index),
  );
}
