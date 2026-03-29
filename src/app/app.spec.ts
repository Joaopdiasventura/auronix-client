import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { configureAxe } from 'vitest-axe';
import { vi } from 'vitest';
import { NotificationEventType } from './core/enums/notification/notification-event-type.enum';
import { NotificationStreamEvent } from './core/models/notification';
import { AuthService } from './core/services/auth/auth.service';
import { NotificationService } from './core/services/notification/notification.service';
import { ToastService } from './core/services/toast/toast.service';
import { UserService } from './core/services/user/user.service';
import { formatCurrency } from './shared/utils/format-currency';
import { App } from './app';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});

describe('App', () => {
  let notifications$: Subject<NotificationStreamEvent>;
  let originalNotification: typeof Notification | undefined;

  const authService = {
    data: signal<{
      id: string;
      email: string;
      name: string;
      balance: number;
      createdAt: string;
      updatedAt: string;
    } | null>(null),
    isLoggedIn: vi.fn(() => authService.data() != null),
    updateBalance: vi.fn((balance: number) => {
      const user = authService.data();
      if (!user) return;

      authService.data.set({
        ...user,
        balance,
      });
    }),
  };

  const notificationService = {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  const toastService = {
    toasts: signal<
      {
        id: string;
        message: string;
        route: string[];
        title: string;
        variant: 'info' | 'success' | 'error';
      }[]
    >([]),
    dismiss: vi.fn((id: string) =>
      toastService.toasts.update((currentToasts) =>
        currentToasts.filter((currentToast) => currentToast.id != id),
      ),
    ),
    show: vi.fn((toast) => toastService.toasts.update((currentToasts) => [...currentToasts, toast])),
  };

  const userService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ToastService, useValue: toastService },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    originalNotification = globalThis.Notification;
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });

    authService.data.set(null);
    toastService.toasts.set([]);
    vi.clearAllMocks();
    notifications$ = new Subject<NotificationStreamEvent>();
    notificationService.connect.mockReturnValue(notifications$.asObservable());
  });

  afterEach(() => {
    if (originalNotification) {
      globalThis.Notification = originalNotification;
      return;
    }

    delete (globalThis as { Notification?: typeof Notification }).Notification;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the root outlet container', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-root')).not.toBeNull();
  });

  it('starts and stops the notification stream from the auth state', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(notificationService.stop).toHaveBeenCalledTimes(1);
    expect(notificationService.start).not.toHaveBeenCalled();

    authService.data.set(createUser());
    fixture.detectChanges();
    await fixture.whenStable();

    expect(notificationService.start).toHaveBeenCalledTimes(1);

    authService.data.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(notificationService.stop).toHaveBeenCalledTimes(2);
  });

  it('updates the balance and shows a toast while the app is visible', async () => {
    authService.data.set(createUser());

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    notifications$.next(createCompletedEvent());
    await fixture.whenStable();

    expect(authService.updateBalance).toHaveBeenCalledWith(95000);
    expect(toastService.show).toHaveBeenCalledWith({
      id: '42',
      title: 'Transferência concluída',
      message: `Pedido principal · ${formatCurrency(5000)}`,
      route: ['/transfer', 'transfer-id'],
      variant: 'success',
    });
  });

  it('falls back to a default description when the notification payload contains null', async () => {
    authService.data.set(createUser());

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    notifications$.next(createCompletedEvent(null));
    await fixture.whenStable();

    expect(toastService.show).toHaveBeenCalledWith({
      id: '42',
      title: 'Transferência concluída',
      message: `Sem descrição informada · ${formatCurrency(5000)}`,
      route: ['/transfer', 'transfer-id'],
      variant: 'success',
    });
  });

  it('includes the payer identity in pending transfer notifications', async () => {
    authService.data.set(createUser());

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    notifications$.next(createPendingEvent());
    await fixture.whenStable();

    expect(toastService.show).toHaveBeenCalledWith({
      id: '41',
      title: 'Transferência em processamento',
      message: `Pedido principal · ${formatCurrency(5000)} · Pagador: João Silva`,
      route: ['/transfer', 'transfer-id'],
      variant: 'info',
    });
  });

  it('uses the browser notification when the app is not visible', async () => {
    authService.data.set(createUser());
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    globalThis.Notification = MockBrowserNotification as never;
    MockBrowserNotification.instances.length = 0;
    MockBrowserNotification.permission = 'granted';

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    notifications$.next(createPendingEvent());
    await fixture.whenStable();

    expect(toastService.show).not.toHaveBeenCalled();
    expect(MockBrowserNotification.instances).toHaveLength(1);
    expect(MockBrowserNotification.instances[0].title).toBe('Transferência em processamento');
  });

  it('has no critical accessibility violations in the authenticated shell', async () => {
    authService.data.set({
      id: 'user-id',
      email: 'joao@auronix.com',
      name: 'Joao Silva',
      balance: 125000,
      createdAt: '2026-03-29T00:00:00.000Z',
      updatedAt: '2026-03-29T00:00:00.000Z',
    });
    notificationService.connect.mockReturnValue(EMPTY);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });
});

function createCompletedEvent(description: string | null = 'Pedido principal'): NotificationStreamEvent {
  return {
    id: '42',
    type: NotificationEventType.TransferCompleted,
    data: {
      transferId: 'transfer-id',
      amount: 5000,
      createdAt: '2026-03-29T00:00:00.000Z',
      description,
      balance: 95000,
    },
  };
}

function createPendingEvent(description: string | null = 'Pedido principal'): NotificationStreamEvent {
  return {
    id: '41',
    type: NotificationEventType.TransferPending,
    data: {
      transferId: 'transfer-id',
      amount: 5000,
      createdAt: '2026-03-29T00:00:00.000Z',
      description,
      balance: 100000,
      payer: {
        id: 'payer-id',
        email: 'joao@auronix.com',
        name: 'João Silva',
      },
    },
  };
}

function createUser() {
  return {
    id: 'user-id',
    email: 'joao@auronix.com',
    name: 'Joao',
    balance: 1000,
    createdAt: '2026-03-29T00:00:00.000Z',
    updatedAt: '2026-03-29T00:00:00.000Z',
  };
}

class MockBrowserNotification {
  public static readonly instances: MockBrowserNotification[] = [];
  public static permission: NotificationPermission = 'granted';
  public static requestPermission = vi.fn().mockResolvedValue('granted');

  public onclick: (() => void) | null = null;

  public constructor(
    public readonly title: string,
    public readonly options?: NotificationOptions,
  ) {
    MockBrowserNotification.instances.push(this);
  }

  public close(): void {}
}
