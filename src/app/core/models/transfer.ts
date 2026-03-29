import { User } from './user';
import { TransferStatus } from '../enums/transfer/transfer-status.enum';

export interface Transfer {
  id: string;
  value: number;
  description?: string;
  status: TransferStatus;
  failureReason: string | null;
  completedAt: string | null;
  payer: User;
  payee: User;
  createdAt: string;
  updatedAt: string;
}
