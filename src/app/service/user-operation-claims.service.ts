import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserOperationClaim } from '../models/user-operation-claim';
import { AlertifyService } from './alertify.service';

@Injectable({
  providedIn: 'root'
})
export class UserOperationClaimsService {

  private apiUrl = 'http://localhost:60805/api/UserOperationClaims';  // API URL burada sabit olarak tanımlandı
  private userOperationClaimsSubject = new BehaviorSubject<UserOperationClaim[]>([]);

  constructor(
    private httpClient: HttpClient,
    private alertifyService: AlertifyService
  ) { }

  // UserOperationClaim Listeleme
  getUserOperationClaims(): void {
    this.httpClient.get<UserOperationClaim[]>(this.apiUrl).pipe(
      tap({
        next: (data) => this.userOperationClaimsSubject.next(data),
        error: () => this.alertifyService.error("UserOperationClaims alınırken bir hata oluştu.")
      })
    ).subscribe(); // Buradaki subscribe sadece serviste yapılır, component'te subscribe yapılmaz
  }

  // Component'in dinlemesi için observable döndürüyoruz
  getUserOperationClaimsObservable() {
    return this.userOperationClaimsSubject.asObservable();
  }

  // UserOperationClaim ID ile Get
  getUserOperationClaimById(id: number): void {
    this.httpClient.get<UserOperationClaim>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {},
        error: () => this.alertifyService.error("UserOperationClaim getirilirken bir hata oluştu.")
      })
    ).subscribe(); // Burada da sadece servis içinde subscribe yapılır
  }

  // Yeni UserOperationClaim oluşturma (POST)
  createUserOperationClaim(userOperationClaim: UserOperationClaim): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post<UserOperationClaim>(this.apiUrl, userOperationClaim, { headers }).pipe(
      tap({
        next: () => this.alertifyService.success("UserOperationClaim başarıyla oluşturuldu."),
        error: () => this.alertifyService.error("UserOperationClaim oluşturulurken bir hata oluştu.")
      })
    ).subscribe(); // Bu işlem de serviste gerçekleşir
  }

  // UserOperationClaim güncelleme (PUT)
  updateUserOperationClaim(id: number, userOperationClaim: UserOperationClaim): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.put<UserOperationClaim>(`${this.apiUrl}/${id}`, userOperationClaim, { headers }).pipe(
      tap({
        next: () => this.alertifyService.success("UserOperationClaim başarıyla güncellendi."),
        error: () => this.alertifyService.error("UserOperationClaim güncellenirken bir hata oluştu.")
      })
    ).subscribe(); // Bu işlem de serviste gerçekleşir
  }

  // UserOperationClaim silme (DELETE)
  deleteUserOperationClaim(id: number): void {
    this.httpClient.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => this.alertifyService.success("UserOperationClaim başarıyla silindi."),
        error: () => this.alertifyService.error("UserOperationClaim silinirken bir hata oluştu.")
      })
    ).subscribe(); // Burada da serviste subscribe işlemi yapılır
  }
}
