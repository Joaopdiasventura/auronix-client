import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TransferStatus } from '../../../core/enums/transfer/transfer-status.enum';
import { Transfer } from '../../../core/models/transfer';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { TransferService } from '../../../core/services/transfer/transfer.service';
import { PageHeader } from '../../../shared/components/ui/page-header/page-header';
import { Skeleton } from '../../../shared/components/ui/skeleton/skeleton';
import { SkeletonReadonlyGrid } from '../../../shared/components/ui/skeleton/skeleton-readonly-grid';
import { SkeletonTimeline } from '../../../shared/components/ui/skeleton/skeleton-timeline';
import { StatusChip } from '../../../shared/components/ui/status-chip/status-chip';
import { TimelineStep } from '../../../shared/view-models/ui';
import { formatCurrency } from '../../../shared/utils/format-currency';
import { formatDateTime } from '../../../shared/utils/format-date-time';

@Component({
  selector: 'app-transfer-details-page',
  imports: [PageHeader, RouterLink, Skeleton, SkeletonReadonlyGrid, SkeletonTimeline, StatusChip],
  templateUrl: './details-page.html',
  styleUrl: './details-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferDetailsPage {
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly transfer = signal<Transfer | null>(null);
  protected readonly transferId = inject(ActivatedRoute).snapshot.paramMap.get('id') || '';

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly transferService = inject(TransferService);

  protected readonly amountLabel = computed(() => {
    const transfer = this.transfer();
    if (!transfer) return '';

    const sign = this.isOutgoingTransfer(transfer) ? '- ' : '+ ';
    return sign + formatCurrency(transfer.value);
  });
  protected readonly shouldShowSkeleton = computed(
    () => this.isLoading() && this.transfer() == null,
  );
  protected readonly transferMetaSkeletonLabelWidths = ['5.5rem', '4.75rem', '6rem'];
  protected readonly transferMetaSkeletonValueWidths = ['12rem', '9rem', '9rem'];
  protected readonly timelineSteps = computed<TimelineStep[]>(() => {
    const transfer = this.transfer();
    if (!transfer) return [];

    const completedAt = transfer.completedAt;

    return [
      {
        description: 'Transferência registrada e vinculada à cobrança de origem.',
        isCurrent: !completedAt,
        label: 'Registro inicial',
        timestampLabel: this.formatDate(transfer.createdAt),
        tone: 'info',
      },
      {
        description: completedAt
          ? 'Liquidação concluída e refletida no saldo da conta.'
          : transfer.status == TransferStatus.Failed
            ? 'A operação falhou e não alterou o saldo final da conta.'
            : 'A operação segue em processamento ou validação.',
        isCurrent: !!completedAt || transfer.status == TransferStatus.Failed,
        label: transfer.status == TransferStatus.Failed ? 'Falha operacional' : 'Liquidação final',
        timestampLabel: this.formatDate(completedAt || transfer.updatedAt),
        tone:
          transfer.status == TransferStatus.Completed
            ? 'success'
            : transfer.status == TransferStatus.Failed
              ? 'danger'
              : 'neutral',
      },
    ];
  });

  public constructor() {
    this.loadTransfer();

    this.notificationService
      .connect()
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event.data.transferId != this.transferId) return;
        this.loadTransfer(false);
      });
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Aguardando processamento';
    return formatDateTime(value);
  }

  protected isOutgoingTransfer(transfer: Transfer): boolean {
    return transfer.payer.id == this.authService.data()?.id;
  }

  protected resolveAmountTone(): 'danger' | 'success' {
    return this.transfer() && this.isOutgoingTransfer(this.transfer()!) ? 'danger' : 'success';
  }

  protected resolveCounterpartyLabel(transfer: Transfer): string {
    return this.isOutgoingTransfer(transfer)
      ? `Favorecido: ${transfer.payee.name}`
      : `Pagador: ${transfer.payer.name}`;
  }

  protected resolveDescription(transfer: Transfer): string {
    return transfer.description?.trim() || 'Sem descrição informada';
  }

  protected statusLabel(status: TransferStatus): string {
    if (status == TransferStatus.Completed) return 'Concluída';
    if (status == TransferStatus.Failed) return 'Falhou';
    return 'Pendente';
  }

  protected statusTone(status: TransferStatus): 'danger' | 'success' | 'warning' {
    if (status == TransferStatus.Completed) return 'success';
    if (status == TransferStatus.Failed) return 'danger';
    return 'warning';
  }

  private loadTransfer(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transferService.findById(this.transferId).subscribe({
      next: (transfer) => {
        this.transfer.set(transfer);
        this.isLoading.set(false);
      },
      error: ({ error }) => {
        this.errorMessage.set(error.message || 'Não foi possível carregar esta transferência');
        this.isLoading.set(false);
      },
    });
  }
}
