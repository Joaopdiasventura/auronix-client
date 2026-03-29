export interface PaymentRequestUser {
  id: string;
  name: string;
}

export interface PaymentRequest {
  id: string;
  value: number;
  user?: PaymentRequestUser | null;
  createdAt: string;
}
