import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, DashboardStatistics, RecentActivityItem } from '../../services/api.service';


/**
 * Hotel dashboard component with hotel-specific statistics and UI
 * Displays hotel management overview with check-in/check-out statistics
 */
@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hotel-dashboard">
      <header class="page-header">
        <div class="header-content">
          <h1>Hotel Dashboard</h1>
          <p>Welcome back! Here's your hotel management overview</p>
        </div>
      </header>
      
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Pending Check-Outs</span>
            <span class="stat-value">{{ statistics()?.pending_reviews || 0 }}</span>
          </div>
        </div>
        
        <div class="stat-card checked-in">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Checked In Today</span>
            <span class="stat-value">{{ statistics()?.pending_today || 0 }}</span>
          </div>
        </div>
        
        <div class="stat-card completed">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Completed This Week</span>
            <span class="stat-value">{{ statistics()?.approved_this_week || 0 }}</span>
          </div>
        </div>
        
        <div class="stat-card total">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total QR Codes</span>
            <span class="stat-value">{{ statistics()?.qr_definitions || 0 }}</span>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-card" (click)="goToCheckIn()">
            <div class="action-icon checkin">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span class="action-label">New Check-In</span>
            <span class="action-desc">Create guest verification</span>
          </button>
          
          <button class="action-card" (click)="goToCheckOut()">
            <div class="action-icon checkout">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <span class="action-label">Manage Check-Outs</span>
            <span class="action-desc">Review guest requests</span>
          </button>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        @if (activityLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading activity...</p>
          </div>
        } @else {
          <div class="activity-list">
            @for (activity of recentActivity(); track activity.request_id) {
              <div class="activity-item">
                <div class="activity-icon" [class]="getStatusClass(activity.status)">
                  {{ getRoomIcon(activity.account_type) }}
                </div>
                <div class="activity-content">
                  <span class="activity-title">{{ activity.document_name }} - {{ getRoomTypeDisplay(activity.account_type) }}</span>
                  <span class="activity-time">{{ formatDate(activity.created_at) }}</span>
                </div>
                <span class="activity-status" [class]="activity.status.toLowerCase()">
                  {{ getStatusDisplay(activity.status) }}
                </span>
              </div>
            } @empty {
              <div class="empty-state">
                <p>No recent activity</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hotel-dashboard {
      animation: fadeIn 0.4s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .page-header {
      margin-bottom: 32px;
    }
    
    .page-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    
    .page-header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 52, 96, 0.8) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(240, 147, 251, 0.2);
      border-color: rgba(240, 147, 251, 0.3);
    }
    
    .stat-card.pending .stat-icon {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    }
    
    .stat-card.checked-in .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .stat-card.completed .stat-icon {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
    }
    
    .stat-card.total .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .stat-icon svg {
      width: 28px;
      height: 28px;
    }
    
    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
    }
    
    .quick-actions {
      margin-bottom: 40px;
    }
    
    .quick-actions h2 {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 20px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .action-card {
      background: linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 52, 96, 0.8) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }
    
    .action-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(240, 147, 251, 0.3);
      border-color: rgba(240, 147, 251, 0.4);
    }
    
    .action-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    
    .action-icon.checkin {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .action-icon.checkout {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .action-icon svg {
      width: 36px;
      height: 36px;
    }
    
    .action-label {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
    
    .action-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .recent-activity {
      background: linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 52, 96, 0.8) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px;
    }
    
    .recent-activity h2 {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 24px;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;
    }
    
    .activity-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(240, 147, 251, 0.2);
    }
    
    .activity-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
    }
    
    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .activity-title {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
    }
    
    .activity-time {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .activity-status {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
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
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(240, 147, 251, 0.2);
      border-top-color: #f093fb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    @media (max-width: 768px) {
      .stats-grid, .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HotelDashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  
  readonly statistics = signal<DashboardStatistics | null>(null);
  readonly recentActivity = signal<RecentActivityItem[]>([]);
  readonly activityLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadStatistics();
    this.loadRecentActivity();
  }

  /**
   * Loads dashboard statistics
   */
  private loadStatistics(): void {
    this.apiService.getDashboardStatistics().subscribe({
      next: (stats: DashboardStatistics) => {
        this.statistics.set(stats);
      },
      error: (error: Error) => {
        console.error('Failed to load statistics:', error);
      }
    });
  }

  /**
   * Loads recent activity
   */
  private loadRecentActivity(): void {
    this.activityLoading.set(true);
    this.apiService.getRecentActivity().subscribe({
      next: (activity: RecentActivityItem[]) => {
        // Filter for hotel-related activity
        const hotelActivity = activity.filter((item: RecentActivityItem) => 
          this.isRoomType(item.account_type)
        );
        this.recentActivity.set(hotelActivity);
        this.activityLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Failed to load activity:', error);
        this.activityLoading.set(false);
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

  goToCheckIn(): void {
    this.router.navigate(['/hotel/checkin']);
  }

  goToCheckOut(): void {
    this.router.navigate(['/hotel/checkout']);
  }

  getRoomIcon(accountType: string): string {
    if (accountType.includes('Standard')) return '🏨';
    if (accountType.includes('Deluxe')) return '🏩';
    if (accountType.includes('Suite')) return '🏰';
    if (accountType.includes('Presidential')) return '👑';
    return '🏨';
  }

  getRoomTypeDisplay(accountType: string): string {
    if (accountType.includes('Standard Room')) return 'Standard Room';
    if (accountType.includes('Deluxe Room')) return 'Deluxe Room';
    if (accountType.includes('Suite')) return 'Suite';
    if (accountType.includes('Presidential Suite')) return 'Presidential Suite';
    return accountType;
  }

  getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Checked Out',
      'rejected': 'Rejected'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatDate(dateStr: string | Date): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  }
}
