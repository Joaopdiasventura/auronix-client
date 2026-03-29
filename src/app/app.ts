import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NotificationEventType } from './core/enums/notification/notification-event-type.enum';
import { NotificationPayer, NotificationStreamEvent } from './core/models/notification';
import { ToastNotification } from './core/models/toast';
import { AuthService } from './core/services/auth/auth.service';
import { NotificationService } from './core/services/notification/notification.service';
import { ToastService } from './core/services/toast/toast.service';
import { NotificationToast } from './shared/components/notification-toast/notification-toast';
import { AppIcon } from './shared/components/ui/app-icon/app-icon';
import { formatCurrency } from './shared/utils/format-currency';

interface WorkspaceNavigationItem {
  ariaLabel: string;
  exact: boolean;
  helper: string;
  icon: 'dashboard' | 'payment-request' | 'profile' | 'transfer';
  label: string;
  mobileLabel: string;
  route: string;
}

const WORKSPACE_NAVIGATION: WorkspaceNavigationItem[] = [
  {
    ariaLabel: 'Abrir painel da conta',
    exact: true,
    helper: 'Saldo, fluxo da conta e atalhos principais',
    icon: 'dashboard',
    label: 'Painel',
    mobileLabel: 'Painel',
    route: '/',
  },
  {
    ariaLabel: 'Abrir cobranças',
    exact: false,
    helper: 'Emissão, validação e compartilhamento',
    icon: 'payment-request',
    label: 'Cobranças',
    mobileLabel: 'Cobranças',
    route: '/payment-request/create',
  },
  {
    ariaLabel: 'Abrir transferências',
    exact: false,
    helper: 'Extrato, autorizações e detalhes',
    icon: 'transfer',
    label: 'Transferências',
    mobileLabel: 'Transfer.',
    route: '/transfer',
  },
  {
    ariaLabel: 'Abrir perfil da conta',
    exact: false,
    helper: 'Dados da conta e preferências',
    icon: 'profile',
    label: 'Perfil',
    mobileLabel: 'Perfil',
    route: '/profile',
  },
];

@Component({
  selector: 'app-root',
  imports: [
    AppIcon,
    NgOptimizedImage,
    NotificationToast,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly currentUrl = signal(this.router.url);
  protected readonly navigation = WORKSPACE_NAVIGATION;
  protected readonly user = this.authService.data;

  protected readonly balanceLabel = computed(() => formatCurrency(this.user()?.balance ?? 0));
  protected readonly isAuthRoute = computed(() => this.currentUrl().startsWith('/user/'));
  protected readonly userDescriptor = computed(() => {
    const user = this.user();
    if (!user) return 'Sessão protegida';

    return `Conta ${user.id.slice(0, 8).toUpperCase()}`;
  });
  protected readonly userInitials = computed(() => {
    const name = this.user()?.name;
    if (!name) return 'AX';

    return name
      .split(' ')
      .filter((chunk) => chunk.trim().length > 0)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? '')
      .join('');
  });

  public constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    this.notificationService
      .connect()
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        this.authService.updateBalance(event.data.balance);
        this.presentNotification(event);
      });

    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.notificationService.start();
        return;
      }

      this.notificationService.stop();
    });
  }

  private presentNotification(event: NotificationStreamEvent): void {
    const toast = this.createToast(event);

    if (this.isDocumentVisible()) {
      this.toastService.show(toast);
      return;
    }

    void this.showBrowserNotification(toast);
  }

  private createToast(event: NotificationStreamEvent): ToastNotification {
    const amount = formatCurrency(event.data.amount);
    const description = this.resolveNotificationDescription(event.data.description);

    if (event.type == NotificationEventType.TransferCompleted) {
      return {
        id: event.id,
        title: 'Transferência concluída',
        message: `${description} · ${amount}`,
        route: ['/transfer', event.data.transferId],
        variant: 'success',
      };
    }

    if (event.type == NotificationEventType.TransferFailed) {
      const failureReason =
        'failureReason' in event.data ? event.data.failureReason : 'Falha operacional';

      return {
        id: event.id,
        title: 'Transferência rejeitada',
        message: `${description} · ${amount}. ${failureReason}`,
        route: ['/transfer', event.data.transferId],
        variant: 'error',
      };
    }

    const payer = 'payer' in event.data ? event.data.payer : null;

    return {
      id: event.id,
      title: 'Transferência em processamento',
      message: `${description} · ${amount} · Pagador: ${this.resolveNotificationPayer(payer)}`,
      route: ['/transfer', event.data.transferId],
      variant: 'info',
    };
  }

  private resolveNotificationDescription(description: string | null): string {
    return description?.trim() || 'Sem descrição informada';
  }

  private resolveNotificationPayer(payer?: NotificationPayer | null): string {
    return payer?.name?.trim() || payer?.email?.trim() || 'Conta protegida';
  }

  private isDocumentVisible(): boolean {
    if (typeof document == 'undefined') return true;
    return document.visibilityState == 'visible';
  }

  private async showBrowserNotification(toast: ToastNotification): Promise<void> {
    if (typeof Notification == 'undefined') {
      this.toastService.show(toast);
      return;
    }

    if (Notification.permission == 'granted') {
      this.openBrowserNotification(toast);
      return;
    }

    if (Notification.permission == 'denied') {
      this.toastService.show(toast);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission == 'granted') {
        this.openBrowserNotification(toast);
        return;
      }
    } catch {}

    this.toastService.show(toast);
  }

  private openBrowserNotification(toast: ToastNotification): void {
    const notification = new Notification(toast.title, {
      body: toast.message,
      tag: toast.id,
    });

    notification.onclick = () => {
      if (typeof window != 'undefined') window.focus();
      this.router.navigate(toast.route);
      notification.close();
    };
  }
}
