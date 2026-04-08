import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Skeleton } from './skeleton';

@Component({
  selector: 'app-skeleton-list-row',
  imports: [Skeleton],
  template: `
    <article
      class="skeleton-list-row"
      [class.skeleton-list-row--history]="variant() === 'history'"
      [class.skeleton-list-row--ledger]="variant() === 'ledger'"
      aria-hidden="true"
    >
      <div class="skeleton-list-row__main">
        <div class="skeleton-list-row__headline">
          <app-skeleton height="1rem" width="11rem" />
          <app-skeleton height="1.55rem" radius="var(--radius-pill)" width="5.5rem" />
        </div>

        <app-skeleton height="0.875rem" width="14rem" />
      </div>

      @if (variant() === 'history') {
        <div class="skeleton-list-row__nature">
          <app-skeleton height="0.75rem" width="4rem" />
          <app-skeleton height="0.85rem" width="6.75rem" />
        </div>

        <app-skeleton height="1rem" width="5rem" />
      } @else {
        <div class="skeleton-list-row__meta">
          <app-skeleton height="0.85rem" width="6.75rem" />
          <app-skeleton height="1rem" width="5rem" />
        </div>
      }
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host(:first-child) .skeleton-list-row {
        padding-top: 0;
        border-top: none;
      }

      .skeleton-list-row {
        display: grid;
        gap: 0.875rem;
        align-items: center;
        padding: 0.9375rem 0;
        border-top: 1px solid var(--color-stroke);
      }

      .skeleton-list-row--ledger {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .skeleton-list-row--history {
        grid-template-columns: minmax(0, 1fr) auto auto;
      }

      .skeleton-list-row__headline {
        display: flex;
        gap: var(--stack-md);
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .skeleton-list-row__main,
      .skeleton-list-row__meta,
      .skeleton-list-row__nature {
        display: grid;
        gap: var(--stack-xs);
      }

      .skeleton-list-row__meta,
      .skeleton-list-row__nature {
        justify-items: end;
      }

      @media (max-width: 760px) {
        .skeleton-list-row--history,
        .skeleton-list-row--ledger {
          grid-template-columns: 1fr;
        }

        .skeleton-list-row__meta,
        .skeleton-list-row__nature {
          justify-items: start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
  },
})
export class SkeletonListRow {
  public readonly variant = input<'history' | 'ledger'>('history');
}
