import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastNotification } from '../../../core/models/toast';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToast {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected toastClass(toast: ToastNotification): string {
    return `toast-card toast-card--${toast.variant}`;
  }

  protected toastRole(toast: ToastNotification): 'alert' | 'status' {
    return toast.variant == 'error' ? 'alert' : 'status';
  }

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  protected open(toast: ToastNotification): void {
    this.router.navigate(toast.route);
    this.toastService.dismiss(toast.id);
  }
}
