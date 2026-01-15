import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor to add ngrok-skip-browser-warning header to all requests
 */
export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    setHeaders: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  
  return next(clonedRequest);
};
