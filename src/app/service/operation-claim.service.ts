// operation-claims.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertifyService } from './alertify.service';

export interface OperationClaim {
  id?: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class OperationClaimsService {
  private readonly apiUrl = 'http://localhost:60805/api/OperationClaims';

  constructor(private httpClient: HttpClient, private alertifyService: AlertifyService) {}

  // Tüm OperationClaims'leri getir
  getAll(): Observable<OperationClaim[]> {
    return this.httpClient.get<OperationClaim[]>(`${this.apiUrl}`).pipe(
      catchError((error) => {
        this.alertifyService.error('Operation Claims yüklenirken bir hata oluştu.');
        return of([]); // Hata durumunda boş array döndürüyoruz
      })
    );
  }

  // OperationClaim ekler
  create(claim: OperationClaim): Observable<OperationClaim> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.post<OperationClaim>(`${this.apiUrl}`, claim, { headers }).pipe(
      tap(() => this.alertifyService.success('Yeni Yetki başarıyla eklendi.')),
      catchError((error) => {
        this.alertifyService.error('Yetki eklerken bir hata oluştu.');
        return of(); // Hata durumunda hiçbir şey döndürmeden devam ediyoruz
      })
    );
  }

  // OperationClaim günceller
  update(id: number, claim: OperationClaim): Observable<OperationClaim> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.put<OperationClaim>(`${this.apiUrl}/${id}`, claim, { headers }).pipe(
      tap(() => this.alertifyService.success('Yetki başarıyla güncellendi.')),
      catchError((error) => {
        this.alertifyService.error('Yetki güncellenirken bir hata oluştu.');
        return of(); // Hata durumunda hiçbir şey döndürmeden devam ediyoruz
      })
    );
  }

  // OperationClaim siler
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.alertifyService.success('Yetki başarıyla silindi.')),
      catchError((error) => {
        this.alertifyService.error('Yetki silinirken bir hata oluştu.');
        return of(); // Hata durumunda hiçbir şey döndürmeden devam ediyoruz
      })
    );
  }
}
