import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';
import { AlertifyService } from './alertify.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:60805/api/Users';  // API URL burada sabit olarak tanımlandı
  private usersSubject = new BehaviorSubject<User[]>([]);

  constructor(
    private httpClient: HttpClient,
    private alertifyService: AlertifyService
  ) { }

  // User Listeleme
  getUsers(): void {
    this.httpClient.get<User[]>(this.apiUrl).pipe(
      tap({
        next: (data) => this.usersSubject.next(data),
        error: () => this.alertifyService.error("Users alınırken bir hata oluştu.")
      })
    ).subscribe(); // Burada sadece servis içinde subscribe yapılır
  }

  // Component'in dinlemesi için observable döndürüyoruz
  getUsersObservable() {
    return this.usersSubject.asObservable();
  }

  // User ID ile Get
  getUserById(id: number): void {
    this.httpClient.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {},
        error: () => this.alertifyService.error("User getirilirken bir hata oluştu.")
      })
    ).subscribe(); // Burada da sadece servis içinde subscribe yapılır
  }

  // Auth ile User Get (GetFromAuth)
  getUserFromAuth(): void {
    this.httpClient.get<User>(`${this.apiUrl}/GetFromAuth`).pipe(
      tap({
        next: () => {},
        error: () => this.alertifyService.error("User Auth ile alınırken bir hata oluştu.")
      })
    ).subscribe(); // Burada da sadece servis içinde subscribe yapılır
  }

  // Yeni User oluşturma (POST)
  createUser(user: User): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post<User>(this.apiUrl, user, { headers }).pipe(
      tap({
        next: () => this.alertifyService.success("User başarıyla oluşturuldu."),
        error: () => this.alertifyService.error("User oluşturulurken bir hata oluştu.")
      })
    ).subscribe(); // Bu işlem de serviste gerçekleşir
  }

  // User güncelleme (PUT)
  updateUser(id: number, user: User): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.put<User>(`${this.apiUrl}/${id}`, user, { headers }).pipe(
      tap({
        next: () => this.alertifyService.success("User başarıyla güncellendi."),
        error: () => this.alertifyService.error("User güncellenirken bir hata oluştu.")
      })
    ).subscribe(); // Bu işlem de serviste gerçekleşir
  }

  // Auth ile User güncelleme (FromAuth - PUT)
  updateUserFromAuth(user: User): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.put<User>(`${this.apiUrl}/FromAuth`, user, { headers }).pipe(
      tap({
        next: () => this.alertifyService.success("User başarıyla güncellendi."),
        error: () => this.alertifyService.error("User Auth ile güncellenirken bir hata oluştu.")
      })
    ).subscribe(); // Bu işlem de serviste gerçekleşir
  }

  // User silme (DELETE)
  deleteUser(id: number): void {
    this.httpClient.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => this.alertifyService.success("User başarıyla silindi."),
        error: () => this.alertifyService.error("User silinirken bir hata oluştu.")
      })
    ).subscribe(); // Burada da serviste subscribe işlemi yapılır
  }
}
