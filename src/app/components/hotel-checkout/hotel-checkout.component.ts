import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SubmissionApiResponse, SubmissionListParams } from '../../services/api.service';
import { CheckInStatus } from '../../models/hotel.model';

/**
 * Component for viewing and managing hotel check-out submissions
 * Reuses the same API as submissions but with hotel-specific UI
 */
@Component({
  selector: 'app-hotel-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hotel-checkout">
      <header class="page-header">
        <div class="header-content">
          <h1>Hotel Check-Out</h1>
          <p>Review and manage guest check-out requests</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill pending">
            <span class="stat-count">{{ pendingCount }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-pill checked-out">
            <span class="stat-count">{{ checkedOutCount }}</span>
            <span class="stat-label">Checked Out</span>
          </div>
        </div>
      </header>
      
      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-tabs">
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'all'"
            (click)="setFilter('all')">
            All Requests
          </button>
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'pending'"
            (click)="setFilter('pending')">
            Pending Check-Out
            @if (pendingCount > 0) {
              <span class="tab-badge">{{ pendingCount }}</span>
            }
          </button>
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'checked_out'"
            (click)="setFilter('checked_out')">
            Checked Out
          </button>
        </div>
        
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name or room type..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()">
        </div>
      </div>
      
      <!-- Submissions List -->
      <div class="submissions-container">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading check-out requests...</p>
          </div>
        } @else {
        <div class="submissions-list">
          @for (submission of submissions(); track submission.request_id) {
            <div 
              class="submission-card"
              [class.selected]="selectedSubmission()?.request_id === submission.request_id"
              [class.pending]="submission.status.toLowerCase() === 'pending'"
              [class.checked-out]="submission.status.toLowerCase() === 'approved'"
              (click)="selectSubmission(submission)">
              <div class="submission-status-bar"></div>
              
              <div class="submission-header">
                <div class="room-avatar">
                  {{ getRoomIcon(submission.account_type) }}
                </div>
                <div class="guest-info">
                  <span class="guest-name">{{ submission.document_name }}</span>
                  <span class="room-type">{{ getRoomTypeDisplay(submission.account_type) }}</span>
                  <span class="guest-did">{{ truncateDid(submission.holder_did || 'N/A') }}</span>
                </div>
                <span class="status-badge" [class]="submission.status.toLowerCase()">
                  {{ getStatusDisplay(submission.status) }}
                </span>
                @if (submission.status.toLowerCase() === 'pending') {
                  <div class="quick-actions">
                    <button 
                      class="action-icon-btn checkout"
                      title="Approve Check-Out"
                      [disabled]="actionLoading()"
                      (click)="approveCheckout(submission.request_id, $event)">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
              
              <div class="submission-details">
                <div class="detail-row">
                  <span class="detail-label">Request ID:</span>
                  <span class="detail-value">{{ truncateId(submission.request_id) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-In:</span>
                  <span class="detail-value">{{ formatDate(submission.created_at) }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3>No check-out requests found</h3>
              <p>There are no check-out requests matching your current filters.</p>
            </div>
          }
        </div>
        }
        
        <!-- Detail Panel -->
        @if (selectedSubmission()) {
          <div class="detail-panel">
            <div class="panel-header">
              <h3>Check-Out Details</h3>
              <button class="close-btn" (click)="clearSelection()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div class="panel-content">
              @if (detailLoading()) {
                <div class="detail-loading">
                  <div class="spinner"></div>
                  <p>Loading details...</p>
                </div>
              } @else {
              <!-- Request Information -->
              <section class="panel-section">
                <h4>Request Information</h4>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <span class="info-label">Request ID</span>
                    <span class="info-value mono">{{ selectedSubmission()?.request_id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Room Type</span>
                    <span class="info-value">{{ getRoomTypeDisplay(selectedSubmission()?.account_type || '') }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Document</span>
                    <span class="info-value">{{ selectedSubmission()?.document_name }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">Holder DID</span>
                    <span class="info-value mono">{{ selectedSubmission()?.holder_did || 'N/A' }}</span>
                  </div>
                </div>
              </section>
              
              <!-- Guest Data -->
              @if (selectedSubmission()?.submission_json) {
                <section class="panel-section">
                  <h4>Guest Information</h4>
                  <div class="submitted-fields">
                    @for (entry of getSubmissionDataEntries(selectedSubmission()?.submission_json); track entry.key) {
                      <div class="field-item">
                        <span class="field-label">{{ entry.key }}</span>
                        @if (isImageUrl(entry.value)) {
                          <div class="field-image-container">
                            <img 
                              [src]="entry.value" 
                              [alt]="entry.key"
                              class="field-image"
                              (error)="onImageError($event)"
                              loading="lazy">
                          </div>
                        } @else {
                          <span class="field-value">{{ entry.value }}</span>
                        }
                      </div>
                    }
                  </div>
                </section>
              }
              
              <!-- Check-Out Info -->
              <section class="panel-section">
                <h4>Check-Out Info</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="status-badge large" [class]="selectedSubmission()?.status?.toLowerCase()">
                      {{ getStatusDisplay(selectedSubmission()?.status || '') }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Check-In Date</span>
                    <span class="info-value">{{ selectedSubmission()?.created_at | date:'medium' }}</span>
                  </div>
                  @if (selectedSubmission()?.completed_at) {
                    <div class="info-item full-width">
                      <span class="info-label">Check-Out Date</span>
                      <span class="info-value">{{ selectedSubmission()?.completed_at | date:'medium' }}</span>
                    </div>
                  }
                </div>
              </section>
              
              <!-- Action Buttons -->
              @if (selectedSubmission()?.status?.toLowerCase() === 'pending') {
                <section class="panel-section actions-section">
                  <h4>Check-Out Actions</h4>
                  <div class="review-form">
                    <div class="action-buttons">
                      <button class="checkout-btn" [disabled]="actionLoading()" (click)="approveCheckout()">
                        @if (actionLoading()) {
                          <div class="btn-spinner"></div>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        }
                        Approve Check-Out
                      </button>
                    </div>
                  </div>
                </section>
              }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hotel-checkout {
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
      margin-bottom: 32px;
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
    
    .header-stats {
      display: flex;
      gap: 16px;
    }
    
    .stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .stat-pill.pending {
      border-color: rgba(255, 193, 7, 0.3);
    }
    
    .stat-pill.checked-out {
      border-color: rgba(0, 212, 170, 0.3);
    }
    
    .stat-count {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
    }
    
    .stat-pill.pending .stat-count { color: #ffc107; }
    .stat-pill.checked-out .stat-count { color: #00d4aa; }
    
    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* Filters Bar - Same as submissions */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 20px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
    }
    
    .filter-tabs {
      display: flex;
      gap: 8px;
    }
    
    .filter-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .filter-tab:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
    }
    
    .filter-tab.active {
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }
    
    .tab-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      background: #ff4757;
      color: white;
      border-radius: 10px;
    }
    
    .search-box {
      position: relative;
    }
    
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .search-box input {
      width: 280px;
      padding: 12px 16px 12px 42px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      font-size: 14px;
      color: #fff;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .search-box input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    
    .search-box input:focus {
      border-color: rgba(102, 126, 234, 0.4);
      background: rgba(255, 255, 255, 0.06);
    }
    
    /* Submissions Container */
    .submissions-container {
      display: flex;
      gap: 24px;
    }
    
    .submissions-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .submission-card {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .submission-card:hover {
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }
    
    .submission-card.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
    
    .submission-status-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }
    
    .submission-card.pending .submission-status-bar {
      background: linear-gradient(180deg, #ffc107 0%, #ff9800 100%);
    }
    
    .submission-card.checked-out .submission-status-bar {
      background: linear-gradient(180deg, #00d4aa 0%, #00a085 100%);
    }
    
    .submission-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    
    .room-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .guest-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .guest-name {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    
    .room-type {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      margin: 2px 0;
    }
    
    .guest-did {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      font-family: monospace;
    }
    
    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-badge.pending {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    
    .status-badge.checked_out, .status-badge.approved {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .status-badge.large {
      padding: 8px 16px;
      font-size: 13px;
    }
    
    .submission-details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 14px;
    }
    
    .detail-row {
      display: flex;
      gap: 6px;
    }
    
    .detail-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .detail-value {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
    
    /* Quick Action Icon Buttons */
    .quick-actions {
      display: flex;
      gap: 8px;
      margin-left: 12px;
    }
    
    .action-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-icon-btn svg {
      width: 18px;
      height: 18px;
    }
    
    .action-icon-btn.checkout {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
      border: 1px solid rgba(0, 212, 170, 0.3);
    }
    
    .action-icon-btn.checkout:hover:not(:disabled) {
      background: #00d4aa;
      color: #0a0a0f;
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(0, 212, 170, 0.4);
    }
    
    .action-icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
    }
    
    .empty-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .empty-icon svg {
      width: 32px;
      height: 32px;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .empty-state p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    /* Detail Panel - Same as submissions */
    .detail-panel {
      width: 420px;
      flex-shrink: 0;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
      height: fit-content;
      position: sticky;
      top: 32px;
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .panel-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
    
    .close-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    
    .close-btn svg {
      width: 18px;
      height: 18px;
    }
    
    .panel-content {
      padding: 24px;
    }
    
    .panel-section {
      margin-bottom: 28px;
    }
    
    .panel-section:last-child {
      margin-bottom: 0;
    }
    
    .panel-section h4 {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .info-item.full-width {
      grid-column: span 2;
    }
    
    .info-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .info-value {
      font-size: 14px;
      color: #fff;
      font-weight: 500;
    }
    
    .info-value.mono {
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
    }
    
    .submitted-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .field-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
    }
    
    .field-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .field-value {
      font-size: 14px;
      color: #fff;
      font-weight: 500;
      word-break: break-word;
    }
    
    .field-image-container {
      margin-top: 8px;
      display: flex;
      justify-content: flex-start;
    }
    
    .field-image {
      max-width: 200px;
      max-height: 200px;
      width: auto;
      height: auto;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      object-fit: contain;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .field-image:hover {
      transform: scale(1.05);
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    /* Actions Section */
    .actions-section {
      background: rgba(255, 255, 255, 0.02);
      margin: 0 -24px -24px;
      padding: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .checkout-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
    }
    
    .checkout-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }
    
    .checkout-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .checkout-btn svg {
      width: 18px;
      height: 18px;
    }
    
    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Loading State */
    .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      gap: 16px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-state p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }
    
    .detail-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }
    
    .detail-loading .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
    }
    
    .detail-loading p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
    }
    
    @media (max-width: 1200px) {
      .submissions-container {
        flex-direction: column;
      }
      
      .detail-panel {
        width: 100%;
        position: static;
      }
    }
    
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 20px;
      }
      
      .header-stats {
        width: 100%;
        justify-content: space-between;
      }
      
      .filters-bar {
        flex-direction: column;
        gap: 16px;
      }
      
      .filter-tabs {
        flex-wrap: wrap;
      }
      
      .search-box {
        width: 100%;
      }
      
      .search-box input {
        width: 100%;
      }
    }
  `]
})
export class HotelCheckoutComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  
  readonly activeFilter = signal<'all' | 'pending' | 'checked_out'>('all');
  readonly selectedSubmission = signal<SubmissionApiResponse | null>(null);
  readonly submissions = signal<SubmissionApiResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly actionLoading = signal<boolean>(false);
  readonly detailLoading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  
  searchQuery: string = '';
  
  // Counts for each status
  pendingCount: number = 0;
  checkedOutCount: number = 0;

  ngOnInit(): void {
    this.loadSubmissions();
  }

  /**
   * Loads submissions from API with current filters
   */
  loadSubmissions(): void {
    this.loading.set(true);
    
    const params: SubmissionListParams = {
      limit: 100,
      offset: 0
    };
    
    const filter = this.activeFilter();
    if (filter !== 'all') {
      // Map hotel-specific filters to API status
      if (filter === 'checked_out') {
        params.status = 'approved';
      } else {
        params.status = filter;
      }
    }
    
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    this.apiService.getSubmissions(params).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        // Filter for hotel-related submissions (check account_type for room types)
        const hotelSubmissions = response.data.filter((sub: SubmissionApiResponse) => 
          this.isRoomType(sub.account_type)
        );
        this.submissions.set(hotelSubmissions);
        this.totalCount.set(hotelSubmissions.length);
        this.loading.set(false);
        this.updateCounts();
      },
      error: (error: Error) => {
        console.error('Failed to load submissions:', error);
        this.loading.set(false);
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
   * Updates status counts
   */
  private updateCounts(): void {
    // Get pending count
    this.apiService.getSubmissions({ status: 'pending', limit: 1 }).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        const hotelPending = response.data.filter((sub: SubmissionApiResponse) => 
          this.isRoomType(sub.account_type)
        );
        this.pendingCount = hotelPending.length > 0 ? response.total : 0;
      }
    });
    
    // Get checked out count
    this.apiService.getSubmissions({ status: 'approved', limit: 1 }).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        const hotelApproved = response.data.filter((sub: SubmissionApiResponse) => 
          this.isRoomType(sub.account_type)
        );
        this.checkedOutCount = hotelApproved.length > 0 ? response.total : 0;
      }
    });
  }
  
  setFilter(filter: 'all' | 'pending' | 'checked_out'): void {
    this.activeFilter.set(filter);
    this.loadSubmissions();
  }
  
  onSearchChange(): void {
    this.loadSubmissions();
  }
  
  /**
   * Selects a submission and fetches its full details from the API
   */
  selectSubmission(submission: SubmissionApiResponse): void {
    this.selectedSubmission.set(submission);
    
    this.detailLoading.set(true);
    this.apiService.getSubmissionById(submission.request_id).subscribe({
      next: (fullSubmission: SubmissionApiResponse) => {
        this.selectedSubmission.set(fullSubmission);
        this.detailLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Failed to load submission details:', error);
        this.detailLoading.set(false);
      }
    });
  }
  
  clearSelection(): void {
    this.selectedSubmission.set(null);
  }
  
  approveCheckout(requestId?: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const submission = requestId ? null : this.selectedSubmission();
    const id = requestId || submission?.request_id;
    
    if (!id) return;
    
    this.actionLoading.set(true);
    this.apiService.updateSubmissionStatus(id, 'approved').subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubmissions();
        this.clearSelection();
      },
      error: (error: Error) => {
        console.error('Failed to approve check-out:', error);
        this.actionLoading.set(false);
      }
    });
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
      'pending': 'Pending Check-Out',
      'approved': 'Checked Out',
      'rejected': 'Rejected'
    };
    return statusMap[status.toLowerCase()] || status;
  }
  
  truncateDid(did: string): string {
    if (!did || did.length <= 30) return did || 'N/A';
    return `${did.substring(0, 20)}...${did.substring(did.length - 8)}`;
  }

  truncateId(id: string): string {
    if (!id || id.length <= 20) return id || 'N/A';
    return `${id.substring(0, 8)}...${id.substring(id.length - 6)}`;
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

  /**
   * Converts submission_json to array of key-value pairs for display
   * Handles nested objects by flattening them
   */
  getSubmissionDataEntries(data: Record<string, unknown> | null | undefined): Array<{ key: string; value: string }> {
    if (!data) return [];
    
    const flattenObject = (obj: Record<string, unknown>, prefix: string = ''): Array<{ key: string; value: string }> => {
      const entries: Array<{ key: string; value: string }> = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value === null || value === undefined) {
          entries.push({ key: newKey, value: 'N/A' });
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          entries.push(...flattenObject(value as Record<string, unknown>, newKey));
        } else if (Array.isArray(value)) {
          entries.push({ key: newKey, value: JSON.stringify(value) });
        } else {
          entries.push({ key: newKey, value: String(value) });
        }
      }
      
      return entries;
    };
    
    return flattenObject(data);
  }

  /**
   * Checks if a string value is an image URL
   */
  isImageUrl(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    
    try {
      const url = new URL(value);
      const pathname = url.pathname.toLowerCase();
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
      return imageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Handles image loading errors
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
