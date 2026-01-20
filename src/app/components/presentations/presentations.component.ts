import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BankService } from '../../services/bank.service';
import { ApiService, PresentationApiResponse } from '../../services/api.service';
import { PresentationDefinition } from '../../models/presentation.model';
import { QRCodeComponent } from 'angularx-qrcode';
import { catchError, of, map } from 'rxjs';

/**
 * Component for viewing and managing created presentation definitions (QR codes)
 */
@Component({
  selector: 'app-presentations',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  template: `
    <div class="presentations">
      <header class="page-header">
        <div class="header-content">
          <h1>QR Code Definitions</h1>
          <p>View and manage your presentation request QR codes</p>
        </div>
        <button class="primary-btn" (click)="navigateToAccountOpening()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create New
        </button>
      </header>
      
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading QR definitions...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h3>Error Loading Definitions</h3>
          <p>{{ error() }}</p>
          <button class="primary-btn" (click)="loadDefinitions()">Retry</button>
        </div>
      } @else if (definitions().length === 0) {
        <div class="empty-state">
          <div class="empty-illustration">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
            </svg>
          </div>
          <h3>No QR Definitions Yet</h3>
          <p>Create your first verification QR code by starting an account opening request.</p>
          <button class="primary-btn" (click)="navigateToAccountOpening()">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create First QR Code
          </button>
        </div>
      } @else {
        <div class="definitions-grid">
          @for (definition of definitions(); track definition.id) {
            <div 
              class="definition-card"
              [class.expired]="isExpired(definition)"
              (click)="selectDefinition(definition)">
              <div class="card-header">
                <h3>{{ definition.name }}</h3>
                @if (isExpired(definition)) {
                  <span class="expired-badge">Expired</span>
                } @else {
                  <span class="active-badge">Active</span>
                }
              </div>
              
              <div class="qr-display-section">
                <div class="qr-container">
                  @if (definition.qrCodeUrl) {
                    <img 
                      [src]="definition.qrCodeUrl" 
                      [alt]="'QR Code for ' + definition.name"
                      (error)="onQRImageError($event)"
                      class="qr-image"
                    />
                  } @else if (definition.qrCodeData) {
                    <qrcode 
                      [qrdata]="definition.qrCodeData"
                      [width]="280"
                      [errorCorrectionLevel]="'H'"
                      [colorDark]="'#000000'"
                      [colorLight]="'#ffffff'"
                      [margin]="2"
                    ></qrcode>
                  } @else {
                    <div class="qr-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
                      </svg>
                    </div>
                  }
                </div>
                <div class="qr-actions">
                  <button class="qr-action-btn copy-btn" (click)="copyQRCode(definition.qrCodeData || definition.qrCodeUrl || ''); $event.stopPropagation()" title="Copy QR Code">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy
                  </button>
                  <button class="qr-action-btn download-btn" (click)="downloadQRCode(definition); $event.stopPropagation()" title="Download QR Code">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <div class="info-row">
                  <span class="info-label">Account Type</span>
                  <span class="info-value">{{ getAccountTypeName(definition.accountType) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Document</span>
                  <span class="info-value">{{ getDocumentTypeName(definition.documentType) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ definition.createdAt | date:'short' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Expires</span>
                  <span class="info-value">{{ definition.expiresAt | date:'short' }}</span>
                </div>
              </div>
              
              <div class="card-footer">
                <span class="fields-count">
                  {{ getFieldsCount(definition) }} field{{ getFieldsCount(definition) !== 1 ? 's' : '' }} requested
                </span>
                <button class="view-btn">
                  View Details
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
      
      <!-- Detail Modal -->
      @if (selectedDefinition()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ selectedDefinition()?.name }}</h2>
              <button class="close-btn" (click)="closeModal()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              @if (detailLoading()) {
                <div class="detail-loading">
                  <div class="spinner"></div>
                  <p>Loading presentation details...</p>
                </div>
              } @else if (detailError()) {
                <div class="detail-error">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p>{{ detailError() }}</p>
                  <button class="primary-btn" (click)="loadDefinitionDetails(selectedDefinition()?.id || '')">Retry</button>
                </div>
              } @else {
              <div class="qr-section">
                <div class="qr-large">
                  @if (selectedDefinition()?.qrCodeUrl) {
                    <img 
                      [src]="selectedDefinition()!.qrCodeUrl" 
                      [alt]="'QR Code for ' + selectedDefinition()?.name"
                      (error)="onQRImageError($event)"
                      class="qr-image"
                    />
                  } @else if (selectedDefinition()?.qrCodeData) {
                    <qrcode 
                      [qrdata]="selectedDefinition()!.qrCodeData || ''"
                      [width]="320"
                      [errorCorrectionLevel]="'H'"
                      [colorDark]="'#000000'"
                      [colorLight]="'#ffffff'"
                      [margin]="2"
                    ></qrcode>
                  } @else {
                    <div class="qr-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
                      </svg>
                      <p>QR Code not available</p>
                    </div>
                  }
                </div>
                <p class="qr-instruction">Scan with holder's wallet application to request verification</p>
              </div>
              
              <div class="details-section">
                <div class="detail-group">
                  <h4>Request Information</h4>
                  <div class="detail-item">
                    <span class="label">Definition ID</span>
                    <span class="value mono">{{ selectedDefinition()?.id }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Account Type</span>
                    <span class="value">{{ getAccountTypeName(selectedDefinition()?.accountType) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Document</span>
                    <span class="value">{{ selectedDefinition()?.documentName || getDocumentTypeName(selectedDefinition()?.documentType) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Purpose</span>
                    <span class="value">{{ selectedDefinition()?.purpose }}</span>
                  </div>
                </div>
                
                <div class="detail-group">
                  <h4>Validity</h4>
                  <div class="detail-item">
                    <span class="label">Created At</span>
                    <span class="value">{{ selectedDefinition()?.createdAt | date:'medium' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Expires At</span>
                    <span class="value">{{ selectedDefinition()?.expiresAt | date:'medium' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Status</span>
                    @if (selectedDefinition()?.status === 'active' && !isExpired(selectedDefinition()!)) {
                      <span class="status-tag active">Active</span>
                    } @else {
                      <span class="status-tag expired">Expired</span>
                    }
                  </div>
                </div>
                
                <div class="detail-group">
                  <h4>Requested Fields</h4>
                  @if (selectedDefinition()?.requestedFields && selectedDefinition()!.requestedFields!.length > 0) {
                    <div class="requested-fields">
                      @for (field of selectedDefinition()!.requestedFields!; track field.field_id) {
                        <div class="field-tag">
                          <span class="field-name">{{ field.field_name }}</span>
                          @if (field.is_required) {
                            <span class="required-mark">*</span>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="no-fields">No fields requested</p>
                  }
                </div>
              </div>
              }
            </div>
            
            <div class="modal-footer">
              <button class="secondary-btn" (click)="copyToClipboard()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copy QR Data
              </button>
              <button class="primary-btn" (click)="closeModal()">Done</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .presentations {
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
    
    .primary-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }
    
    .primary-btn svg {
      width: 18px;
      height: 18px;
    }
    
    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 40px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
    }
    
    .empty-illustration {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 28px;
    }
    
    .empty-illustration svg {
      width: 50px;
      height: 50px;
      color: #667eea;
    }
    
    .empty-state h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 12px;
    }
    
    .empty-state p {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 32px;
      text-align: center;
      max-width: 400px;
    }
    
    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 40px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      gap: 20px;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(0, 212, 170, 0.2);
      border-top-color: #00d4aa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-state p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
    }
    
    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 40px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 71, 87, 0.2);
      border-radius: 20px;
      gap: 20px;
    }
    
    .error-state svg {
      width: 64px;
      height: 64px;
      color: #ff4757;
    }
    
    .error-state h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
    
    .error-state p {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      max-width: 400px;
      margin: 0;
    }
    
    /* Definitions Grid */
    .definitions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }
    
    .definition-card {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .definition-card:hover {
      border-color: rgba(0, 212, 170, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
    }
    
    .definition-card.expired {
      opacity: 0.7;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .card-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      line-height: 1.3;
    }
    
    .qr-display-section {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.01);
    }
    
    .qr-container {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .qr-container qrcode {
      display: block;
    }
    
    .qr-container qrcode ::ng-deep canvas,
    .qr-container qrcode ::ng-deep img {
      width: 100% !important;
      height: auto !important;
      max-width: 280px;
      display: block;
    }
    
    .qr-actions {
      display: flex;
      gap: 12px;
      width: 100%;
      justify-content: center;
    }
    
    .qr-action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
      border: none;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 212, 170, 0.3);
      flex: 1;
      max-width: 140px;
      justify-content: center;
    }
    
    .qr-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 170, 0.4);
    }
    
    .qr-action-btn:active {
      transform: translateY(0);
    }
    
    .qr-action-btn svg {
      width: 16px;
      height: 16px;
    }
    
    .definition-id {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      font-family: monospace;
    }
    
    .active-badge, .expired-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .active-badge {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .expired-badge {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    .card-body {
      padding: 20px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .info-value {
      font-size: 13px;
      color: #fff;
      font-weight: 500;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .fields-count {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .view-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: #00d4aa;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: gap 0.2s ease;
    }
    
    .view-btn:hover {
      gap: 10px;
    }
    
    .view-btn svg {
      width: 16px;
      height: 16px;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 40px;
      animation: fadeIn 0.2s ease;
    }
    
    .modal-content {
      background: linear-gradient(145deg, #1a1a24 0%, #14141c 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .modal-header h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
    }
    
    .close-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      border-radius: 10px;
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
      width: 20px;
      height: 20px;
    }
    
    .modal-body {
      display: flex;
      gap: 32px;
      padding: 28px;
      min-height: 400px;
    }
    
    .detail-loading,
    .detail-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 20px;
      padding: 40px;
    }
    
    .detail-loading .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 212, 170, 0.2);
      border-top-color: #00d4aa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .detail-loading p,
    .detail-error p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin: 0;
    }
    
    .detail-error svg {
      width: 48px;
      height: 48px;
      color: #ff4757;
    }
    
    .detail-error {
      text-align: center;
    }
    
    .qr-section {
      flex-shrink: 0;
      text-align: center;
    }
    
    .qr-large {
      background: #fff;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .qr-large qrcode {
      display: block;
    }
    
    .qr-large qrcode ::ng-deep canvas,
    .qr-large qrcode ::ng-deep img {
      width: 100% !important;
      height: auto !important;
      max-width: 320px;
      display: block;
    }
    
    .qr-image {
      width: 100%;
      max-width: 320px;
      height: auto;
      display: block;
      border-radius: 8px;
    }
    
    .qr-placeholder {
      width: 320px;
      height: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.3);
      gap: 12px;
    }
    
    .qr-placeholder svg {
      width: 64px;
      height: 64px;
    }
    
    .qr-placeholder p {
      font-size: 14px;
      margin: 0;
    }
    
    .no-fields {
      color: rgba(255, 255, 255, 0.4);
      font-size: 13px;
      font-style: italic;
    }
    
    .qr-instruction {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 16px;
      max-width: 200px;
    }
    
    .details-section {
      flex: 1;
    }
    
    .detail-group {
      margin-bottom: 28px;
    }
    
    .detail-group:last-child {
      margin-bottom: 0;
    }
    
    .detail-group h4 {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 14px;
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    .detail-item .label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .detail-item .value {
      font-size: 14px;
      color: #fff;
      font-weight: 500;
    }
    
    .detail-item .value.mono {
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
    }
    
    .status-tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-tag.active {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
    }
    
    .status-tag.expired {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    .requested-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .field-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px;
      background: rgba(102, 126, 234, 0.15);
      border-radius: 8px;
    }
    
    .field-tag .field-name {
      font-size: 13px;
      color: #667eea;
      font-weight: 500;
    }
    
    .field-tag .required-mark {
      color: #ff4757;
      font-weight: 600;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 28px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .secondary-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .secondary-btn svg {
      width: 16px;
      height: 16px;
    }
    
    @media (max-width: 768px) {
      .modal-body {
        flex-direction: column;
      }
      
      .definitions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PresentationsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  
  readonly selectedDefinition = signal<PresentationDefinition | null>(null);
  readonly definitions = signal<PresentationDefinition[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly detailLoading = signal<boolean>(false);
  readonly detailError = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadDefinitions();
  }
  
  loadDefinitions(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.apiService.getPresentations().pipe(
      map((apiPresentations: PresentationApiResponse[]) => {
        console.log('Received presentations from API:', apiPresentations);
        return apiPresentations.map((apiPres: PresentationApiResponse) => {
          const definition = this.mapApiResponseToDefinition(apiPres);
          console.log('Mapped definition:', definition);
          return definition;
        });
      }),
      catchError((err: unknown) => {
        console.error('Failed to load presentations:', err);
        this.error.set('Failed to load QR definitions. Please try again.');
        return of([]);
      })
    ).subscribe((definitions: PresentationDefinition[]) => {
      this.definitions.set(definitions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      this.loading.set(false);
    });
  }
  
  private mapApiResponseToDefinition(apiPres: PresentationApiResponse): PresentationDefinition {
    // Use definition_id from API response - this is the actual ID used in API endpoints
    // The API uses definition_id, not presentation_id
    let definitionId: string;
    
    // Check if definition_id exists and is valid (this is the primary field)
    if (apiPres.definition_id && 
        typeof apiPres.definition_id === 'string' && 
        apiPres.definition_id.trim() !== '' && 
        apiPres.definition_id !== 'undefined' &&
        apiPres.definition_id !== 'null') {
      definitionId = apiPres.definition_id.trim();
    } else if (apiPres.presentation_id && 
               typeof apiPres.presentation_id === 'string' && 
               apiPres.presentation_id.trim() !== '' && 
               apiPres.presentation_id !== 'undefined' &&
               apiPres.presentation_id !== 'null') {
      // Fallback to presentation_id if definition_id is not available
      definitionId = apiPres.presentation_id.trim();
      console.warn('definition_id not found, using presentation_id as fallback:', definitionId);
    } else if (apiPres.id) {
      // Last fallback to numeric id
      definitionId = String(apiPres.id);
      console.warn('Using numeric id as fallback:', apiPres.id);
    } else {
      console.error('No valid ID found in API response:', apiPres);
      definitionId = '';
    }
    
    console.log('Mapping API response to definition:', { 
      definition_id: apiPres.definition_id,
      presentation_id: apiPres.presentation_id, 
      id: apiPres.id, 
      mapped_definitionId: definitionId,
      fullResponse: apiPres
    });
    
    return {
      id: definitionId,
      name: `${apiPres.account_type} - Presentation ${apiPres.id || definitionId}`,
      purpose: `KYC verification for ${apiPres.account_type} account opening`,
      accountType: this.mapAccountTypeFromApi(apiPres.account_type),
      documentType: this.mapDocumentNameToType(apiPres.document_name || 'aadhar'),
      documentName: apiPres.document_name,
      createdAt: new Date(apiPres.created_at),
      expiresAt: new Date(apiPres.expires_at),
      status: apiPres.status,
      qrCodeData: apiPres.qr_code_data || '',
      qrCodeUrl: apiPres.qr_code_url || '',
      requestedFields: apiPres.requested_fields || [],
      input_descriptors: [] // Legacy field, not used with new API structure
    };
  }
  
  private mapDocumentNameToType(documentName: string): any {
    const nameLower = documentName.toLowerCase();
    if (nameLower.includes('aadhar') || nameLower.includes('aadhaar')) return 'aadhar';
    if (nameLower.includes('pan')) return 'pan';
    if (nameLower.includes('voter')) return 'voter_id';
    if (nameLower.includes('gov') || nameLower.includes('government')) return 'aadhar';
    return 'aadhar'; // Default
  }
  
  private mapAccountTypeFromApi(accountType: string): any {
    const typeMap: Record<string, any> = {
      'savings': 'savings',
      'current': 'current',
      'fixed_deposit': 'fixed_deposit',
      'recurring_deposit': 'recurring_deposit',
      'nri': 'nri',
      'salary': 'salary'
    };
    return typeMap[accountType.toLowerCase()] || 'savings';
  }
  
  navigateToAccountOpening(): void {
    this.router.navigate(['/account-opening']);
  }
  
  selectDefinition(definition: PresentationDefinition): void {
    this.selectedDefinition.set(definition);
    this.loadDefinitionDetails(definition.id);
  }
  
  loadDefinitionDetails(definitionId: string): void {
    // Validate definition ID before making API call
    if (!definitionId || definitionId.trim() === '' || definitionId === 'undefined' || definitionId.includes('undefined')) {
      console.error('Invalid definition ID:', definitionId);
      console.error('Current selected definition:', this.selectedDefinition());
      this.detailError.set('Invalid definition ID. Cannot load details.');
      this.detailLoading.set(false);
      return;
    }
    
    this.detailLoading.set(true);
    this.detailError.set(null);
    
    const cleanId = definitionId.trim();
    console.log('Loading presentation details for ID:', cleanId);
    
    this.apiService.getPresentationById(cleanId).pipe(
      map((apiPres: PresentationApiResponse) => this.mapApiResponseToDefinition(apiPres)),
      catchError((err: unknown) => {
        console.error('Failed to load presentation details:', err);
        this.detailError.set('Failed to load presentation details. Please try again.');
        return of(null);
      })
    ).subscribe((definition: PresentationDefinition | null) => {
      this.detailLoading.set(false);
      if (definition) {
        this.selectedDefinition.set(definition);
      }
    });
  }
  
  closeModal(): void {
    this.selectedDefinition.set(null);
  }
  
  isExpired(definition: PresentationDefinition): boolean {
    return new Date(definition.expiresAt).getTime() < Date.now();
  }
  
  truncateId(id: string): string {
    if (id.length <= 20) return id;
    return `${id.substring(0, 12)}...`;
  }
  
  getFieldsCount(definition: PresentationDefinition): number {
    // Use requestedFields from API if available
    if (definition.requestedFields && definition.requestedFields.length > 0) {
      return definition.requestedFields.length;
    }
    // Fallback to input_descriptors for legacy data
    return definition.input_descriptors.reduce(
      (count: number, descriptor) => count + descriptor.constraints.fields.length,
      0
    );
  }
  
  onQRImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('Failed to load QR code image:', img.src);
    // Could show a fallback or error message here
  }
  
  getAccountTypeName(type: string | undefined): string {
    if (!type) return '';
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
  
  getDocumentTypeName(type: string | undefined): string {
    if (!type) return '';
    const names: Record<string, string> = {
      'aadhar': 'Aadhar Card',
      'pan': 'PAN Card',
      'voter_id': 'Voter ID'
    };
    return names[type] || type;
  }
  
  copyToClipboard(): void {
    const definition = this.selectedDefinition();
    if (definition?.qrCodeData) {
      navigator.clipboard.writeText(definition.qrCodeData);
      // Could add a toast notification here
    }
  }
  
  copyQRCode(qrData: string): void {
    if (qrData) {
      navigator.clipboard.writeText(qrData);
      // Could add a toast notification here
    }
  }
  
  downloadQRCode(definition: PresentationDefinition): void {
    if (!definition.qrCodeData) return;
    
    // Find the QR code canvas or img element in the current card
    setTimeout(() => {
      const qrElements = document.querySelectorAll('qrcode canvas, qrcode img');
      let qrElement: HTMLCanvasElement | HTMLImageElement | null = null;
      
      // Try to find the QR code element for this specific definition
      for (let i = 0; i < qrElements.length; i++) {
        const element = qrElements[i];
        if (element instanceof HTMLCanvasElement || element instanceof HTMLImageElement) {
          qrElement = element;
          break;
        }
      }
      
      if (qrElement) {
        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          
          // Draw QR code
          if (qrElement instanceof HTMLCanvasElement) {
            ctx.drawImage(qrElement, 0, 0, size, size);
          } else if (qrElement instanceof HTMLImageElement) {
            ctx.drawImage(qrElement, 0, 0, size, size);
          }
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `qr-code-${definition.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      } else {
        // Fallback: download QR data as text
        if (definition.qrCodeData) {
          const blob = new Blob([definition.qrCodeData], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-code-${definition.name.replace(/\s+/g, '-')}-${Date.now()}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    }, 100);
  }
}
