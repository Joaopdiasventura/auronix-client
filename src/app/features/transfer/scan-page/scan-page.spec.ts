import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { TransferScanPage } from './scan-page';

describe('TransferScanPage', () => {
  let fixture: ComponentFixture<TransferScanPage>;
  let router: Router;
  const origin = window.location.origin;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferScanPage],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TransferScanPage);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes email QR values to the transfer form', () => {
    const component = fixture.componentInstance;

    component.handleScannedKey('maria@auronix.com');

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/create'], {
      queryParams: { email: 'maria@auronix.com' },
    });
  });

  it('stores an error for invalid QR values', () => {
    const component = fixture.componentInstance;

    component.handleScannedKey('chave-invalida');

    expect(component['errorMessage']()).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('routes transfer entry urls to the transfer form', () => {
    const component = fixture.componentInstance;

    component.handleScannedKey(
      `${origin}/transfer/key?paymentRequest=550e8400-e29b-41d4-a716-446655440000`,
    );

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/create'], {
      queryParams: { paymentRequest: '550e8400-e29b-41d4-a716-446655440000' },
    });
  });

  it('navigates back to the key page when the scanner closes', () => {
    const component = fixture.componentInstance;

    component.closeScanner();

    expect(router.navigate).toHaveBeenCalledWith(['/transfer/key']);
  });
});
