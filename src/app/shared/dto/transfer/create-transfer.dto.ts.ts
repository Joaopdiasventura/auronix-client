export interface CreateTransferDto {
  payeeId: string;
  value: number;
  description?: string;
}
