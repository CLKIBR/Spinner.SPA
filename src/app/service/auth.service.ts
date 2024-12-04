import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { AlertifyService } from './alertify.service';  
import { LoginUser } from '../models/login-user';  
import { RegisterUser } from '../models/register-user'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API URL'inizi burada sabit olarak tanımladık
  private readonly apiUrl = 'http://localhost:60805/api';  

  private jwtHelper = new JwtHelperService();
  private userToken: string | null = null;
  private decodedToken: any = null;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private alertifyService: AlertifyService // Hata ve başarı mesajları için
  ) { }

  // Giriş yapma (Login)
  login(loginUser: LoginUser): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/Login`, loginUser, { headers }).subscribe({
      next: (data: any) => {
        const accessToken = data?.accessToken?.token;
        const expirationDate = data?.accessToken?.expirationDate;
        if (accessToken && expirationDate) {
          this.saveToken(accessToken);
          localStorage.setItem("expiration", expirationDate); // Token'ın geçerlilik tarihi
          this.userToken = accessToken;
          this.decodedToken = this.jwtHelper.decodeToken(accessToken);
          this.alertifyService.success("Sisteme Giriş Yapıldı.");
          this.router.navigateByUrl("/layout/default-layout.component");  // Yönlendirme
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

  // Kullanıcı kaydı (Register)
  register(registerUser: RegisterUser): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/Register`, registerUser, { headers }).subscribe({
      next: (data: any) => {
        this.alertifyService.success("Kayıt işlemi başarılı.");
        this.router.navigateByUrl("/auth/login");  // Kayıt sonrası giriş sayfasına yönlendirme
      },
      error: (err) => {
        console.error("Register API hatası:", err);
        this.alertifyService.error("Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
      },
    });
  }

  // Token yenileme (Refresh Token)
  refreshToken(): void {
    const refreshToken = this.getRefreshToken();  // Önceden kaydedilen refresh token
    if (!refreshToken) {
      this.alertifyService.error("Yenileme işlemi için geçerli bir refresh token bulunamadı.");
      return;
    }

    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/RefreshToken`, { refreshToken }, { headers }).subscribe({
      next: (data: any) => {
        const accessToken = data?.accessToken?.token;
        const expirationDate = data?.accessToken?.expirationDate;
        if (accessToken && expirationDate) {
          this.saveToken(accessToken);
          localStorage.setItem("expiration", expirationDate); // Yeni token'ın geçerlilik tarihi
          this.userToken = accessToken;
          this.decodedToken = this.jwtHelper.decodeToken(accessToken);
          this.alertifyService.success("Token başarıyla yenilendi.");
        } else {
          this.alertifyService.error("Token yenileme işlemi başarısız.");
        }
      },
      error: (err) => {
        console.error("Refresh Token API hatası:", err);
        this.alertifyService.error("Token yenileme başarısız.");
      },
    });
  }

  // Token iptal etme (Revoke Token)
  revokeToken(): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/RevokeToken`, {}, { headers }).subscribe({
      next: () => {
        this.clearToken();
        this.alertifyService.success("Token başarıyla iptal edildi.");
        this.router.navigateByUrl("/auth/login");  // Token iptal edildikten sonra giriş sayfasına yönlendirme
      },
      error: (err) => {
        console.error("Revoke Token API hatası:", err);
        this.alertifyService.error("Token iptal işlemi başarısız.");
      },
    });
  }

  // E-posta doğrulaması başlatma (Enable Email Authenticator)
  enableEmailAuthenticator(): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/EnableEmailAuthenticator`, {}, { headers }).subscribe({
      next: () => {
        this.alertifyService.success("E-posta doğrulama başarıyla başlatıldı.");
      },
      error: (err) => {
        console.error("Email Authenticator API hatası:", err);
        this.alertifyService.error("E-posta doğrulama başlatılamadı.");
      },
    });
  }

  // OTP doğrulaması başlatma (Enable OTP Authenticator)
  enableOtpAuthenticator(): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/EnableOtpAuthenticator`, {}, { headers }).subscribe({
      next: () => {
        this.alertifyService.success("OTP doğrulama başarıyla başlatıldı.");
      },
      error: (err) => {
        console.error("OTP Authenticator API hatası:", err);
        this.alertifyService.error("OTP doğrulama başlatılamadı.");
      },
    });
  }

  // E-posta doğrulamasını doğrulama (Verify Email Authenticator)
  verifyEmailAuthenticator(code: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/VerifyEmailAuthenticator`, { code }, { headers }).subscribe({
      next: () => {
        this.alertifyService.success("E-posta doğrulama başarıyla tamamlandı.");
      },
      error: (err) => {
        console.error("Email Authenticator doğrulama hatası:", err);
        this.alertifyService.error("E-posta doğrulama hatası.");
      },
    });
  }

  // OTP doğrulamasını doğrulama (Verify OTP Authenticator)
  verifyOtpAuthenticator(code: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.httpClient.post(`${this.apiUrl}/Auth/VerifyOtpAuthenticator`, { code }, { headers }).subscribe({
      next: () => {
        this.alertifyService.success("OTP doğrulama başarıyla tamamlandı.");
      },
      error: (err) => {
        console.error("OTP Authenticator doğrulama hatası:", err);
        this.alertifyService.error("OTP doğrulama hatası.");
      },
    });
  }

  // Token'ı kaydetme
  private saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  // Token'ı temizleme
  private clearToken(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  // Geçerli token'ı alma
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Refresh token'ı alma (Varsa)
  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  isTokenCloseToExpiry(): boolean {
    const expiration = localStorage.getItem('expiration');
    if (!expiration) return false;
  
    const currentDate = new Date();
    const expirationDate = new Date(expiration);
  
    // Süre dolmaya 5 dakikadan az kaldıysa
    const diff = expirationDate.getTime() - currentDate.getTime();
    return diff <= 5 * 60 * 1000; // 5 dakika
  }

  // Token'ın geçerliliğini kontrol etme
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    return this.jwtHelper.isTokenExpired(token);
  }

  // Çıkış yapma (Logout)
  logout(): void {
    this.clearToken();
    this.alertifyService.success("Başarıyla çıkış yapıldı.");
    this.router.navigateByUrl("/login");
  }
}
