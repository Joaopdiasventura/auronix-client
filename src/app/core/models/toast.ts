export interface ToastNotification {
  id: string;
  message: string;
  route: string[];
  title: string;
  variant: 'info' | 'success' | 'error';
}
