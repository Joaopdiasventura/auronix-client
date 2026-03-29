import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastNotification } from '../../models/toast';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts with no active toast', () => {
    expect(service).toBeTruthy();
    expect(service.toasts()).toEqual([]);
  });

  it('adds a toast to the visible collection', () => {
    const toast = createToast('toast-1');

    service.show(toast);

    expect(service.toasts()).toEqual([toast]);
  });

  it('keeps multiple toasts visible at the same time', () => {
    const firstToast = createToast('toast-1');
    const secondToast = createToast('toast-2');

    service.show(firstToast);
    service.show(secondToast);

    expect(service.toasts()).toEqual([firstToast, secondToast]);
  });

  it('dismisses only the targeted toast', () => {
    const firstToast = createToast('toast-1');
    const secondToast = createToast('toast-2');

    service.show(firstToast);
    service.show(secondToast);

    service.dismiss(firstToast.id);

    expect(service.toasts()).toEqual([secondToast]);
  });

  it('dismisses the matching toast after the configured timeout', async () => {
    const toast = createToast('toast-1');

    service.show(toast, 1200);
    await vi.advanceTimersByTimeAsync(1199);
    expect(service.toasts()).toEqual([toast]);

    await vi.advanceTimersByTimeAsync(1);
    expect(service.toasts()).toEqual([]);
  });

  it('tracks timeout dismissal independently for each toast', async () => {
    const firstToast = createToast('toast-1');
    const secondToast = createToast('toast-2');

    service.show(firstToast, 1000);
    service.show(secondToast, 2000);

    await vi.advanceTimersByTimeAsync(1000);
    expect(service.toasts()).toEqual([secondToast]);

    await vi.advanceTimersByTimeAsync(999);
    expect(service.toasts()).toEqual([secondToast]);

    await vi.advanceTimersByTimeAsync(1);
    expect(service.toasts()).toEqual([]);
  });
});

function createToast(id: string): ToastNotification {
  return {
    id,
    title: `Toast ${id}`,
    message: `Mensagem ${id}`,
    route: ['/transfer', id],
    variant: 'info',
  };
}
