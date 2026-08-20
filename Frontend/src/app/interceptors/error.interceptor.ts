import { Injectable } from '@angular/core';

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { NotificationService } from '../services/NotificationService/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private notification: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(

      catchError((error: HttpErrorResponse) => {

        console.log('HTTP Error:', error);

        // =========================
        // 400 Bad Request
        // =========================
        if (error.status === 400) {

          const message =
            error.error &&
            error.error.message
              ? error.error.message
              : 'Dữ liệu không hợp lệ.';

          this.notification.error(
            message,
            'Bad Request'
          );
        }


        // =========================
        // 401 Unauthorized
        // =========================
        else if (error.status === 401) {

          this.notification.warning(
            'Sai thông tin đăng nhập.',
            'Đăng nhập lại'
          );

          // Xóa token
          localStorage.removeItem('token');

          // Chuyển về Login
          this.router.navigate(['/login']);
        }


        // =========================
        // 403 Forbidden
        // =========================
        else if (error.status === 403) {

          this.notification.error(
            'Bạn không có quyền thực hiện thao tác này.',
            'Không có quyền'
          );
        }


        // =========================
        // 404 Not Found
        // =========================
        else if (error.status === 404) {

          const message =
            error.error &&
            error.error.message
              ? error.error.message
              : 'Không tìm thấy dữ liệu.';

          this.notification.warning(
            message,
            'Not Found'
          );
        }


        // =========================
        // 500 Internal Server Error
        // =========================
        else if (error.status === 500) {

          this.notification.error(
            'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.',
            'Server Error'
          );
        }


        // =========================
        // Lỗi khác
        // =========================
        else {

          this.notification.error(
            'Đã xảy ra lỗi. Vui lòng thử lại.',
            'Lỗi'
          );
        }

        // Cho phép Component/Service tiếp tục nhận error
        return throwError(error);
      })
    );
  }
}