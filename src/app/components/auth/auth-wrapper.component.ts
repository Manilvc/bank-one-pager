import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

/**
 * Auth wrapper component that switches between bank and hotel themes
 * and handles login/register toggle
 */
@Component({
  selector: 'app-auth-wrapper',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  template: `
    <div class="auth-wrapper" [class.bank-theme]="isBankTheme()" [class.hotel-theme]="!isBankTheme()">
      <div class="theme-switcher">
        <button 
          class="theme-btn" 
          [class.active]="isBankTheme()"
          (click)="switchTheme('bank')">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18.5 7h-13L12 4.5zM4 11v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 21h20v2H2v-2z"/>
          </svg>
          <span>Bank</span>
        </button>
        <button 
          class="theme-btn" 
          [class.active]="!isBankTheme()"
          (click)="switchTheme('hotel')">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          <span>Hotel</span>
        </button>
      </div>

      <div class="auth-container">
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            [class.active]="isLoginMode()"
            (click)="setMode('login')">
            Sign In
          </button>
          <button 
            class="tab-btn" 
            [class.active]="!isLoginMode()"
            (click)="setMode('register')">
            Sign Up
          </button>
        </div>

        <div class="auth-content">
          @if (isLoginMode()) {
            <app-login [theme]="currentTheme()" />
          } @else {
            <app-register [theme]="currentTheme()" />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      position: relative;
      transition: background 0.5s ease;
    }

    .auth-wrapper.bank-theme {
      background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #1a1a2e 100%);
    }

    .auth-wrapper.hotel-theme {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }

    .theme-switcher {
      position: fixed;
      top: 24px;
      right: 24px;
      display: flex;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 4px;
      z-index: 1000;
    }

    .theme-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .theme-btn svg {
      width: 18px;
      height: 18px;
    }

    .theme-btn:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.05);
    }

    .theme-btn.active {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .auth-wrapper.bank-theme .theme-btn.active {
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.2) 0%, rgba(0, 160, 133, 0.2) 100%);
      color: #00d4aa;
    }

    .auth-wrapper.hotel-theme .theme-btn.active {
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
      color: #f093fb;
    }

    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .auth-tabs {
      position: absolute;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 4px;
      z-index: 100;
    }

    .tab-btn {
      padding: 10px 24px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-btn:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .tab-btn.active {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .auth-wrapper.bank-theme .tab-btn.active {
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.2) 0%, rgba(0, 160, 133, 0.2) 100%);
      color: #00d4aa;
    }

    .auth-wrapper.hotel-theme .tab-btn.active {
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
      color: #f093fb;
    }

    .auth-content {
      width: 100%;
      max-width: 420px;
      margin-top: 100px;
      padding-top: 0;
    }

    @media (max-width: 768px) {
      .theme-switcher {
        top: 16px;
        right: 16px;
      }

      .auth-tabs {
        top: 80px;
      }

      .auth-content {
        margin-top: 70px;
      }
    }
  `]
})
export class AuthWrapperComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private _theme = signal<'bank' | 'hotel'>('bank');
  private _mode = signal<'login' | 'register'>('login');

  readonly currentTheme = this._theme.asReadonly();
  readonly isBankTheme = computed(() => this._theme() === 'bank');
  readonly isLoginMode = computed(() => this._mode() === 'login');

  ngOnInit(): void {
    // Check URL params for theme and mode
    this.route.queryParams.subscribe((params) => {
      const theme = params['theme'];
      const mode = params['mode'];
      
      if (theme === 'hotel' || theme === 'bank') {
        this._theme.set(theme);
      }
      
      if (mode === 'register' || mode === 'login') {
        this._mode.set(mode);
      }
    });
  }

  switchTheme(theme: 'bank' | 'hotel'): void {
    this._theme.set(theme);
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { theme, mode: this._mode() },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setMode(mode: 'login' | 'register'): void {
    this._mode.set(mode);
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { theme: this._theme(), mode },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
