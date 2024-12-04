import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MalClassService {

  private path = "http://localhost:60805/api";

  constructor(private httpClient: HttpClient) { }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Token localStorage'dan alınır
  }

  private createHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throwError(() => new Error('Token bulunamadı. Lütfen tekrar giriş yapınız.'));
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Token başlık olarak eklenir
    });
  }

  // MalClass verilerini sayfalama ile almak için
  getMalClass(pageIndex: number = 0, pageSize: number = 10): Observable<any> {
    const url = `${this.path}/MalClasses?PageIndex=${pageIndex}&PageSize=${pageSize}`;
    return this.httpClient.get(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        console.error("Veri alınırken hata oluştu:", error);
        return of({ error: "Veri alınırken hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }

  // MalClass silme işlemi
  deleteMalClass(id: string): Observable<any> {
    const url = `${this.path}/MalClasses/${id}`;
    console.log(`Silme isteği: ${url}`);
    return this.httpClient.delete(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        console.error("Silme işlemi sırasında hata oluştu:", error);
        return of({ error: "Silme işlemi sırasında hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }

  getMalClassById(id: string): Observable<any> {
    const url = `${this.path}/MalClasses/${id}`; // id'ye göre veri çekmek için URL
    return this.httpClient.get<any>(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        console.error("Veri alınırken hata oluştu:", error);
        return of({ error: "Veri alınırken hata oluştu" });  // Hata durumunda geri dönecek bir değer
      })
    );
  }

  updateMalClass(id: string, updatedMalClass: string): Observable<any> {
    return this.httpClient.put<any>(`${this.path}/MalClasses/`, updatedMalClass,{headers : this.createHeaders()});
  }

  addMalClass(newMalClass: any): Observable<any> {
    const url = `${this.path}/MalClasses`; // API'nin POST endpoint'i
    return this.httpClient.post<any>(url, newMalClass,{headers : this.createHeaders()})
    .pipe(
      catchError(error => {
        console.error("Yeni malzeme tipi eklenirken hata oluştu:", error);
        return of({ error: "Yeni malzeme tipi eklenirken hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }
}
