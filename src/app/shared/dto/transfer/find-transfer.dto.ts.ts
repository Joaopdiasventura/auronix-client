export interface FindTransferDto {
  cursor?: TransferCursor | null;
  limit: number;
}

export interface TransferCursor {
  completedAt: string;
  id: string;
}
