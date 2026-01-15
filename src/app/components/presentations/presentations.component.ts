import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BankService } from '../../services/bank.service';
import { PresentationDefinition } from '../../models/presentation.model';
import { QRCodeComponent } from 'angularx-qrcode';

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
      
      @if (definitions.length === 0) {
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
          @for (definition of definitions; track definition.id) {
            <div 
              class="definition-card"
              [class.expired]="isExpired(definition)"
              (click)="selectDefinition(definition)">
              <div class="card-header">
                <div class="qr-mini">
                  <qrcode 
                    [qrdata]="definition.qrCodeData || ''"
                    [width]="80"
                    [errorCorrectionLevel]="'M'"
                    [colorDark]="'#000000'"
                    [colorLight]="'#ffffff'"
                  ></qrcode>
                </div>
                <div class="definition-info">
                  <h3>{{ definition.name }}</h3>
                  <span class="definition-id">ID: {{ truncateId(definition.id) }}</span>
                </div>
                @if (isExpired(definition)) {
                  <span class="expired-badge">Expired</span>
                } @else {
                  <span class="active-badge">Active</span>
                }
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
                  {{ getFieldsCount(definition) }} fields requested
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
              <div class="qr-section">
                <div class="qr-large">
                  <qrcode 
                    [qrdata]="selectedDefinition()?.qrCodeData || ''"
                    [width]="240"
                    [errorCorrectionLevel]="'M'"
                    [colorDark]="'#000000'"
                    [colorLight]="'#ffffff'"
                  ></qrcode>
                </div>
                <p class="qr-instruction">Scan with holder's wallet application to request verification</p>
              </div>
              
              <div class="details-section">
                <div class="detail-group">
                  <h4>Request Information</h4>
                  <div class="detail-item">
                    <span class="label">Purpose</span>
                    <span class="value">{{ selectedDefinition()?.purpose }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Definition ID</span>
                    <span class="value mono">{{ selectedDefinition()?.id }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Account Type</span>
                    <span class="value">{{ getAccountTypeName(selectedDefinition()?.accountType) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Document Type</span>
                    <span class="value">{{ getDocumentTypeName(selectedDefinition()?.documentType) }}</span>
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
                    @if (isExpired(selectedDefinition()!)) {
                      <span class="status-tag expired">Expired</span>
                    } @else {
                      <span class="status-tag active">Active</span>
                    }
                  </div>
                </div>
                
                <div class="detail-group">
                  <h4>Requested Fields</h4>
                  <div class="requested-fields">
                    @for (descriptor of selectedDefinition()?.input_descriptors; track descriptor.id) {
                      @for (field of descriptor.constraints.fields; track field.fieldId) {
                        <div class="field-tag">
                          <span class="field-name">{{ field.fieldName }}</span>
                          @if (field.required) {
                            <span class="required-mark">*</span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
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
    
    /* Definitions Grid */
    .definitions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }
    
    .definition-card {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
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
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .qr-mini {
      width: 80px;
      height: 80px;
      background: #fff;
      border-radius: 10px;
      padding: 6px;
      flex-shrink: 0;
    }
    
    .definition-info {
      flex: 1;
    }
    
    .definition-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
      line-height: 1.3;
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
    }
    
    .qr-section {
      flex-shrink: 0;
      text-align: center;
    }
    
    .qr-large {
      background: #fff;
      padding: 16px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
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
export class PresentationsComponent {
  private readonly bankService = inject(BankService);
  private readonly router = inject(Router);
  
  readonly selectedDefinition = signal<PresentationDefinition | null>(null);
  
  get definitions(): PresentationDefinition[] {
    return this.bankService.getPresentationDefinitions()
      .sort((a: PresentationDefinition, b: PresentationDefinition) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  navigateToAccountOpening(): void {
    this.router.navigate(['/account-opening']);
  }
  
  selectDefinition(definition: PresentationDefinition): void {
    this.selectedDefinition.set(definition);
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
    return definition.input_descriptors.reduce(
      (count: number, descriptor) => count + descriptor.constraints.fields.length,
      0
    );
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
}
