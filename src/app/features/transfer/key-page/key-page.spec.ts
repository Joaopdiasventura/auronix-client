import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { configureAxe } from 'vitest-axe';
import { vi } from 'vitest';
import { TransferKeyPage } from './key-page';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});

describe('TransferKeyPage', () => {
  let fixture: ComponentFixture<TransferKeyPage>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferKeyPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TransferKeyPage);
    fixture.detectChanges();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes to the transfer form with the email query param', async () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const keyInput = nativeElement.querySelector('#key') as HTMLInputElement;

    keyInput.value = 'maria@auronix.com';
    keyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/create'], {
      queryParams: { email: 'maria@auronix.com' },
    });
  });

  it('routes to the transfer form with the payment request query param', async () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const keyInput = nativeElement.querySelector('#key') as HTMLInputElement;

    keyInput.value = '550e8400-e29b-41d4-a716-446655440000';
    keyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/create'], {
      queryParams: { paymentRequest: '550e8400-e29b-41d4-a716-446655440000' },
    });
  });

  it('shows an error for an invalid key', async () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const keyInput = nativeElement.querySelector('#key') as HTMLInputElement;

    keyInput.value = 'nao-e-uma-chave';
    keyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(nativeElement.textContent).toContain(
      'Digite um link, e-mail ou identificador de cobrança válido',
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('auto-routes to the transfer form from the email query param', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TransferKeyPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ email: 'maria@auronix.com' })),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TransferKeyPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/create'], {
      queryParams: { email: 'maria@auronix.com' },
    });
  });

  it('shows an inline error for invalid transfer entry query params', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TransferKeyPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ paymentRequest: 'invalido' })),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TransferKeyPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Digite um identificador de cobrança válido',
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('has no critical accessibility violations in the key flow', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });
});
