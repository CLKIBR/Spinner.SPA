import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service'; // AuthService'ı doğru yerden import et

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const refreshToken = this.authService.getRefreshToken();

    let clonedReq = req;

    if (token) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(clonedReq).pipe(
      catchError((error) => {
        if (error.status === 401 && refreshToken) {
          return this.authService.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              const { token, refreshToken, expiration } = response;
              this.authService.saveTokens(token, refreshToken, expiration);

              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });

              return next.handle(newRequest);
            })
          );
        }
        return throwError(error);
      })
    );
  }
}
