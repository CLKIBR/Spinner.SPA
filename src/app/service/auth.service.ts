import { Injectable } from '@angular/core';
import { LoginUser } from './../models/login-user';
import { RegisterUser } from './../models/register-user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { AlertifyService } from './alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private alertifyService: AlertifyService
  ) { }

  path = "http://localhost:60805/api/Auth";
  userToken: string | null = null;
  decodedToken: any;
  TOKEN_KEY = "token";
  jwtHelper: JwtHelperService = new JwtHelperService();

  login(loginUser: LoginUser) {
    let headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(this.path + "/Login", loginUser, { headers }).subscribe({
      next: (data: any) => {
        const accessToken = data?.accessToken?.token;
        const expirationDate = data?.accessToken?.expirationDate;
        if (accessToken && expirationDate) {
          this.saveToken(accessToken);
          localStorage.setItem("expiration", expirationDate); // ⚡ Eklenen Kod ⚡
          this.userToken = accessToken;
          this.decodedToken = this.jwtHelper.decodeToken(accessToken);
          this.alertifyService.success("Sisteme Giriş Yapıldı.");
          this.router.navigateByUrl("/layout/default-layout.component");
        } else {
          this.alertifyService.error("Giriş işlemi başarısız. Token alınamadı.");
        }
      },
      error: (err) => {
        console.error("Login API hatası:", err);
        this.alertifyService.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      },
    });
  }
  

  register(registerUser: RegisterUser) {
    let headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient
      .post(this.path + '/Register', registerUser, { headers: headers })
      .subscribe({
        next: () => {
          this.alertifyService.success('Kayıt başarılı.');
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.alertifyService.error('Kayıt başarısız. Lütfen tekrar deneyin.');
          console.error(err);
        }
      });
  }

  saveToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  logOut() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem("expiration");
    this.alertifyService.message('Oturum kapatıldı.');
    this.router.navigate(['/login']);
  }

  loggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiration = localStorage.getItem("expiration");
    if (!token || !expiration) {
      return false;
    }
    const now = new Date().getTime();
    const expirationTime = new Date(expiration).getTime();
    return now < expirationTime;
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      return this.jwtHelper.decodeToken(token).nameId;
    } catch (error) {
      console.error('Token çözümleme hatası:', error);
      return null;
    }
  }
}
