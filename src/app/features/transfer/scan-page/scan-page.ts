import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/components/ui/page-header/page-header';
import { QrScanner } from '../../../shared/components/ui/qr-scanner/qr-scanner';
import { resolveTransferKey } from '../../../shared/utils/resolve-transfer-key';

@Component({
  selector: 'app-transfer-scan-page',
  imports: [PageHeader, QrScanner, RouterLink],
  templateUrl: './scan-page.html',
  styleUrl: './scan-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferScanPage {
  protected readonly errorMessage = signal<string | null>(null);

  private readonly router = inject(Router);

  public handleScannedKey(rawValue: string): void {
    const resolution = resolveTransferKey(rawValue);

    if (resolution.kind == 'invalid') {
      this.errorMessage.set('O QR code lido não contém um link, e-mail ou identificador válido');
      return;
    }

    this.errorMessage.set(null);

    void this.router.navigate(['/transfer/create'], {
      queryParams:
        resolution.kind == 'email'
          ? {
              email: resolution.value,
            }
          : {
              paymentRequest: resolution.value,
            },
    });
  }

  public closeScanner(): void {
    void this.router.navigate(['/transfer/key']);
  }
}
