import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiSingleResponse } from './api.service';

/**
 * Authentication response from API
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user?: UserInfo;
}

/**
 * User information
 */
export interface UserInfo {
  user_id?: string;
  id?: number;
  username?: string;
  email: string | null;
  role?: string | null;
  name?: string | null;
  department?: string | null;
  organization_id?: string | null;
  use_case?: string;
}

/**
 * Login request payload (Sign In)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload (Sign Up)
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  department: string;
  organization_id: string;
  role: string;
  use_case: 'bank' | 'hotel';
}

/**
 * Service for handling authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiBaseUrl;
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';
  
  // Signals for reactive state management
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<UserInfo | null>(null);
  private _token = signal<string | null>(null);
  
  // Public readonly signals
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initializes authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token) {
      this._token.set(token);
      this._isAuthenticated.set(true);
      if (user) {
        this._currentUser.set(user);
      }
    }
  }

  /**
   * Logs in a user (Sign In)
   * @param credentials - Login credentials
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiSingleResponse<AuthResponse> | AuthResponse>(`${this.baseUrl}/auth/signin`, credentials).pipe(
      map((response: ApiSingleResponse<AuthResponse> | AuthResponse) => {
        // Handle both wrapped and direct response formats
        if ('data' in response && response.data) {
          return response.data;
        }
        // If response is direct AuthResponse
        if ('access_token' in response) {
          return response;
        }
        // Type assertion for safety
        return (response as unknown as AuthResponse);
      }),
      tap((authResponse: AuthResponse) => {
        if (authResponse.access_token) {
          this.setAuthToken(authResponse.access_token);
          this._isAuthenticated.set(true);
        }
        if (authResponse.user) {
          this.setCurrentUser(authResponse.user);
        }
      })
    );
  }

  /**
   * Registers a new user (Sign Up)
   * @param registrationData - Registration data
   */
  register(registrationData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiSingleResponse<AuthResponse> | AuthResponse>(`${this.baseUrl}/auth/signup`, registrationData).pipe(
      map((response: ApiSingleResponse<AuthResponse> | AuthResponse) => {
        // Handle both wrapped and direct response formats
        if ('data' in response) {
          return response.data;
        }
        return response;
      }),
      tap((authResponse: AuthResponse) => {
        this.setAuthToken(authResponse.access_token);
        if (authResponse.user) {
          this.setCurrentUser(authResponse.user);
        }
        this._isAuthenticated.set(true);
      })
    );
  }

  /**
   * Logs out the current user
   */
  logout(): Observable<unknown> {
    return this.http.post<ApiSingleResponse<unknown>>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Even if logout API fails, clear local auth
        this.clearAuth();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  /**
   * Refreshes the authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<ApiSingleResponse<AuthResponse>>(`${this.baseUrl}/auth/refresh`, {}).pipe(
      map((response: ApiSingleResponse<AuthResponse>) => response.data),
      tap((authResponse: AuthResponse) => {
        this.setAuthToken(authResponse.access_token);
        if (authResponse.user) {
          this.setCurrentUser(authResponse.user);
        }
      })
    );
  }

  /**
   * Gets current user information
   */
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<ApiSingleResponse<UserInfo>>(`${this.baseUrl}/auth/me`).pipe(
      map((response: ApiSingleResponse<UserInfo>) => {
        // Handle the response structure
        if (response && response.data) {
          return response.data;
        }
        // Fallback if response structure is different
        return (response as unknown as UserInfo);
      }),
      tap((user: UserInfo) => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  /**
   * Sets the authentication token
   */
  private setAuthToken(token: string): void {
    this._token.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Sets the current user
   */
  private setCurrentUser(user: UserInfo): void {
    this._currentUser.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Gets stored token from localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Gets stored user from localStorage
   */
  getStoredUser(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Clears authentication data
   */
  clearAuth(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Checks if user is authenticated
   */
  checkAuth(): boolean {
    return this._isAuthenticated() && this._token() !== null;
  }
}
