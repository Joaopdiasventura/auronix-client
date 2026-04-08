import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { QrScanner } from './qr-scanner';

describe('QrScanner', () => {
  let fixture: ComponentFixture<QrScanner> | null = null;
  let originalBarcodeDetector:
    | (typeof globalThis & { BarcodeDetector?: unknown })['BarcodeDetector']
    | undefined;
  let originalMediaDevices: MediaDevices | undefined;
  let playSpy: ReturnType<typeof vi.spyOn> | null = null;
  let scannedValues: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    scannedValues = [];
    originalBarcodeDetector = (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
    originalMediaDevices = navigator.mediaDevices;
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    playSpy?.mockRestore();
    playSpy = null;

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
      imports: [QrScanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
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
      imports: [QrScanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
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
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [QrScanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
    fixture.componentInstance.scanned.subscribe((value) => {
      scannedValues.push(value);
    });
    const readQrValueWithCanvasSpy = vi
      .spyOn(
        fixture.componentInstance as unknown as { readQrValueWithCanvas: (video: HTMLVideoElement) => string | null },
        'readQrValueWithCanvas',
      )
      .mockReturnValue('maria@auronix.com');
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

    expect(readQrValueWithCanvasSpy).toHaveBeenCalledWith(videoElement);
    expect(scannedValues).toEqual(['maria@auronix.com']);
  });
});
