import {
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaymentRequestService } from './payment-request.service';

describe('PaymentRequestService', () => {
  let httpController: HttpTestingController;
  let service: PaymentRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withFetch(),
          withInterceptors([
            (req, next): ReturnType<HttpInterceptorFn> => next(req.clone({ withCredentials: true })),
          ]),
        ),
        provideHttpClientTesting(),
        PaymentRequestService,
      ],
    });

    service = TestBed.inject(PaymentRequestService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('creates payment requests with credentials', () => {
    service.create({ value: 15000 }).subscribe();

    const request = httpController.expectOne('http://localhost:3000/payment-request');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ value: 15000 });
    expect(request.request.withCredentials).toBe(true);

    request.flush({ id: 'request-id' });
  });

  it('retrieves a payment request by id with credentials', () => {
    service.findById('request-id').subscribe();

    const request = httpController.expectOne('http://localhost:3000/payment-request/request-id');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);

    request.flush({ id: 'request-id', value: 15000, createdAt: '2026-03-29T00:00:00.000Z' });
  });
});
