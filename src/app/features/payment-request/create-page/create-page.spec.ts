import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { configureAxe } from 'vitest-axe';
import { vi } from 'vitest';
import { PaymentRequestService } from '../../../core/services/payment-request/payment-request.service';
import { PaymentRequestCreatePage } from './create-page';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});

describe('PaymentRequestCreatePage', () => {
  let component: PaymentRequestCreatePage;
  let fixture: ComponentFixture<PaymentRequestCreatePage>;
  let originalClipboard: Clipboard | undefined;
  let originalShare: Navigator['share'] | undefined;

  const paymentRequestService = {
    create: vi.fn().mockReturnValue(
      of({
        id: 'request-id',
        value: 15000,
        createdAt: '2026-03-29T00:00:00.000Z',
      }),
    ),
  };

  async function createComponent(options?: {
    clipboard?: Clipboard | undefined;
    share?: Navigator['share'];
  }): Promise<void> {
    setNavigatorApis(options);

    await TestBed.configureTestingModule({
      imports: [PaymentRequestCreatePage],
      providers: [
        provideRouter([]),
        { provide: PaymentRequestService, useValue: paymentRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentRequestCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();

    originalClipboard = navigator.clipboard;
    originalShare = navigator.share;

    paymentRequestService.create.mockReturnValue(
      of({
        id: 'request-id',
        value: 15000,
        createdAt: '2026-03-29T00:00:00.000Z',
      }),
    );
  });

  afterEach(() => {
    setNavigatorApis({
      clipboard: originalClipboard,
      share: originalShare,
    });
  });

  it('creates a request and shows the share url', async () => {
    await createComponent();

    fillInput('value', '150,00');

    component.submit(new Event('submit'));
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const shareUrl = nativeElement.querySelector('#share-url') as HTMLInputElement;

    expect(paymentRequestService.create).toHaveBeenCalledWith({ value: 15000 });
    expect(nativeElement.textContent).toContain('request-id');
    expect(shareUrl.value).toContain('/payment-request/request-id');
  });

  it('shows the backend error message when the request creation fails', async () => {
    paymentRequestService.create.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Não foi possível criar a cobrança',
        },
      })),
    );

    await createComponent();

    fillInput('value', '150,00');

    component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Não foi possível criar a cobrança',
    );
  });

  it('does not submit when the form is invalid', async () => {
    await createComponent();

    component.submit(new Event('submit'));
    fixture.detectChanges();

    expect(paymentRequestService.create).not.toHaveBeenCalled();
  });

  it('resets the page state after creating a request', async () => {
    await createComponent();

    fillInput('value', '150,00');

    component.submit(new Event('submit'));
    fixture.detectChanges();

    component.reset();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const valueInput = nativeElement.querySelector('#value') as HTMLInputElement;

    expect(nativeElement.querySelector('#share-url')).toBeNull();
    expect(valueInput.value).toBe('');
    expect(component['createdPaymentRequest']()).toBeNull();
  });

  it('copies the share link to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await createComponent({
      clipboard: {
        writeText,
      } as unknown as Clipboard,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.copyShareLink();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/payment-request/request-id`);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Link copiado para a área de transferência',
    );
  });

  it('shows a fallback message when the clipboard API is unavailable', async () => {
    await createComponent({
      clipboard: undefined,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.copyShareLink();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Não foi possível copiar o link automaticamente',
    );
  });

  it('shares the request with the native share API when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await createComponent({
      share,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.shareRequest();
    fixture.detectChanges();

    expect(share).toHaveBeenCalledWith({
      title: 'Cobrança Auronix',
      text: 'Use este link para validar a cobrança.',
      url: `${window.location.origin}/payment-request/request-id`,
    });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Link compartilhado com sucesso',
    );
  });

  it('falls back to the clipboard when native share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await createComponent({
      clipboard: {
        writeText,
      } as unknown as Clipboard,
      share: undefined,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.shareRequest();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/payment-request/request-id`);
  });

  it('ignores aborted native share attempts', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Share aborted', 'AbortError'));

    await createComponent({
      share,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.shareRequest();
    fixture.detectChanges();

    expect(component['shareMessage']()).toBeNull();
  });

  it('shows a message when the native share API fails unexpectedly', async () => {
    const share = vi.fn().mockRejectedValue(new Error('share-failed'));

    await createComponent({
      share,
    });

    fillInput('value', '150,00');
    component.submit(new Event('submit'));
    fixture.detectChanges();

    await component.shareRequest();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Não foi possível compartilhar o link',
    );
  });

  it('has no critical accessibility violations in the billing form', async () => {
    await createComponent();

    const results = await axe(fixture.nativeElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });

  function fillInput(id: string, value: string): void {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function setNavigatorApis(options?: {
    clipboard?: Clipboard | undefined;
    share?: Navigator['share'];
  }): void {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: options?.clipboard,
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: options?.share,
    });
  }
});
