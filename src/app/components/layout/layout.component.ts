import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BankService } from '../../services/bank.service';

/**
 * Main layout component with navigation sidebar
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18.5 7h-13L12 4.5zM4 11v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 21h20v2H2v-2z"/>
            </svg>
          </div>
          <span class="logo-text">NeoBank</span>
        </div>
        
        <nav class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </span>
            <span class="nav-text">Dashboard</span>
          </a>
          
          <a routerLink="/account-opening" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </span>
            <span class="nav-text">Account Opening</span>
          </a>
          
          <a routerLink="/submissions" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </span>
            <span class="nav-text">Submissions</span>
            @if (pendingCount() > 0) {
              <span class="badge">{{ pendingCount() }}</span>
            }
          </a>
          
          <a routerLink="/presentations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2h2v-4h4v-2h-4V5h-2v4H9v2h4z"/>
              </svg>
            </span>
            <span class="nav-text">QR Definitions</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">MA</div>
            <div class="user-details">
              <span class="user-name">Manager Admin</span>
              <span class="user-role">Branch Manager</span>
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
    .layout {
      display: flex;
      min-height: 100vh;
      background: #0a0a0f;
    }
    
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #12121a 0%, #0d0d14 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 32px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0a0a0f;
    }
    
    .logo-icon svg {
      width: 24px;
      height: 24px;
    }
    
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
      background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav-menu {
      flex: 1;
      padding: 0 12px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      margin: 4px 0;
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.9);
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(0, 160, 133, 0.1) 100%);
      color: #00d4aa;
    }
    
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: #00d4aa;
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
      background: #ff4757;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }
    
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .avatar {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-size: 14px;
    }
    
    .user-role {
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
    }
    
    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 32px;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {
  private readonly bankService = inject(BankService);
  
  readonly pendingCount = this.bankService.pendingSubmissionsCount;
}
