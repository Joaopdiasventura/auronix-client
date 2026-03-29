import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { QrDisplayPage } from './display-page';

describe('QrDisplayPage', () => {
  let fixture: ComponentFixture<QrDisplayPage>;
  const origin = window.location.origin;

  async function createComponent(queryParams: Record<string, string>): Promise<QrDisplayPage> {
    await TestBed.configureTestingModule({
      imports: [QrDisplayPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap(queryParams)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QrDisplayPage);
    return fixture.componentInstance;
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('resolves the profile QR flow from the email query param', async () => {
    const component = await createComponent({ email: 'joao@auronix.com' });

    expect(component['mode']()).toBe('email');
    expect(component['qrValue']()).toBe('joao@auronix.com');
    expect(component['backLink']()).toBe('/profile');
    expect(component['qrPayload']()).toBe(`${origin}/transfer/key?email=joao%40auronix.com`);
  });

  it('builds a transfer entry url for payment request qr codes', async () => {
    const component = await createComponent({
      paymentRequest: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(component['qrPayload']()).toBe(
      `${origin}/transfer/key?paymentRequest=550e8400-e29b-41d4-a716-446655440000`,
    );
    expect(component['downloadFileName']()).toBe(
      'auronix-payment-request-550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('shows an error when both QR query params are provided', async () => {
    const component = await createComponent({
      email: 'joao@auronix.com',
      paymentRequest: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(component['errorMessage']()).toBeTruthy();
  });
});
