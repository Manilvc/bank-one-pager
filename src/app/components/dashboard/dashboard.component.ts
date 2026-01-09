import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BankService } from '../../services/bank.service';
import { SubmissionStatus } from '../../models/presentation.model';

/**
 * Dashboard component displaying overview statistics and quick actions
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div class="header-content">
          <h1>Welcome back, Manager</h1>
          <p>Here's what's happening with your bank account applications today.</p>
        </div>
        <button class="primary-btn" (click)="navigateToAccountOpening()">
          <span class="btn-icon">+</span>
          New Account Application
        </button>
      </header>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-label">Pending Reviews</span>
          </div>
          <div class="stat-trend up">
            <span>+2 today</span>
          </div>
        </div>
        
        <div class="stat-card approved">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ approvedCount }}</span>
            <span class="stat-label">Approved</span>
          </div>
          <div class="stat-trend up">
            <span>+5 this week</span>
          </div>
        </div>
        
        <div class="stat-card rejected">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ rejectedCount }}</span>
            <span class="stat-label">Rejected</span>
          </div>
          <div class="stat-trend">
            <span>This month</span>
          </div>
        </div>
        
        <div class="stat-card total">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalDefinitions }}</span>
            <span class="stat-label">QR Definitions</span>
          </div>
          <div class="stat-trend">
            <span>Active</span>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-card" (click)="navigateToAccountOpening()">
            <div class="action-icon savings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <span class="action-title">Open Savings Account</span>
            <span class="action-desc">Start new savings account application</span>
          </button>
          
          <button class="action-card" (click)="navigateToSubmissions()">
            <div class="action-icon review">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <span class="action-title">Review Submissions</span>
            <span class="action-desc">{{ pendingCount }} pending verifications</span>
          </button>
          
          <button class="action-card" (click)="navigateToPresentations()">
            <div class="action-icon qr">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
              </svg>
            </div>
            <span class="action-title">Manage QR Codes</span>
            <span class="action-desc">View and create verification QR codes</span>
          </button>
        </div>
      </section>
      
      <!-- Recent Activity -->
      <section class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          @for (submission of recentSubmissions; track submission.id) {
            <div class="activity-item">
              <div class="activity-icon" [class]="submission.status">
                @switch (submission.status) {
                  @case ('pending') {
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  }
                  @case ('approved') {
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  }
                  @case ('rejected') {
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  }
                }
              </div>
              <div class="activity-content">
                <span class="activity-title">{{ submission.holderName }}</span>
                <span class="activity-desc">{{ getDocumentName(submission.documentType) }} verification - {{ getAccountName(submission.accountType) }}</span>
              </div>
              <div class="activity-time">
                {{ formatTime(submission.submittedAt) }}
              </div>
              <span class="activity-status" [class]="submission.status">
                {{ submission.status | titlecase }}
              </span>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.4s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
    }
    
    .header-content h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .header-content p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 15px;
    }
    
    .primary-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }
    
    .btn-icon {
      font-size: 18px;
      font-weight: 700;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    
    .stat-card.pending::before {
      background: linear-gradient(90deg, #ffc107, #ff9800);
    }
    
    .stat-card.approved::before {
      background: linear-gradient(90deg, #00d4aa, #00a085);
    }
    
    .stat-card.rejected::before {
      background: linear-gradient(90deg, #ff4757, #c0392b);
    }
    
    .stat-card.total::before {
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .stat-card.pending .stat-icon {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    
    .stat-card.approved .stat-icon {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .stat-card.rejected .stat-icon {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    .stat-card.total .stat-icon {
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }
    
    .stat-icon svg {
      width: 24px;
      height: 24px;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 36px;
      font-weight: 600;
      color: #fff;
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
    
    .stat-trend {
      margin-top: 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .stat-trend.up {
      color: #00d4aa;
    }
    
    .quick-actions h2,
    .recent-activity h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 20px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .action-card {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 212, 170, 0.3);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    
    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .action-icon.savings {
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.2) 0%, rgba(0, 160, 133, 0.1) 100%);
      color: #00d4aa;
    }
    
    .action-icon.review {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%);
      color: #ffc107;
    }
    
    .action-icon.qr {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
    }
    
    .action-icon svg {
      width: 28px;
      height: 28px;
    }
    
    .action-title {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
    }
    
    .action-desc {
      display: block;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .activity-list {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .activity-icon.pending {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    
    .activity-icon.approved {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .activity-icon.rejected {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    .activity-icon svg {
      width: 20px;
      height: 20px;
    }
    
    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .activity-title {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    
    .activity-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .activity-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .activity-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .activity-status.pending {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    
    .activity-status.approved {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .activity-status.rejected {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        gap: 20px;
      }
    }
  `]
})
export class DashboardComponent {
  private readonly bankService = inject(BankService);
  private readonly router = inject(Router);
  
  get pendingCount(): number {
    return this.bankService.getSubmissionsByStatus(SubmissionStatus.PENDING).length;
  }
  
  get approvedCount(): number {
    return this.bankService.getSubmissionsByStatus(SubmissionStatus.APPROVED).length;
  }
  
  get rejectedCount(): number {
    return this.bankService.getSubmissionsByStatus(SubmissionStatus.REJECTED).length;
  }
  
  get totalDefinitions(): number {
    return this.bankService.getPresentationDefinitions().length;
  }
  
  get recentSubmissions() {
    return this.bankService.getSubmissions()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }
  
  navigateToAccountOpening(): void {
    this.router.navigate(['/account-opening']);
  }
  
  navigateToSubmissions(): void {
    this.router.navigate(['/submissions']);
  }
  
  navigateToPresentations(): void {
    this.router.navigate(['/presentations']);
  }
  
  getDocumentName(type: string): string {
    const names: Record<string, string> = {
      'aadhar': 'Aadhar Card',
      'pan': 'PAN Card',
      'voter_id': 'Voter ID'
    };
    return names[type] || type;
  }
  
  getAccountName(type: string): string {
    const names: Record<string, string> = {
      'savings': 'Savings Account',
      'current': 'Current Account',
      'fixed_deposit': 'Fixed Deposit',
      'recurring_deposit': 'Recurring Deposit',
      'nri': 'NRI Account',
      'salary': 'Salary Account'
    };
    return names[type] || type;
  }
  
  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
