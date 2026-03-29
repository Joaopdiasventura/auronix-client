import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { TransferStatus } from '../../../core/enums/transfer/transfer-status.enum';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { TransferService } from '../../../core/services/transfer/transfer.service';
import { TransferListPage } from './list-page';

describe('TransferListPage', () => {
  let fixture: ComponentFixture<TransferListPage>;
  let transferRefresh$: Subject<unknown>;

  const transferPage = [
    {
      id: 'transfer-id',
      value: 5000,
      description: 'Pedido principal',
      status: 'completed',
      failureReason: null,
      completedAt: '2026-03-29T10:00:00.000Z',
      createdAt: '2026-03-29T09:58:00.000Z',
      updatedAt: '2026-03-29T10:00:00.000Z',
      payer: { id: 'user-id', name: 'Joao' },
      payee: { id: 'payee-id', name: 'Maria' },
    },
  ];

  const authService = {
    data: signal({
      id: 'user-id',
      email: 'joao@auronix.com',
      name: 'Joao',
      balance: 100000,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    }),
  };

  const notificationService = {
    connect: vi.fn(),
  };

  const transferService = {
    findMany: vi.fn(),
  };

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [TransferListPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        { provide: TransferService, useValue: transferService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();

    transferRefresh$ = new Subject();
    notificationService.connect.mockReturnValue(transferRefresh$.asObservable());
    transferService.findMany.mockReturnValue(
      of({
        data: transferPage,
        next: null,
      }),
    );
  });

  it('renders the transfer description', async () => {
    await createComponent();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Pedido principal');
  });

  it('renders the structural skeleton while the statement is loading', async () => {
    const transferResponse$ = new Subject<{ data: typeof transferPage; next: null }>();
    transferService.findMany.mockReturnValue(transferResponse$.asObservable());

    await createComponent();

    let nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('app-skeleton-metric-card')).not.toBeNull();
    expect(nativeElement.querySelectorAll('app-skeleton-list-row')).toHaveLength(8);
    expect(nativeElement.querySelector('.page-shell')?.getAttribute('aria-busy')).toBe('true');

    transferResponse$.next({ data: transferPage, next: null });
    transferResponse$.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('app-skeleton-metric-card')).toBeNull();
    expect(nativeElement.querySelector('.page-shell')?.hasAttribute('aria-busy')).toBe(false);
    expect(nativeElement.textContent).toContain('Pedido principal');
  });

  it('keeps the current rows visible during background refreshes', async () => {
    const refreshResponse$ = new Subject<{ data: typeof transferPage; next: null }>();
    transferService.findMany
      .mockReturnValueOnce(
        of({
          data: transferPage,
          next: null,
        }),
      )
      .mockReturnValueOnce(refreshResponse$.asObservable());

    await createComponent();

    transferRefresh$.next({});
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(transferService.findMany).toHaveBeenCalledTimes(2);
    expect(nativeElement.textContent).toContain('Pedido principal');
    expect(nativeElement.querySelector('app-skeleton-list-row')).toBeNull();
    expect(nativeElement.querySelector('.page-shell')?.hasAttribute('aria-busy')).toBe(false);
  });

  it('renders a fallback when a transfer has no description', async () => {
    await createComponent();

    fixture.componentInstance['transfers'].set([
      {
        id: 'transfer-id',
        value: 5000,
        status: TransferStatus.Completed,
        failureReason: null,
        completedAt: '2026-03-29T10:00:00.000Z',
        createdAt: '2026-03-29T09:58:00.000Z',
        updatedAt: '2026-03-29T10:00:00.000Z',
        payer: {
          id: 'user-id',
          email: 'joao@auronix.com',
          name: 'Joao',
          balance: 100000,
          createdAt: '2026-03-29T00:00:00.000Z',
          updatedAt: '2026-03-29T00:00:00.000Z',
        },
        payee: {
          id: 'payee-id',
          email: 'maria@auronix.com',
          name: 'Maria',
          balance: 120000,
          createdAt: '2026-03-29T00:00:00.000Z',
          updatedAt: '2026-03-29T00:00:00.000Z',
        },
      },
    ]);
    fixture.componentInstance['isLoading'].set(false);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sem descrição informada');
  });
});
