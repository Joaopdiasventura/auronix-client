import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { configureAxe } from 'vitest-axe';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PaymentRequestService } from '../../../core/services/payment-request/payment-request.service';
import { TransferService } from '../../../core/services/transfer/transfer.service';
import { UserService } from '../../../core/services/user/user.service';
import { TransferCreatePage } from './create-page';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});

describe('TransferCreatePage', () => {
  let fixture: ComponentFixture<TransferCreatePage>;
  let router: Router;
  const paymentRequestId = '550e8400-e29b-41d4-a716-446655440000';

  const authService = {
    clear: vi.fn(),
    data: signal({
      id: 'user-id',
      email: 'joao@auronix.com',
      name: 'Joao',
      balance: 100000,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    }),
  };

  const paymentRequestService = {
    findById: vi.fn(),
  };

  const transferService = {
    create: vi.fn(),
  };

  const userService = {
    findByEmail: vi.fn(),
  };

  async function configureComponent(
    queryParams: Record<string, string> | Subject<ParamMap>,
  ): Promise<void> {
    const queryParamMap =
      queryParams instanceof Subject
        ? queryParams.asObservable()
        : of(convertToParamMap(queryParams));

    await TestBed.configureTestingModule({
      imports: [TransferCreatePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap,
          },
        },
        { provide: AuthService, useValue: authService },
        { provide: PaymentRequestService, useValue: paymentRequestService },
        { provide: TransferService, useValue: transferService },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TransferCreatePage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();

    paymentRequestService.findById.mockReturnValue(
      of({
        id: paymentRequestId,
        value: 3500,
        createdAt: '2026-03-29T10:00:00.000Z',
        user: {
          id: 'payee-id',
          name: 'Maria',
        },
      }),
    );
    transferService.create.mockReturnValue(of({ id: 'transfer-id' }));
    userService.findByEmail.mockReturnValue(
      of({
        id: 'payee-id',
        email: 'maria@auronix.com',
        name: 'Maria',
        balance: 120000,
        createdAt: '2026-03-29T00:00:00.000Z',
        updatedAt: '2026-03-29T00:00:00.000Z',
      }),
    );
  });

  it('shows the email skeleton variant while the payee is loading', async () => {
    const payeeResponse$ = new Subject<{
      id: string;
      email: string;
      name: string;
      balance: number;
      createdAt: string;
      updatedAt: string;
    }>();
    userService.findByEmail.mockReturnValue(payeeResponse$.asObservable());

    await configureComponent({ email: 'maria@auronix.com' });

    let nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.page-shell')?.getAttribute('aria-busy')).toBe('true');
    expect(nativeElement.querySelectorAll('.authorization-form__field-skeleton')).toHaveLength(2);
    expect(
      nativeElement.querySelectorAll('app-skeleton-readonly-grid .readonly-field'),
    ).toHaveLength(3);
    expect(nativeElement.querySelector('#value')).toBeNull();

    payeeResponse$.next({
      id: 'payee-id',
      email: 'maria@auronix.com',
      name: 'Maria',
      balance: 120000,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    });
    payeeResponse$.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.page-shell')?.hasAttribute('aria-busy')).toBe(false);
    expect(nativeElement.querySelector('.authorization-form__field-skeleton')).toBeNull();
    expect(nativeElement.querySelector('#value')).not.toBeNull();
  });

  it('shows the payment request skeleton variant while the request is loading', async () => {
    const paymentRequestResponse$ = new Subject<{
      id: string;
      value: number;
      createdAt: string;
      user: {
        id: string;
        name: string;
      };
    }>();
    paymentRequestService.findById.mockReturnValue(paymentRequestResponse$.asObservable());

    await configureComponent({ paymentRequest: paymentRequestId });

    let nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.page-shell')?.getAttribute('aria-busy')).toBe('true');
    expect(nativeElement.querySelectorAll('.authorization-form__field-skeleton')).toHaveLength(1);
    expect(
      nativeElement.querySelectorAll('app-skeleton-readonly-grid .readonly-field'),
    ).toHaveLength(4);
    expect(nativeElement.querySelector('#value')).toBeNull();

    paymentRequestResponse$.next({
      id: paymentRequestId,
      value: 3500,
      createdAt: '2026-03-29T10:00:00.000Z',
      user: {
        id: 'payee-id',
        name: 'Maria',
      },
    });
    paymentRequestResponse$.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.page-shell')?.hasAttribute('aria-busy')).toBe(false);
    expect(nativeElement.querySelector('.authorization-form__field-skeleton')).toBeNull();
    expect(nativeElement.textContent).toContain(paymentRequestId);
  });

  it('renders the locked payment request data', async () => {
    await configureComponent({ paymentRequest: paymentRequestId });

    const nativeElement = fixture.nativeElement as HTMLElement;
    const readOnlyValues = Array.from(nativeElement.querySelectorAll('.readonly-field__value')).map(
      (element) => element.textContent?.trim(),
    );

    expect(nativeElement.textContent).toContain(paymentRequestId);
    expect(nativeElement.textContent).toContain('Maria');
    expect(nativeElement.querySelector('#value')).toBeNull();
    expect(readOnlyValues).toContain(paymentRequestId);
  });

  it('creates the transfer using the bound payment request', async () => {
    await configureComponent({ paymentRequest: paymentRequestId });

    const nativeElement = fixture.nativeElement as HTMLElement;
    const descriptionInput = nativeElement.querySelector('#description') as HTMLInputElement;

    descriptionInput.value = 'Cobrança principal';
    descriptionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(transferService.create).toHaveBeenCalledWith({
      payeeId: 'payee-id',
      value: 3500,
      description: 'Cobrança principal',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/transfer', 'transfer-id']);
  });

  it('resolves the payee by email and allows value editing', async () => {
    await configureComponent({ email: 'maria@auronix.com' });

    const nativeElement = fixture.nativeElement as HTMLElement;
    const valueInput = nativeElement.querySelector('#value') as HTMLInputElement;
    const descriptionInput = nativeElement.querySelector('#description') as HTMLInputElement;

    expect(nativeElement.textContent).toContain('maria@auronix.com');

    valueInput.value = '199,90';
    valueInput.dispatchEvent(new Event('input'));
    descriptionInput.value = 'Transferencia por chave';
    descriptionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(userService.findByEmail).toHaveBeenCalledWith('maria@auronix.com');
    expect(transferService.create).toHaveBeenCalledWith({
      payeeId: 'payee-id',
      value: 19990,
      description: 'Transferencia por chave',
    });
  });

  it('creates the transfer without description when the field is blank', async () => {
    await configureComponent({ email: 'maria@auronix.com' });

    const nativeElement = fixture.nativeElement as HTMLElement;
    const valueInput = nativeElement.querySelector('#value') as HTMLInputElement;

    valueInput.value = '199,90';
    valueInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(transferService.create).toHaveBeenCalledWith({
      payeeId: 'payee-id',
      value: 19990,
    });
  });

  it('shows a page error when both query params are present', async () => {
    await configureComponent({
      email: 'maria@auronix.com',
      paymentRequest: paymentRequestId,
    });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Informe apenas uma chave de transferência por vez',
    );
  });

  it('resets editable fields when the transfer target changes', async () => {
    const queryParamMap$ = new Subject<ParamMap>();

    await configureComponent(queryParamMap$);

    queryParamMap$.next(convertToParamMap({ email: 'maria@auronix.com' }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const valueInput = nativeElement.querySelector('#value') as HTMLInputElement;
    const descriptionInput = nativeElement.querySelector('#description') as HTMLInputElement;

    valueInput.value = '199,90';
    valueInput.dispatchEvent(new Event('input'));
    descriptionInput.value = 'Transferencia por chave';
    descriptionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    queryParamMap$.next(convertToParamMap({ paymentRequest: paymentRequestId }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const updatedNativeElement = fixture.nativeElement as HTMLElement;
    const updatedDescriptionInput = updatedNativeElement.querySelector(
      '#description',
    ) as HTMLInputElement;

    expect(updatedNativeElement.querySelector('#value')).toBeNull();
    expect(updatedDescriptionInput.value).toBe('');
  });

  it('ignores stale target responses after the route params change', async () => {
    const queryParamMap$ = new Subject<ParamMap>();
    const payeeResponse$ = new Subject<{
      id: string;
      email: string;
      name: string;
      balance: number;
      createdAt: string;
      updatedAt: string;
    }>();
    const paymentRequestResponse$ = new Subject<{
      id: string;
      value: number;
      createdAt: string;
      user: {
        id: string;
        name: string;
      };
    }>();

    userService.findByEmail.mockReturnValue(payeeResponse$.asObservable());
    paymentRequestService.findById.mockReturnValue(paymentRequestResponse$.asObservable());

    await configureComponent(queryParamMap$);

    queryParamMap$.next(convertToParamMap({ email: 'stale@auronix.com' }));
    fixture.detectChanges();
    await fixture.whenStable();

    queryParamMap$.next(convertToParamMap({ paymentRequest: paymentRequestId }));
    fixture.detectChanges();
    await fixture.whenStable();

    payeeResponse$.next({
      id: 'stale-payee-id',
      email: 'stale@auronix.com',
      name: 'Favorecido antigo',
      balance: 120000,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    });
    payeeResponse$.complete();
    fixture.detectChanges();

    paymentRequestResponse$.next({
      id: paymentRequestId,
      value: 3500,
      createdAt: '2026-03-29T10:00:00.000Z',
      user: {
        id: 'current-payee-id',
        name: 'Favorecido atual',
      },
    });
    paymentRequestResponse$.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Favorecido atual');
    expect(nativeElement.textContent).not.toContain('Favorecido antigo');
  });

  it('shows the backend message when the payment request was already used', async () => {
    paymentRequestService.findById.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Cobrança já utilizada',
        },
        status: 409,
      })),
    );

    await configureComponent({ paymentRequest: paymentRequestId });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cobrança já utilizada');
  });

  it('has no critical accessibility violations in email mode', async () => {
    await configureComponent({ email: 'maria@auronix.com' });

    const results = await axe(fixture.nativeElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });

  it('has no critical accessibility violations in payment request mode', async () => {
    await configureComponent({ paymentRequest: paymentRequestId });

    const results = await axe(fixture.nativeElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });
});
