import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService } from '../../services/bank.service';
import { ApiService, SubmissionApiResponse, SubmissionListParams } from '../../services/api.service';
import { PresentationSubmission, SubmissionStatus } from '../../models/presentation.model';

/**
 * Component for viewing and managing presentation submissions
 * Includes filtering, detail view, and approval/rejection workflow
 */
@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="submissions">
      <header class="page-header">
        <div class="header-content">
          <h1>Presentation Submissions</h1>
          <p>Review and manage verification submissions from holder wallets</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill pending">
            <span class="stat-count">{{ pendingCount }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-pill approved">
            <span class="stat-count">{{ approvedCount }}</span>
            <span class="stat-label">Approved</span>
          </div>
          <div class="stat-pill rejected">
            <span class="stat-count">{{ rejectedCount }}</span>
            <span class="stat-label">Rejected</span>
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
            All Submissions
          </button>
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'pending'"
            (click)="setFilter('pending')">
            Pending Review
            @if (pendingCount > 0) {
              <span class="tab-badge">{{ pendingCount }}</span>
            }
          </button>
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'approved'"
            (click)="setFilter('approved')">
            Approved
          </button>
          <button 
            class="filter-tab"
            [class.active]="activeFilter() === 'rejected'"
            (click)="setFilter('rejected')">
            Rejected
          </button>
        </div>
        
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name or document..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()">
        </div>
      </div>
      
      <!-- Submissions List -->
      <div class="submissions-container">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading submissions...</p>
          </div>
        } @else {
        <div class="submissions-list">
          @for (submission of submissions(); track submission.request_id) {
            <div 
              class="submission-card"
              [class.selected]="selectedSubmission()?.request_id === submission.request_id"
              [class.pending]="submission.status.toLowerCase() === 'pending'"
              [class.approved]="submission.status.toLowerCase() === 'approved'"
              [class.rejected]="submission.status.toLowerCase() === 'rejected'"
              (click)="selectSubmission(submission)">
              <div class="submission-status-bar"></div>
              
              <div class="submission-header">
                <div class="holder-avatar">
                  {{ getInitials(submission.document_name) }}
                </div>
                <div class="holder-info">
                  <span class="holder-name">{{ submission.document_name }}</span>
                  <span class="holder-did">{{ truncateDid(submission.holder_did || 'N/A') }}</span>
                </div>
                <span class="status-badge" [class]="submission.status.toLowerCase()">
                  {{ submission.status | titlecase }}
                </span>
                @if (submission.status.toLowerCase() === 'pending') {
                  <div class="quick-actions">
                    <button 
                      class="action-icon-btn reject"
                      title="Reject"
                      [disabled]="actionLoading()"
                      (click)="rejectSubmissionById(submission.request_id, $event)">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                    <button 
                      class="action-icon-btn approve"
                      title="Approve"
                      [disabled]="actionLoading()"
                      (click)="approveSubmissionById(submission.request_id, $event)">
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
                  <span class="detail-label">Account Type:</span>
                  <span class="detail-value">{{ getAccountName(submission.account_type) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Submitted:</span>
                  <span class="detail-value">{{ formatDate(submission.created_at) }}</span>
                </div>
              </div>
              
              <div class="submission-fields-preview">
                <span class="field-chip">{{ submission.definition_id }}</span>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3>No submissions found</h3>
              <p>There are no submissions matching your current filters.</p>
            </div>
          }
        </div>
        }
        
        <!-- Detail Panel -->
        @if (selectedSubmission()) {
          <div class="detail-panel">
            <div class="panel-header">
              <h3>Submission Details</h3>
              <button class="close-btn" (click)="clearSelection()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div class="panel-content">
              <!-- Request Information -->
              <section class="panel-section">
                <h4>Request Information</h4>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <span class="info-label">Request ID</span>
                    <span class="info-value mono">{{ selectedSubmission()?.request_id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Document</span>
                    <span class="info-value">{{ selectedSubmission()?.document_name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Account Type</span>
                    <span class="info-value">{{ getAccountName(selectedSubmission()?.account_type || '') }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">Holder DID</span>
                    <span class="info-value mono">{{ selectedSubmission()?.holder_did || 'N/A' }}</span>
                  </div>
                </div>
              </section>
              
              <!-- Submitted Data -->
              @if (selectedSubmission()?.submission_json) {
                <section class="panel-section">
                  <h4>Submitted Data</h4>
                  <div class="submitted-fields">
                    @for (entry of getSubmissionDataEntries(selectedSubmission()?.submission_json); track entry.key) {
                      <div class="field-item">
                        <span class="field-label">{{ entry.key }}</span>
                        <span class="field-value">{{ entry.value }}</span>
                      </div>
                    }
                  </div>
                </section>
              }
              
              <!-- Submission Info -->
              <section class="panel-section">
                <h4>Submission Info</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="status-badge large" [class]="selectedSubmission()?.status?.toLowerCase()">
                      {{ selectedSubmission()?.status | titlecase }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Submitted At</span>
                    <span class="info-value">{{ selectedSubmission()?.created_at | date:'medium' }}</span>
                  </div>
                  @if (selectedSubmission()?.completed_at) {
                    <div class="info-item full-width">
                      <span class="info-label">Completed At</span>
                      <span class="info-value">{{ selectedSubmission()?.completed_at | date:'medium' }}</span>
                    </div>
                  }
                </div>
              </section>
              
              <!-- Action Buttons -->
              @if (selectedSubmission()?.status?.toLowerCase() === 'pending') {
                <section class="panel-section actions-section">
                  <h4>Review Actions</h4>
                  <div class="review-form">
                    <div class="action-buttons">
                      <button class="reject-btn" [disabled]="actionLoading()" (click)="rejectSubmission()">
                        @if (actionLoading()) {
                          <div class="btn-spinner"></div>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        }
                        Reject
                      </button>
                      <button class="approve-btn" [disabled]="actionLoading()" (click)="approveSubmission()">
                        @if (actionLoading()) {
                          <div class="btn-spinner"></div>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        }
                        Approve
                      </button>
                    </div>
                  </div>
                </section>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .submissions {
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
    
    .stat-pill.approved {
      border-color: rgba(0, 212, 170, 0.3);
    }
    
    .stat-pill.rejected {
      border-color: rgba(255, 71, 87, 0.3);
    }
    
    .stat-count {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
    }
    
    .stat-pill.pending .stat-count { color: #ffc107; }
    .stat-pill.approved .stat-count { color: #00d4aa; }
    .stat-pill.rejected .stat-count { color: #ff4757; }
    
    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* Filters Bar */
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
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
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
      border-color: rgba(0, 212, 170, 0.4);
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
      border-color: #00d4aa;
      background: rgba(0, 212, 170, 0.05);
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
    
    .submission-card.approved .submission-status-bar {
      background: linear-gradient(180deg, #00d4aa 0%, #00a085 100%);
    }
    
    .submission-card.rejected .submission-status-bar {
      background: linear-gradient(180deg, #ff4757 0%, #c0392b 100%);
    }
    
    .submission-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    
    .holder-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      color: white;
    }
    
    .holder-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .holder-name {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    
    .holder-did {
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
    
    .status-badge.approved {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .status-badge.rejected {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
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
    
    .submission-fields-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .field-chip {
      font-size: 11px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.6);
      border-radius: 6px;
    }
    
    .field-chip.more {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
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

    .action-icon-btn.approve {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
      border: 1px solid rgba(0, 212, 170, 0.3);
    }

    .action-icon-btn.approve:hover:not(:disabled) {
      background: #00d4aa;
      color: #0a0a0f;
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(0, 212, 170, 0.4);
    }

    .action-icon-btn.reject {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
      border: 1px solid rgba(255, 71, 87, 0.3);
    }

    .action-icon-btn.reject:hover:not(:disabled) {
      background: #ff4757;
      color: #fff;
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
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
    
    /* Detail Panel */
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
    }
    
    .review-comments {
      margin-top: 16px;
    }
    
    .comments-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-top: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
    }
    
    /* Actions Section */
    .actions-section {
      background: rgba(255, 255, 255, 0.02);
      margin: 0 -24px -24px;
      padding: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .review-form textarea {
      width: 100%;
      padding: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      font-size: 14px;
      color: #fff;
      resize: none;
      outline: none;
      font-family: inherit;
      margin-bottom: 16px;
    }
    
    .review-form textarea::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    
    .review-form textarea:focus {
      border-color: rgba(0, 212, 170, 0.4);
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .approve-btn, .reject-btn {
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
    }
    
    .approve-btn {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
    }
    
    .approve-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }
    
    .reject-btn {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
      border: 1px solid rgba(255, 71, 87, 0.3);
    }
    
    .reject-btn:hover {
      background: rgba(255, 71, 87, 0.25);
    }
    
    .approve-btn svg, .reject-btn svg {
      width: 18px;
      height: 18px;
    }

    .approve-btn:disabled, .reject-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
      border: 3px solid rgba(0, 212, 170, 0.2);
      border-top-color: #00d4aa;
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
export class SubmissionsComponent implements OnInit {
  private readonly bankService = inject(BankService);
  private readonly apiService = inject(ApiService);
  
  readonly activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  readonly selectedSubmission = signal<SubmissionApiResponse | null>(null);
  readonly submissions = signal<SubmissionApiResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly actionLoading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  
  searchQuery: string = '';
  
  // Counts for each status
  pendingCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;

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
      params.status = filter;
    }
    
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    this.apiService.getSubmissions(params).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        this.submissions.set(response.data);
        this.totalCount.set(response.total);
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
   * Updates status counts by making separate API calls
   */
  private updateCounts(): void {
    // Get pending count
    this.apiService.getSubmissions({ status: 'pending', limit: 1 }).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        this.pendingCount = response.total;
      }
    });
    
    // Get approved count
    this.apiService.getSubmissions({ status: 'approved', limit: 1 }).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        this.approvedCount = response.total;
      }
    });
    
    // Get rejected count
    this.apiService.getSubmissions({ status: 'rejected', limit: 1 }).subscribe({
      next: (response: { data: SubmissionApiResponse[]; total: number }) => {
        this.rejectedCount = response.total;
      }
    });
  }
  
  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter.set(filter);
    this.loadSubmissions();
  }
  
  onSearchChange(): void {
    this.loadSubmissions();
  }
  
  selectSubmission(submission: SubmissionApiResponse): void {
    this.selectedSubmission.set(submission);
  }
  
  clearSelection(): void {
    this.selectedSubmission.set(null);
  }
  
  approveSubmission(): void {
    const submission = this.selectedSubmission();
    if (!submission) return;
    this.approveSubmissionById(submission.request_id);
  }
  
  rejectSubmission(): void {
    const submission = this.selectedSubmission();
    if (!submission) return;
    this.rejectSubmissionById(submission.request_id);
  }

  /**
   * Approves a submission by request ID
   * @param requestId - The submission request ID
   * @param event - Optional click event to stop propagation
   */
  approveSubmissionById(requestId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.actionLoading.set(true);
    this.apiService.updateSubmissionStatus(requestId, 'approved').subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubmissions();
        this.clearSelection();
      },
      error: (error: Error) => {
        console.error('Failed to approve submission:', error);
        this.actionLoading.set(false);
      }
    });
  }

  /**
   * Rejects a submission by request ID
   * @param requestId - The submission request ID
   * @param event - Optional click event to stop propagation
   */
  rejectSubmissionById(requestId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.actionLoading.set(true);
    this.apiService.updateSubmissionStatus(requestId, 'rejected').subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubmissions();
        this.clearSelection();
      },
      error: (error: Error) => {
        console.error('Failed to reject submission:', error);
        this.actionLoading.set(false);
      }
    });
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  
  truncateDid(did: string): string {
    if (!did || did.length <= 30) return did || 'N/A';
    return `${did.substring(0, 20)}...${did.substring(did.length - 8)}`;
  }

  truncateId(id: string): string {
    if (!id || id.length <= 20) return id || 'N/A';
    return `${id.substring(0, 8)}...${id.substring(id.length - 6)}`;
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

  /**
   * Converts submission_json to array of key-value pairs for display
   */
  getSubmissionDataEntries(data: Record<string, unknown> | null | undefined): Array<{ key: string; value: string }> {
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({
      key: key,
      value: String(value)
    }));
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
