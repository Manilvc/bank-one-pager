import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

/**
 * Registration component for user sign-up with theme support
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-container" [class.bank-theme]="theme() === 'bank'" [class.hotel-theme]="theme() === 'hotel'">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <div class="logo-icon" [class.bank-icon]="theme() === 'bank'" [class.hotel-icon]="theme() === 'hotel'">
              @if (theme() === 'bank') {
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18.5 7h-13L12 4.5zM4 11v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 21h20v2H2v-2z"/>
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              }
            </div>
            <span class="logo-text">{{ theme() === 'bank' ? 'NeoBank' : 'HotelHub' }}</span>
          </div>
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>
        
        <form class="register-form" (ngSubmit)="onRegister()" #registerForm="ngForm">
          @if (error()) {
            <div class="error-message">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{{ error() }}</span>
            </div>
          }
          
          <div class="form-group">
            <label for="name">Full Name <span class="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="registrationData.name"
              required
              [disabled]="loading()"
              placeholder="Enter your full name"
              class="form-input">
          </div>

          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="registrationData.email"
              required
              email
              [disabled]="loading()"
              placeholder="Enter your email"
              class="form-input">
          </div>

          <div class="form-group">
            <label for="department">Department <span class="required">*</span></label>
            <input
              type="text"
              id="department"
              name="department"
              [(ngModel)]="registrationData.department"
              required
              [disabled]="loading()"
              [placeholder]="theme() === 'hotel' ? 'e.g., Front Desk, Housekeeping' : 'e.g., Customer Service, Operations'"
              class="form-input">
          </div>

          <div class="form-group">
            <label for="organization_id">Organization ID <span class="required">*</span></label>
            <input
              type="text"
              id="organization_id"
              name="organization_id"
              [(ngModel)]="registrationData.organization_id"
              required
              [disabled]="loading()"
              placeholder="Enter your organization ID"
              class="form-input">
          </div>

          <div class="form-group">
            <label for="role">Role <span class="required">*</span></label>
            <input
              type="text"
              id="role"
              name="role"
              [(ngModel)]="registrationData.role"
              required
              [disabled]="loading()"
              [placeholder]="theme() === 'hotel' ? 'e.g., Hotel Manager, Front Desk' : 'e.g., Branch Manager, Teller'"
              class="form-input">
          </div>
          
          <div class="form-group">
            <label for="password">Password <span class="required">*</span></label>
            <div class="password-input-wrapper">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="registrationData.password"
                required
                minlength="6"
                [disabled]="loading()"
                placeholder="Create a password (min. 6 characters)"
                class="form-input">
              <button
                type="button"
                class="password-toggle-btn"
                (click)="togglePasswordVisibility()"
                [disabled]="loading()"
                tabindex="-1">
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirm_password">Confirm Password <span class="required">*</span></label>
            <div class="password-input-wrapper">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                id="confirm_password"
                name="confirm_password"
                [(ngModel)]="registrationData.confirm_password"
                required
                [disabled]="loading()"
                placeholder="Confirm your password"
                class="form-input">
              <button
                type="button"
                class="password-toggle-btn"
                (click)="toggleConfirmPasswordVisibility()"
                [disabled]="loading()"
                tabindex="-1">
                @if (showConfirmPassword()) {
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                }
              </button>
            </div>
            @if (registrationData.password && registrationData.confirm_password && 
                 registrationData.password !== registrationData.confirm_password) {
              <span class="field-error">Passwords do not match</span>
            }
          </div>
          
          <button
            type="submit"
            class="register-btn"
            [class.bank-btn]="theme() === 'bank'"
            [class.hotel-btn]="theme() === 'hotel'"
            [disabled]="!registerForm.valid || loading() || registrationData.password !== registrationData.confirm_password">
            @if (loading()) {
              <div class="btn-spinner"></div>
              <span>Creating account...</span>
            } @else {
              <span>Sign Up</span>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            }
          </button>

          <div class="form-footer">
            <span>Already have an account?</span>
            <button type="button" class="link-btn" (click)="goToLogin()">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      width: 100%;
    }

    .register-card {
      width: 100%;
      background: linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(18, 18, 26, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 32px;
      margin-top: 0;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon.bank-icon {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
    }

    .logo-icon.hotel-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #fff;
    }
    
    .logo-icon svg {
      width: 28px;
      height: 28px;
    }
    
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .register-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .register-header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
    }
    
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: rgba(255, 71, 87, 0.15);
      border: 1px solid rgba(255, 71, 87, 0.3);
      border-radius: 12px;
      color: #ff4757;
      font-size: 14px;
    }
    
    .error-message svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .password-input-wrapper .form-input {
      padding-right: 48px;
    }
    
    .password-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      transition: color 0.2s ease;
      outline: none;
    }
    
    .password-toggle-btn:hover:not(:disabled) {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .password-toggle-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .password-toggle-btn svg {
      width: 20px;
      height: 20px;
    }
    
    .register-container.bank-theme .password-toggle-btn:hover:not(:disabled) {
      color: #00d4aa;
    }
    
    .register-container.hotel-theme .password-toggle-btn:hover:not(:disabled) {
      color: #f093fb;
    }
    
    .form-input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 15px;
      color: #fff;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    
    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    
    .form-input:focus {
      border-color: rgba(0, 212, 170, 0.5);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
    }

    .register-container.hotel-theme .form-input:focus {
      border-color: rgba(240, 147, 251, 0.5);
      box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
    }
    
    .form-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field-error {
      font-size: 12px;
      color: #ff4757;
      margin-top: -4px;
    }
    
    .register-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #0a0a0f;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 8px;
    }

    .register-btn.bank-btn {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
    }

    .register-btn.hotel-btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .register-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.4);
    }

    .register-btn.hotel-btn:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(240, 147, 251, 0.4);
    }
    
    .register-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .register-btn svg {
      width: 20px;
      height: 20px;
    }
    
    .btn-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(10, 10, 15, 0.3);
      border-top-color: #0a0a0f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    .link-btn {
      background: none;
      border: none;
      color: #00d4aa;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.2s ease;
    }

    .register-container.hotel-theme .link-btn {
      color: #f093fb;
    }

    .link-btn:hover {
      color: #00a085;
    }

    .register-container.hotel-theme .link-btn:hover {
      color: #f5576c;
    }
    
    @media (max-width: 480px) {
      .register-card {
        padding: 32px 24px;
      }
      
      .register-header h1 {
        font-size: 28px;
      }
    }
  `]
})
export class RegisterComponent {
  theme = input<'bank' | 'hotel'>('bank');
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  
  registrationData: RegisterRequest & { confirm_password: string } = {
    email: '',
    password: '',
    confirm_password: '',
    name: '',
    department: '',
    organization_id: '',
    role: '',
    use_case: 'bank'
  };

  /**
   * Handles registration form submission
   */
  onRegister(): void {
    if (!this.registrationData.email || !this.registrationData.password || 
        !this.registrationData.confirm_password || !this.registrationData.name ||
        !this.registrationData.department || !this.registrationData.organization_id ||
        !this.registrationData.role) {
      this.error.set('Please fill in all required fields');
      return;
    }

    if (this.registrationData.password !== this.registrationData.confirm_password) {
      this.error.set('Passwords do not match');
      return;
    }

    if (this.registrationData.password.length < 6) {
      this.error.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Set use_case based on theme and create payload without confirm_password
    const payload: RegisterRequest = {
      email: this.registrationData.email,
      password: this.registrationData.password,
      name: this.registrationData.name,
      department: this.registrationData.department,
      organization_id: this.registrationData.organization_id,
      role: this.registrationData.role,
      use_case: this.theme()
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        // Navigate to appropriate dashboard based on theme
        const redirectPath = this.theme() === 'hotel' ? '/hotel/dashboard' : '/dashboard';
        this.router.navigate([redirectPath]);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        } else if (typeof error === 'object' && error !== null && 'error' in error) {
          const err = error as { error?: { message?: string; detail?: string } };
          errorMessage = err.error?.message || err.error?.detail || errorMessage;
        }
        
        this.error.set(errorMessage);
      }
    });
  }

  /**
   * Navigates to login page
   */
  goToLogin(): void {
    const theme = this.theme();
    this.router.navigate(['/login'], { queryParams: { theme, mode: 'login' } });
  }

  /**
   * Toggles password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggles confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
