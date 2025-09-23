import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'ecommerce_token';
const REFRESH_TOKEN_KEY = 'ecommerce_refresh_token';
const RETRY_HEADER = 'x-refresh-retry';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  let requestToSend = req;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const isApiCall = req.url.startsWith(environment.apiUrl);
    if (token && isApiCall) {
      requestToSend = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  } catch {
    
  }

  return next(requestToSend).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
       
        if (req.headers.has(RETRY_HEADER)) {
          return handleAuthFailure();
        }

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          return handleAuthFailure();
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return refreshAccessToken(http, refreshToken).pipe(
            switchMap((newToken: string) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);
              const authReq = req.clone({
                setHeaders: { [RETRY_HEADER]: 'true', Authorization: `Bearer ${newToken}` }
              });
              return next(authReq);
            }),
            catchError(() => {
              isRefreshing = false;
              return handleAuthFailure();
            })
          );
        } else {
          // queue until refresh completes
          return refreshTokenSubject.pipe(
            take(1),
            switchMap((newToken) => {
              if (!newToken) {
                return handleAuthFailure();
              }
              const authReq = req.clone({
                setHeaders: { [RETRY_HEADER]: 'true', Authorization: `Bearer ${newToken}` }
              });
              return next(authReq);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};

function refreshAccessToken(http: HttpClient, refreshToken: string): Observable<string> {
  const url = `${environment.apiUrl}/Auth/RefreshToken?token=${encodeURIComponent(refreshToken)}`;
  return http.post<any>(url, null).pipe(
    switchMap(response => {
      const accessToken: string | undefined = response?.data?.accessToken || response?.token || response?.Token;
      const newRefresh: string | undefined = response?.data?.refreshToken || response?.refreshToken || response?.RefreshToken;
      if (!accessToken) {
        return throwError(() => new Error('No access token in refresh response'));
      }
      try {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (newRefresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        }
      } catch {}
      return new Observable<string>((observer) => {
        observer.next(accessToken);
        observer.complete();
      });
    })
  );
}

function handleAuthFailure() {
  try {
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('ecommerce_refresh_token');
  } catch {}
  return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
}


