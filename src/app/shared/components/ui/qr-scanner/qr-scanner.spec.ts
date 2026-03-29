import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

const jsQrMock = vi.fn();

describe('QrScanner', () => {
  let QrScannerComponent: typeof import('./qr-scanner').QrScanner;
  let fixture: ComponentFixture<InstanceType<typeof QrScannerComponent>> | null = null;
  let canvasContextSpy: ReturnType<typeof vi.spyOn>;
  let originalBarcodeDetector:
    | (typeof globalThis & { BarcodeDetector?: unknown })['BarcodeDetector']
    | undefined;
  let originalMediaDevices: MediaDevices | undefined;
  let playSpy: ReturnType<typeof vi.spyOn>;
  let scannedValues: string[];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.doMock('jsqr', () => ({
      default: jsQrMock,
    }));
    jsQrMock.mockReset();
    scannedValues = [];
    ({ QrScanner: QrScannerComponent } = await import('./qr-scanner'));
    originalBarcodeDetector = (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
    originalMediaDevices = navigator.mediaDevices;
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined as never);
    canvasContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    playSpy.mockRestore();
    canvasContextSpy.mockRestore();

    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: originalMediaDevices,
      });
    } else {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: undefined,
      });
    }

    if (originalBarcodeDetector) {
      (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = originalBarcodeDetector;
    } else {
      delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
    }
  });

  it('shows the manual fallback when camera access is not supported', async () => {
    delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });

    await TestBed.configureTestingModule({
      imports: [QrScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScannerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Leitura por câmera indisponível neste navegador',
    );
  });

  it('emits the scanned QR content when BarcodeDetector finds a value', async () => {
    class FakeBarcodeDetector {
      public async detect(): Promise<{ rawValue: string }[]> {
        return [{ rawValue: 'maria@auronix.com' }];
      }
    }

    (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = FakeBarcodeDetector;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [QrScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScannerComponent);
    fixture.componentInstance.scanned.subscribe((value) => {
      scannedValues.push(value);
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance['clearScanTimer']();

    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(videoElement, 'readyState', {
      configurable: true,
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    });

    await fixture.componentInstance['detectFrame']();
    fixture.detectChanges();

    expect(scannedValues).toEqual(['maria@auronix.com']);
  });

  it('emits the scanned QR content with the jsQR fallback when BarcodeDetector is unavailable', async () => {
    delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
    jsQrMock.mockReturnValue({ data: 'maria@auronix.com' });
    canvasContextSpy.mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(16),
        width: 2,
        height: 2,
      }),
    } as unknown as CanvasRenderingContext2D);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [QrScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScannerComponent);
    fixture.componentInstance.scanned.subscribe((value) => {
      scannedValues.push(value);
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance['clearScanTimer']();

    const videoElement = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(videoElement, 'readyState', {
      configurable: true,
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    });
    Object.defineProperty(videoElement, 'videoWidth', {
      configurable: true,
      value: 320,
    });
    Object.defineProperty(videoElement, 'videoHeight', {
      configurable: true,
      value: 240,
    });

    await fixture.componentInstance['detectFrame']();
    fixture.detectChanges();

    expect(jsQrMock).toHaveBeenCalled();
    expect(scannedValues).toEqual(['maria@auronix.com']);
  });
});
