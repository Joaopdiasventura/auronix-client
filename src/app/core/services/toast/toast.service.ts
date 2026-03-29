import { Injectable, signal } from '@angular/core';
import { ToastNotification } from '../../models/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSource = signal<ToastNotification[]>([]);
  private readonly dismissTimeoutIds = new Map<string, ReturnType<typeof setTimeout>>();

  public readonly toasts = this.toastsSource.asReadonly();

  public show(toast: ToastNotification, durationMs = 6000): void {
    this.clearDismissTimeout(toast.id);
    this.toastsSource.update((currentToasts) => {
      const nextToasts = currentToasts.filter((currentToast) => currentToast.id != toast.id);
      return [...nextToasts, toast];
    });

    const dismissTimeoutId = setTimeout(() => this.dismiss(toast.id), durationMs);
    this.dismissTimeoutIds.set(toast.id, dismissTimeoutId);
  }

  public dismiss(id: string): void {
    this.clearDismissTimeout(id);
    this.toastsSource.update((currentToasts) =>
      currentToasts.filter((currentToast) => currentToast.id != id),
    );
  }

  private clearDismissTimeout(id: string): void {
    const dismissTimeoutId = this.dismissTimeoutIds.get(id);
    if (!dismissTimeoutId) return;

    clearTimeout(dismissTimeoutId);
    this.dismissTimeoutIds.delete(id);
  }
}
