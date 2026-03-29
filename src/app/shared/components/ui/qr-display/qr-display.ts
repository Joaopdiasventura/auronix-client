import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { QrService } from '../../../../core/services/qr/qr.service';

@Component({
  selector: 'app-qr-display',
  templateUrl: './qr-display.html',
  styleUrl: './qr-display.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrDisplay {
  public readonly description = input<string | null>(null);
  public readonly downloadFileName = input('auronix-qr');
  public readonly kicker = input<string | null>(null);
  public readonly payload = input<string | null>(null);
  public readonly title = input.required<string>();
  public readonly value = input.required<string>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly qrCodeDataUrl = signal('');
  protected readonly qrImageAlt = computed(() => `QR code para ${this.title()}`);

  private generationVersion = 0;
  private readonly qrService = inject(QrService);

  public constructor() {
    effect(() => {
      const payload = (this.payload() || this.value()).trim();
      const generationVersion = ++this.generationVersion;

      if (!payload) {
        this.errorMessage.set('Nenhum conteúdo disponível para este QR code');
        this.isLoading.set(false);
        this.qrCodeDataUrl.set('');
        return;
      }

      this.errorMessage.set(null);
      this.isLoading.set(true);
      this.qrCodeDataUrl.set('');

      void this.qrService
        .generatePngDataUrl(payload)
        .then((pngDataUrl) => {
          if (generationVersion != this.generationVersion) return;

          this.qrCodeDataUrl.set(pngDataUrl);
          this.isLoading.set(false);
        })
        .catch(() => {
          if (generationVersion != this.generationVersion) return;

          this.errorMessage.set('Não foi possível gerar este QR code');
          this.isLoading.set(false);
        });
    });
  }

  public download(): void {
    const qrCodeDataUrl = this.qrCodeDataUrl();
    if (!qrCodeDataUrl || typeof document == 'undefined') return;

    const anchor = document.createElement('a');
    anchor.href = qrCodeDataUrl;
    anchor.download = `${this.downloadFileName().trim() || 'auronix-qr'}.png`;
    anchor.click();
  }
}
