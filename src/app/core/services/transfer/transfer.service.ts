import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateTransferDto } from '../../../shared/dto/transfer/create-transfer.dto.ts';
import { Observable } from 'rxjs';
import { Transfer } from '../../models/transfer';
import { FindTransferDto, TransferCursor } from '../../../shared/dto/transfer/find-transfer.dto.ts';
import { FindManyDto } from '../../../shared/dto/find-many.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  private readonly apiUrl = API_URL + '/transfer';
  private readonly http = inject(HttpClient);

  public create(createTransferDto: CreateTransferDto): Observable<Transfer> {
    return this.http.post<Transfer>(this.apiUrl, createTransferDto);
  }

  public findById(id: string): Observable<Transfer> {
    return this.http.get<Transfer>(this.apiUrl + '/' + id);
  }

  public findMany(
    findTransferDto: FindTransferDto,
  ): Observable<FindManyDto<Transfer, TransferCursor>> {
    let params = new HttpParams().set('limit', String(findTransferDto.limit));

    if (findTransferDto.cursor)
      params = params.set('cursor', JSON.stringify(findTransferDto.cursor));

    return this.http.get<FindManyDto<Transfer, TransferCursor>>(this.apiUrl, {
      params,
    });
  }
}
