import { NotificationEventType } from '../enums/notification/notification-event-type.enum';
import { User } from './user';

export type NotificationPayer = Pick<User, 'email' | 'id' | 'name'>;

export interface TransferPendingNotificationData {
  transferId: string;
  amount: number;
  createdAt: string;
  description: string | null;
  balance: number;
  payer?: NotificationPayer | null;
}

export interface TransferCompletedNotificationData {
  transferId: string;
  amount: number;
  createdAt: string;
  description: string | null;
  balance: number;
}

export interface TransferFailedNotificationData {
  transferId: string;
  amount: number;
  createdAt: string;
  description: string | null;
  balance: number;
  failureReason: string;
}

export interface NotificationEventDataMap {
  [NotificationEventType.TransferPending]: TransferPendingNotificationData;
  [NotificationEventType.TransferCompleted]: TransferCompletedNotificationData;
  [NotificationEventType.TransferFailed]: TransferFailedNotificationData;
}

export interface NotificationSseMessage<T extends NotificationEventType = NotificationEventType> {
  type: T;
  data: NotificationEventDataMap[T];
}

export interface NotificationStreamEvent<T extends NotificationEventType = NotificationEventType> {
  id: string;
  type: T;
  data: NotificationEventDataMap[T];
}
