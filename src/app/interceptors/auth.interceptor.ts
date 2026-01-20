import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor to add authentication token to requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getStoredToken();

  // Skip adding token to auth endpoints
  if (req.url.includes('/auth/signin') || req.url.includes('/auth/signup') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Add token to request headers if available
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  } else {
    console.warn('No token available for request:', req.url);
  }

  return next(req);
};
