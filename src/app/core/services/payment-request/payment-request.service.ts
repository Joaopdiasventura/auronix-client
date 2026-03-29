import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePaymentRequestDto } from '../../../shared/dto/payment-request/create-payment-request.dto.ts';
import { PaymentRequest } from '../../models/payment-request';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class PaymentRequestService {
  private readonly apiUrl = API_URL + '/payment-request';
  private readonly http = inject(HttpClient);

  public create(createPaymentRequestDto: CreatePaymentRequestDto): Observable<PaymentRequest> {
    return this.http.post<PaymentRequest>(this.apiUrl, createPaymentRequestDto);
  }

  public findById(id: string): Observable<PaymentRequest> {
    return this.http.get<PaymentRequest>(this.apiUrl + '/' + id);
  }
}
