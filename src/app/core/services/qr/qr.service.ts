import { Injectable } from '@angular/core';
import { toDataURL } from 'qrcode';

export interface TransferQrEntry {
  kind: 'email' | 'paymentRequest';
  value: string;
}

const QR_CODE_WIDTH = 960;

@Injectable({
  providedIn: 'root',
})
export class QrService {
  public buildTransferEntryUrl(entry: TransferQrEntry): string {
    const url = new URL('/transfer/key', this.resolveOrigin());
    const paramName = entry.kind == 'email' ? 'email' : 'paymentRequest';

    url.searchParams.set(paramName, this.normalizeEntryValue(entry));
    return url.toString();
  }

  public buildDownloadFileName(entry: TransferQrEntry): string {
    if (entry.kind == 'paymentRequest') {
      return `auronix-payment-request-${this.normalizeEntryValue(entry)}`;
    }

    const token = this.normalizeEntryValue(entry)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `auronix-email-${token || 'account'}`;
  }

  public generatePngDataUrl(payload: string): Promise<string> {
    return toDataURL(payload, {
      color: {
        dark: '#f5f7fa',
        light: '#00000000',
      },
      errorCorrectionLevel: 'M',
      margin: 2,
      width: QR_CODE_WIDTH,
    });
  }

  private normalizeEntryValue(entry: TransferQrEntry): string {
    return entry.value.trim().toLowerCase();
  }

  private resolveOrigin(): string {
    if (typeof window == 'undefined') {
      return 'http://localhost';
    }

    return window.location.origin;
  }
}
