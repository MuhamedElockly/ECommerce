import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  LoginApiResponse,
  User, 
  AuthState, 
  TokenPayload 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ecommerce_token';
  private readonly USER_KEY = 'ecommerce_user';
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

 
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.authStateSubject.next({
        isAuthenticated: true,
        user: user,
        token: token,
        loading: false,
        error: null
      });
    } else {
      this.clearStoredAuth();
    }
  }


  register(registerData: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);

    return this.http.post<LoginApiResponse>(`${environment.apiUrl}/Auth/Register`, registerData)
      .pipe(
        map(response => {
          if (response.success) {
           
            return {
              success: response.success,
              message: response.message,
              data: {
                accessToken: '',
                refreshToken: ''
              },
              errors: response.errors
            } as AuthResponse;
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        }),
        tap(() => {
        
          this.setLoading(false);
        }),
        catchError(error => {
          const message = this.extractApiErrorMessage(error) || 'Registration failed. Please try again.';
          this.setError(message);
          return throwError(() => error);
        })
      );
  }

  
  
  login(loginData: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginApiResponse>(`${environment.apiUrl}/Auth`, loginData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
       
            const user = this.extractUserFromToken(response.data.accessToken);
            return {
              success: response.success,
              message: response.message,
              data: {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
              },
              errors: response.errors,
              user: user
            } as AuthResponse & { user: User };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        tap(response => {
          this.handleAuthSuccess(response as any);
        }),
        catchError(error => {
          const message = this.extractApiErrorMessage(error) || 'Login failed. Please check your credentials.';
          this.setError(message);
          return throwError(() => error);
        })
      );
  }

  
  logout(): void {
    this.clearStoredAuth();
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });
  }


  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return token !== null && !this.isTokenExpired(token);
  }


  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }


  getCurrentToken(): string | null {
    return this.authStateSubject.value.token;
  }

 
  hasRole(role: 'admin' | 'customer'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  
  isAdmin(): boolean {
    return this.hasRole('admin');
  }


  isCustomer(): boolean {
    return this.hasRole('customer');
  }

 
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }


    return this.http.post<LoginApiResponse>(`${environment.apiUrl}/Auth/RefreshToken?token=${encodeURIComponent(refreshToken)}`, null)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const user = this.extractUserFromToken(response.data.accessToken);
            return {
              success: response.success,
              message: response.message,
              data: {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
              },
              errors: response.errors,
              user: user
            } as AuthResponse & { user: User };
          } else {
            throw new Error(response.message || 'Token refresh failed');
          }
        }),
        tap(response => {
          this.handleAuthSuccess(response as any);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private handleAuthSuccess(response: AuthResponse & { user: User | null }): void {
    if (response.data.accessToken && response.user) {
   
      this.storeAuth(response.data.accessToken, response.user, response.data.refreshToken);
      this.authStateSubject.next({
        isAuthenticated: true,
        user: response.user,
        token: response.data.accessToken,
        loading: false,
        error: null
      });
    } else {
     
      this.authStateSubject.next({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      });
    }
  }

  private extractUserFromToken(token: string): User {
    try {
      const payload = this.decodeToken(token);

      const rawRole = (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || payload['role']
        || payload['Role']
        || '').toString().toLowerCase();

      const role: 'admin' | 'customer' = rawRole === 'admin' ? 'admin' : 'customer';

      return {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        firstName: payload['given_name'] || '',
        lastName: payload['family_name'] || '',
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload['email'],
        phoneNumber: payload['phone_number'] || '',
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      throw new Error('Invalid token format');
    }
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      loading: loading
    });
  }

  private setError(error: string): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      loading: false,
      error: error
    });
  }

  private storeAuth(token: string, user: User, refreshToken?: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('ecommerce_refresh_token', refreshToken);
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('ecommerce_refresh_token');
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('ecommerce_refresh_token');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private extractApiErrorMessage(error: any): string | null {
    try {

      const payload = error?.error;
      if (!payload) {
        return error?.message ?? null;
      }

      const apiMessage = payload.message as string | undefined;

      const validation = payload.data as Record<string, string[]> | undefined;
      if (validation && typeof validation === 'object') {
        const firstKey = Object.keys(validation)[0];
        const firstMsg = firstKey ? validation[firstKey]?.[0] : undefined;
        return firstMsg || apiMessage || null;
      }

      const errors = payload.errors as Record<string, string[]> | string | undefined;
      if (errors) {
        if (typeof errors === 'string') return errors;
        const key = Object.keys(errors)[0];
        const msg = key ? (errors as Record<string, string[]>)[key]?.[0] : undefined;
        return msg || apiMessage || null;
      }
      return apiMessage || null;
    } catch {
      return null;
    }
  }

 
  clearError(): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error: null
    });
  }
}


