import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { ToastNotification } from '../../../core/models/toast';
import { ToastService } from '../../../core/services/toast/toast.service';
import { NotificationToast } from './notification-toast';

describe('NotificationToast', () => {
  let fixture: ComponentFixture<NotificationToast>;
  let router: Router;
  let toasts: ToastNotification[];

  const toastService = {
    toasts: signal<ToastNotification[]>([]),
    dismiss: vi.fn((id: string) => {
      toastService.toasts.update((currentToasts) =>
        currentToasts.filter((currentToast) => currentToast.id != id),
      );
    }),
    show: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationToast],
      providers: [
        provideRouter([]),
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(NotificationToast);
    fixture.detectChanges();
  });

  beforeEach(() => {
    toasts = [
      createToast('toast-id', 'Transferencia', 'Pedido principal', 'success'),
      createToast('toast-id-2', 'Falha operacional', 'Saldo insuficiente', 'error'),
    ];
    toastService.toasts.set(toasts);
    vi.clearAllMocks();
    fixture.detectChanges();
  });

  it('renders every active toast', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Transferencia');
    expect(nativeElement.textContent).toContain('Falha operacional');
    expect(nativeElement.querySelectorAll('.toast-card')).toHaveLength(2);
    expect(nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('opens the selected toast route and dismisses only that item', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const openButtons = nativeElement.querySelectorAll('.toast-button--primary');
    const openButton = openButtons[1] as HTMLButtonElement;

    openButton.click();

    expect(router.navigate).toHaveBeenCalledWith(['/transfer', 'toast-id-2']);
    expect(toastService.dismiss).toHaveBeenCalledWith('toast-id-2');
  });
});

function createToast(
  id: string,
  title: string,
  message: string,
  variant: ToastNotification['variant'],
): ToastNotification {
  return {
    id,
    title,
    message,
    route: ['/transfer', id],
    variant,
  };
}
