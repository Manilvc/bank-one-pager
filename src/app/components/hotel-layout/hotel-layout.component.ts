import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService, UserInfo } from '../../services/auth.service';

/**
 * Hotel-specific layout component with different theme and navigation
 */
@Component({
  selector: 'app-hotel-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hotel-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
          <span class="logo-text">HotelHub</span>
        </div>
        
        <nav class="nav-menu">
          <a routerLink="/hotel/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </span>
            <span class="nav-text">Dashboard</span>
          </a>
          
          <a routerLink="/hotel/checkin" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </span>
            <span class="nav-text">Check-In</span>
          </a>
          
          <a routerLink="/hotel/checkout" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </span>
            <span class="nav-text">Check-Out</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <button 
            type="button" 
            class="switch-mode-btn" 
            (click)="switchToBank()"
            (mousedown)="$event.preventDefault(); switchToBank()"
            (touchstart)="switchToBank()"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Switch to Bank</span>
          </button>
          <div class="user-info">
            <div class="avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              @if (userLoading()) {
                <span class="user-name">Loading...</span>
                <span class="user-role">User</span>
              } @else {
                <span class="user-name">{{ currentUser()?.name || 'User' }}</span>
                <span class="user-role">{{ currentUser()?.role || currentUser()?.department || 'User' }}</span>
              }
            </div>
          </div>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .hotel-layout {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 52, 96, 0.95) 100%);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 32px;
    }
    
    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
    }
    
    .logo-icon svg {
      width: 24px;
      height: 24px;
    }
    
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav-menu {
      flex: 1;
      padding: 0 16px;
      overflow-y: auto;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      margin: 6px 0;
      border-radius: 14px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .nav-item:hover {
      background: rgba(240, 147, 251, 0.1);
      color: rgba(255, 255, 255, 0.95);
      transform: translateX(4px);
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
      color: #f093fb;
      box-shadow: 0 4px 15px rgba(240, 147, 251, 0.2);
    }
    
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 32px;
      background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
      border-radius: 0 4px 4px 0;
    }
    
    .nav-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-icon svg {
      width: 100%;
      height: 100%;
    }
    
    .badge {
      margin-left: auto;
      background: linear-gradient(135deg, #f5576c 0%, #c0392b 100%);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      min-width: 24px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
    }
    
    .sidebar-footer {
      padding: 20px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 1;
    }
    
    .switch-mode-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer !important;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1000 !important;
      pointer-events: auto !important;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      touch-action: manipulation;
      outline: none;
    }
    
    .switch-mode-btn:focus {
      outline: 2px solid rgba(240, 147, 251, 0.5);
      outline-offset: 2px;
    }
    
    .switch-mode-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(240, 147, 251, 0.3);
      color: #f093fb;
      transform: translateY(-2px);
    }
    
    .switch-mode-btn:active {
      transform: translateY(0);
    }
    
    .switch-mode-btn svg {
      width: 18px;
      height: 18px;
      pointer-events: none;
    }
    
    .switch-mode-btn span {
      pointer-events: none;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #fff;
      font-size: 14px;
    }
    
    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    
    .user-role {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 32px;
      min-height: 100vh;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .main-content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `]
})
export class HotelLayoutComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  
  readonly pendingCount = signal<number>(0);
  readonly currentUser = signal<UserInfo | null>(null);
  readonly userLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadPendingCount();
    this.loadUserDetails();
  }

  /**
   * Loads pending check-out count
   */
  private loadPendingCount(): void {
    this.apiService.getSubmissions({ status: 'pending', limit: 1 }).subscribe({
      next: (response: { data: any[]; total: number }) => {
        // Filter for hotel-related submissions
        const hotelPending = response.data.filter((sub: any) => 
          this.isRoomType(sub.account_type)
        );
        this.pendingCount.set(hotelPending.length > 0 ? response.total : 0);
      }
    });
  }

  /**
   * Checks if account_type is a room type
   */
  private isRoomType(accountType: string): boolean {
    const roomTypes = ['Standard Room', 'Deluxe Room', 'Suite', 'Presidential Suite'];
    return roomTypes.some((type: string) => accountType.includes(type));
  }

  /**
   * Loads user details from API
   */
  private loadUserDetails(): void {
    this.userLoading.set(true);
    this.authService.getCurrentUser().subscribe({
      next: (user: UserInfo) => {
        if (user && (user.name || user.email)) {
          this.currentUser.set(user);
        } else {
          console.warn('User data is incomplete:', user);
          // Try to get stored user as fallback
          const storedUser = this.authService.getStoredUser();
          if (storedUser && (storedUser.name || storedUser.email)) {
            this.currentUser.set(storedUser);
          }
        }
        this.userLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load user details:', error);
        // Fallback to stored user if available
        const storedUser = this.authService.getStoredUser();
        if (storedUser && (storedUser.name || storedUser.email)) {
          this.currentUser.set(storedUser);
        }
        this.userLoading.set(false);
      }
    });
  }

  /**
   * Gets user initials for avatar
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user || !user.name) {
      return 'U';
    }
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  /**
   * Switches to bank mode - navigates to bank login page
   */
  switchToBank(): void {
    console.log('Switch to Bank clicked');
    try {
      // Clear auth state
      this.authService.clearAuth();
      // Navigate to login with bank theme
      this.router.navigate(['/login'], { queryParams: { theme: 'bank', mode: 'login' } }).then(() => {
        console.log('Navigation successful');
      }).catch((error) => {
        console.error('Navigation error:', error);
        // Fallback: try window.location if router fails
        window.location.href = '/login?theme=bank&mode=login';
      });
    } catch (error) {
      console.error('Error in switchToBank:', error);
      // Fallback navigation
      window.location.href = '/login?theme=bank&mode=login';
    }
  }
}
