import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import jsQR from 'jsqr';

interface BarcodeDetectorOptionsLike {
  formats?: string[];
}

interface DetectedBarcodeLike {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]>;
}

type BarcodeDetectorConstructorLike = new (
  options?: BarcodeDetectorOptionsLike,
) => BarcodeDetectorLike;

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScanner implements AfterViewInit, OnDestroy {
  public readonly description = input<string | null>(
    'Aponte a câmera para um QR code com e-mail ou identificador de cobrança.',
  );
  public readonly title = input('Leitor de QR code');

  public readonly closeRequested = output<void>();
  public readonly scanned = output<string>();

  @ViewChild('videoElement')
  private videoElement?: ElementRef<HTMLVideoElement>;

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isScanning = signal(false);
  protected readonly isSupported = signal(this.hasCameraSupport());

  private barcodeDetector: BarcodeDetectorLike | null = null;
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private fallbackContext: CanvasRenderingContext2D | null = null;
  private isDetectingFrame = false;
  private scanTimerId: number | null = null;
  private stream: MediaStream | null = null;

  public ngAfterViewInit(): void {
    void this.startScanner();
  }

  public ngOnDestroy(): void {
    this.stopScanner();
  }

  public close(): void {
    this.stopScanner();
    this.closeRequested.emit();
  }

  public retry(): void {
    this.errorMessage.set(null);
    void this.startScanner();
  }

  private async startScanner(): Promise<void> {
    if (!this.isSupported()) {
      this.errorMessage.set(
        'Leitura por câmera indisponível neste navegador. Digite a chave manualmente.',
      );
      return;
    }

    const videoElement = this.videoElement?.nativeElement;
    if (!videoElement || typeof navigator == 'undefined') return;

    this.stopScanner();
    this.errorMessage.set(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: {
            ideal: 'environment',
          },
        },
      });

      this.stream = stream;
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.playsInline = true;

      await videoElement.play();

      this.isScanning.set(true);
      this.scheduleDetection();
    } catch {
      this.errorMessage.set('Não foi possível acessar a câmera deste dispositivo.');
      this.stopScanner();
    }
  }

  private stopScanner(): void {
    this.isScanning.set(false);
    this.clearScanTimer();

    const videoElement = this.videoElement?.nativeElement;
    if (videoElement) videoElement.srcObject = null;

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private scheduleDetection(): void {
    this.clearScanTimer();
    this.scanTimerId = window.setInterval(() => {
      void this.detectFrame();
    }, 400);
  }

  private clearScanTimer(): void {
    if (this.scanTimerId == null) return;

    clearInterval(this.scanTimerId);
    this.scanTimerId = null;
  }

  private async detectFrame(): Promise<void> {
    const videoElement = this.videoElement?.nativeElement;

    if (!videoElement || this.isDetectingFrame) return;
    if (videoElement.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;

    this.isDetectingFrame = true;

    try {
      const rawValue = await this.readQrValue(videoElement);
      if (!rawValue) return;

      this.scanned.emit(rawValue);
      this.stopScanner();
    } catch {
      this.errorMessage.set('Não foi possível ler o QR code pela câmera.');
      this.stopScanner();
    } finally {
      this.isDetectingFrame = false;
    }
  }

  private async readQrValue(videoElement: HTMLVideoElement): Promise<string | null> {
    const barcodeDetector = this.resolveBarcodeDetector();
    if (barcodeDetector) {
      const barcodes = await barcodeDetector.detect(videoElement);
      return barcodes.find((barcode) => barcode.rawValue?.trim())?.rawValue?.trim() || null;
    }

    return this.readQrValueWithCanvas(videoElement);
  }

  private readQrValueWithCanvas(videoElement: HTMLVideoElement): string | null {
    const width = videoElement.videoWidth || videoElement.clientWidth;
    const height = videoElement.videoHeight || videoElement.clientHeight;
    if (!width || !height) return null;

    const context = this.resolveFallbackContext(width, height);
    if (!context) throw new Error('qr-canvas-unavailable');

    context.drawImage(videoElement, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    return code?.data?.trim() || null;
  }

  private resolveFallbackContext(
    width: number,
    height: number,
  ): CanvasRenderingContext2D | null {
    if (typeof document == 'undefined') return null;

    if (!this.fallbackCanvas) {
      this.fallbackCanvas = document.createElement('canvas');
      this.fallbackContext = this.fallbackCanvas.getContext('2d');
    }

    if (!this.fallbackCanvas || !this.fallbackContext) return null;

    if (this.fallbackCanvas.width != width) this.fallbackCanvas.width = width;
    if (this.fallbackCanvas.height != height) this.fallbackCanvas.height = height;

    return this.fallbackContext;
  }

  private resolveBarcodeDetector(): BarcodeDetectorLike | null {
    if (this.barcodeDetector) return this.barcodeDetector;

    const BarcodeDetector = this.getBarcodeDetectorConstructor();
    if (!BarcodeDetector) return null;

    this.barcodeDetector = new BarcodeDetector({
      formats: ['qr_code'],
    });

    return this.barcodeDetector;
  }

  private getBarcodeDetectorConstructor(): BarcodeDetectorConstructorLike | null {
    if (typeof globalThis == 'undefined') return null;

    const candidate = (globalThis as { BarcodeDetector?: BarcodeDetectorConstructorLike })
      .BarcodeDetector;

    return typeof candidate == 'function' ? candidate : null;
  }

  private hasCameraSupport(): boolean {
    if (typeof navigator == 'undefined') return false;

    return !!navigator.mediaDevices?.getUserMedia;
  }
}
