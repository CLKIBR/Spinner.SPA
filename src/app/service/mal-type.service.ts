import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MalTypeService {

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


  // MalType verilerini sayfalama ile almak için
  getMalType(pageIndex: number = 0, pageSize: number = 10): Observable<any> {
    const url = `${this.path}/MalTypes?PageIndex=${pageIndex}&PageSize=${pageSize}`;
    return this.httpClient.get(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        return of({ error: "Veri alınırken hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }

  // MalType silme işlemi
  deleteMalType(id: string): Observable<any> {
    const url = `${this.path}/MalTypes/${id}`;
    return this.httpClient.delete(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        return of({ error: "Silme işlemi sırasında hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }

  getMalTypeById(id: string): Observable<any> {
    const url = `${this.path}/MalTypes/${id}`; // id'ye göre veri çekmek için URL
    return this.httpClient.get<any>(url,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        return of({ error: "Veri alınırken hata oluştu" });  // Hata durumunda geri dönecek bir değer
      })
    );
  }

  updateMalType(id: string, updatedMalType: string): Observable<any> {
    return this.httpClient.put<any>(`${this.path}/malTypes/`, updatedMalType,{headers : this.createHeaders()});
  }

  addMalType(newMalType: any): Observable<any> {
    const url = `${this.path}/MalTypes`; // API'nin POST endpoint'i
    return this.httpClient.post<any>(url, newMalType,{headers : this.createHeaders()}).pipe(
      catchError(error => {
        return of({ error: "Yeni malzeme tipi eklenirken hata oluştu" });  // Hata durumunda geri dönülecek bir değer
      })
    );
  }
}
