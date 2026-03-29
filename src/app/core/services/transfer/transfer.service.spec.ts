import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TransferService } from './transfer.service';

describe('TransferService', () => {
  let httpController: HttpTestingController;
  let service: TransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withFetch(),
          withInterceptors([(req, next) => next(req.clone({ withCredentials: true }))]),
        ),
        provideHttpClientTesting(),
        TransferService,
      ],
    });

    service = TestBed.inject(TransferService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('creates transfers with credentials', () => {
    service
      .create({ payeeId: 'payee-id', value: 5000, description: 'Pedido principal' })
      .subscribe();

    const request = httpController.expectOne('http://localhost:3000/transfer');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      payeeId: 'payee-id',
      value: 5000,
      description: 'Pedido principal',
    });

    request.flush({ id: 'transfer-id' });
  });

  it('lists transfers using the cursor pagination contract', () => {
    service.findMany({ limit: 8 }).subscribe();

    const request = httpController.expectOne('http://localhost:3000/transfer?limit=8');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('cursor')).toBeNull();

    request.flush({ data: [], next: null });
  });

  it('serializes the cursor when requesting the next transfer page', () => {
    service
      .findMany({
        limit: 4,
        cursor: {
          completedAt: '2026-03-29T10:00:00.000Z',
          id: '0f10d5f8-aefb-4c0d-b77f-0f77b4bd4bb5',
        },
      })
      .subscribe();

    const request = httpController.expectOne(
      ({ url, params }) => url == 'http://localhost:3000/transfer' && params.get('limit') == '4',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('cursor')).toBe(
      JSON.stringify({
        completedAt: '2026-03-29T10:00:00.000Z',
        id: '0f10d5f8-aefb-4c0d-b77f-0f77b4bd4bb5',
      }),
    );

    request.flush({ data: [], next: null });
  });

  it('fetches a transfer by id with credentials', () => {
    service.findById('transfer-id').subscribe();

    const request = httpController.expectOne('http://localhost:3000/transfer/transfer-id');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);

    request.flush({ id: 'transfer-id' });
  });
});
