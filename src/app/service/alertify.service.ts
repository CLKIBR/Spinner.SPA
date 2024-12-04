import { Injectable } from '@angular/core';
declare let alertify: any;


@Injectable({
  providedIn: 'root',
})
export class AlertifyService {
  success(message: string): void {
    alertify.success(message);
  }

  error(message: string): void {
    alertify.error(message);
  }

  warning(message: string): void {
    alertify.warning(message);
  }

  message(message: string): void {
    alertify.message(message);
  }

  confirm(message: string, okCallback: () => any): void {
    alertify.confirm(message, function (e: any) {
      if (e) {
        okCallback();
      } else {
        // Kullanıcı iptal ettiğinde bir şey yapmak istemiyorsanız burası boş bırakılabilir.
      }
    });
  }
}
