import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { RoomType } from '../../models/hotel.model';
import { DocumentSubject, DocumentField } from '../../models/document.model';
import { QRCodeComponent } from 'angularx-qrcode';

/**
 * Hotel check-in component with multi-step wizard
 * Step 1: Select Room Type
 * Step 2: Select Document Subject
 * Step 3: Select Required Fields
 * Step 4: Generate Presentation Definition & QR Code
 */
@Component({
  selector: 'app-hotel-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  template: `
    <div class="hotel-checkin">
      <header class="page-header">
        <div class="header-content">
          <h1>Hotel Check-In</h1>
          <p>Create verification requests for guest check-in</p>
        </div>
      </header>
      
      <!-- Progress Steps -->
      <div class="progress-bar">
        <div class="progress-step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
          <div class="step-number">1</div>
          <span class="step-label">Room Type</span>
        </div>
        <div class="progress-line" [class.active]="currentStep() > 1"></div>
        <div class="progress-step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2">
          <div class="step-number">2</div>
          <span class="step-label">Document</span>
        </div>
        <div class="progress-line" [class.active]="currentStep() > 2"></div>
        <div class="progress-step" [class.active]="currentStep() >= 3" [class.completed]="currentStep() > 3">
          <div class="step-number">3</div>
          <span class="step-label">Fields</span>
        </div>
        <div class="progress-line" [class.active]="currentStep() > 3"></div>
        <div class="progress-step" [class.active]="currentStep() >= 4">
          <div class="step-number">4</div>
          <span class="step-label">QR Code</span>
        </div>
      </div>
      
      <!-- Step 1: Room Type Selection -->
      @if (currentStep() === 1) {
        <section class="step-content">
          <h2>Select Room Type</h2>
          <p class="step-description">Choose the type of room for guest check-in</p>
          
          <div class="room-types-grid">
            @for (room of hotelService.roomTypes; track room.type) {
              <button 
                class="room-card"
                [class.selected]="hotelService.selectedRoomType()?.type === room.type"
                (click)="selectRoomType(room)">
                <div class="room-icon" [style.background]="getRoomGradient(room.type)">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
                <div class="room-info">
                  <h3>{{ room.name }}</h3>
                  <p>{{ room.description }}</p>
                </div>
                <div class="room-details">
                  <span class="detail">
                    <strong>Price:</strong> ₹{{ room.pricePerNight | number }}/night
                  </span>
                  <span class="detail">
                    <strong>Max Guests:</strong> {{ room.maxGuests }}
                  </span>
                </div>
                <div class="room-amenities">
                  @for (amenity of room.amenities; track amenity) {
                    <span class="amenity-tag">{{ amenity }}</span>
                  }
                </div>
                @if (hotelService.selectedRoomType()?.type === room.type) {
                  <div class="selected-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                }
              </button>
            }
          </div>
          
          <div class="step-actions">
            <button 
              class="btn-primary"
              [disabled]="!hotelService.selectedRoomType()"
              (click)="nextStep()">
              Next: Select Document
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </div>
        </section>
      }
      
      <!-- Step 2: Document Selection -->
      @if (currentStep() === 2) {
        <section class="step-content">
          <h2>Select Document Type</h2>
          <p class="step-description">Choose the identity document for verification</p>
          
          @if (hotelService.subjectsLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading document types...</p>
            </div>
          } @else if (hotelService.subjectsError()) {
            <div class="error-state">
              <p>{{ hotelService.subjectsError() }}</p>
            </div>
          } @else {
            <div class="documents-grid">
              @for (doc of hotelService.documentSubjects(); track doc.id) {
                <button 
                  class="document-card"
                  [class.selected]="hotelService.selectedDocument()?.id === doc.id"
                  (click)="selectDocument(doc)">
                  <div class="document-icon" [style.background-color]="doc.color">
                    @switch (getDocumentIconType(doc.name)) {
                      @case ('fingerprint') {
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>
                        </svg>
                      }
                      @case ('credit_card') {
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                      }
                      @default {
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      }
                    }
                  </div>
                  <div class="document-info">
                    <h3>{{ doc.name }}</h3>
                    <p>{{ doc.description }}</p>
                    @if (doc.did) {
                      <span class="document-did">DID: {{ truncateDid(doc.did) }}</span>
                    }
                  </div>
                  @if (hotelService.selectedDocument()?.id === doc.id) {
                    <div class="selected-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  }
                </button>
              }
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" (click)="previousStep()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
                </svg>
                Back
              </button>
              <button 
                class="btn-primary"
                [disabled]="!hotelService.selectedDocument()"
                (click)="nextStep()">
                Next: Select Fields
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
          }
        </section>
      }
      
      <!-- Step 3: Field Selection -->
      @if (currentStep() === 3) {
        <section class="step-content">
          <h2>Select Required Fields</h2>
          <p class="step-description">Choose which fields to request from the guest</p>
          
          <div class="fields-list">
            @for (field of hotelService.selectedFields(); track field.id) {
              <div class="field-item" [class.required]="field.required">
                <label class="field-checkbox">
                  <input 
                    type="checkbox"
                    [checked]="field.enabled"
                    [disabled]="field.required"
                    (change)="toggleField(field.id)">
                  <span class="checkmark"></span>
                  <div class="field-info">
                    <span class="field-name">{{ field.name }}</span>
                    @if (field.description) {
                      <span class="field-description">{{ field.description }}</span>
                    }
                    @if (field.required) {
                      <span class="required-badge">Required</span>
                    }
                  </div>
                </label>
              </div>
            }
          </div>
          
          <div class="step-actions">
            <button class="btn-secondary" (click)="previousStep()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
              </svg>
              Back
            </button>
            <button 
              class="btn-primary"
              [disabled]="getEnabledFieldsCount() === 0"
              (click)="nextStep()">
              Next: Generate QR Code
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </div>
        </section>
      }
      
      <!-- Step 4: QR Code Generation -->
      @if (currentStep() === 4) {
        <section class="step-content">
          <h2>Check-In QR Code</h2>
          <p class="step-description">Scan this QR code to complete guest verification</p>
          
          @if (hotelService.presentationLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Generating QR code...</p>
            </div>
          } @else if (hotelService.presentationError()) {
            <div class="error-state">
              <p>{{ hotelService.presentationError() }}</p>
              <button class="btn-primary" (click)="generateQRCode()">Try Again</button>
            </div>
          } @else if (hotelService.apiPresentationResponse()?.qr_code_url) {
            <div class="qr-container">
              <div class="qr-code-wrapper">
                <qrcode 
                  [qrdata]="hotelService.apiPresentationResponse()?.qr_code_url || ''"
                  [width]="300"
                  [errorCorrectionLevel]="'M'"
                  [elementType]="'svg'">
                </qrcode>
              </div>
              <div class="qr-info">
                <p class="qr-url">{{ hotelService.apiPresentationResponse()?.qr_code_url }}</p>
                <button class="btn-secondary" (click)="copyQRUrl()">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  Copy URL
                </button>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" (click)="resetFlow()">Create New Check-In</button>
              <button class="btn-primary" (click)="goToCheckOut()">
                View Check-Outs
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
          } @else {
            <div class="step-actions">
              <button class="btn-primary" (click)="generateQRCode()">Generate QR Code</button>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .hotel-checkin {
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
      font-size: 32px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .page-header p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 15px;
    }
    
    /* Progress Bar - Same as account-opening */
    .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 48px;
      padding: 24px;
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
    }
    
    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    
    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 2px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .progress-step.active .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
      color: #fff;
    }
    
    .progress-step.completed .step-number {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      border-color: #00d4aa;
      color: #fff;
    }
    
    .step-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 500;
    }
    
    .progress-step.active .step-label {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .progress-line {
      width: 80px;
      height: 2px;
      background: rgba(255, 255, 255, 0.06);
      margin: 0 16px;
      transition: all 0.3s ease;
    }
    
    .progress-line.active {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Step Content */
    .step-content {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 32px;
    }
    
    .step-content h2 {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .step-description {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      margin-bottom: 32px;
    }
    
    /* Room Types Grid */
    .room-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .room-card {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }
    
    .room-card:hover {
      border-color: rgba(102, 126, 234, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    }
    
    .room-card.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    .room-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .room-icon svg {
      width: 32px;
      height: 32px;
      color: #fff;
    }
    
    .room-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .room-info p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 16px;
    }
    
    .room-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .detail {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .room-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    
    .amenity-tag {
      font-size: 11px;
      padding: 4px 10px;
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
      border-radius: 12px;
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    .selected-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .selected-badge svg {
      width: 18px;
      height: 18px;
      color: #fff;
    }
    
    /* Documents Grid - Same as account-opening */
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .document-card {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }
    
    .document-card:hover {
      border-color: rgba(102, 126, 234, 0.4);
      transform: translateY(-4px);
    }
    
    .document-card.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    .document-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .document-icon svg {
      width: 28px;
      height: 28px;
      color: #fff;
    }
    
    .document-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .document-info p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
    }
    
    .document-did {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      font-family: monospace;
    }
    
    /* Fields List */
    .fields-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }
    
    .field-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s ease;
    }
    
    .field-item.required {
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    .field-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    
    .field-checkbox input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    
    .field-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .field-name {
      font-size: 15px;
      font-weight: 500;
      color: #fff;
    }
    
    .field-description {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .required-badge {
      font-size: 11px;
      padding: 2px 8px;
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
      border-radius: 8px;
      width: fit-content;
    }
    
    /* QR Code Container */
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      margin-bottom: 32px;
    }
    
    .qr-code-wrapper {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
    }
    
    .qr-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .qr-url {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-family: monospace;
      word-break: break-all;
      text-align: center;
      max-width: 400px;
    }
    
    /* Buttons */
    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }
    
    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .btn-primary svg, .btn-secondary svg {
      width: 18px;
      height: 18px;
    }
    
    /* Loading & Error States */
    .loading-state, .error-state {
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
      border: 3px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-state p {
      color: #ff4757;
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .room-types-grid, .documents-grid {
        grid-template-columns: 1fr;
      }
      
      .progress-bar {
        flex-wrap: wrap;
      }
      
      .progress-line {
        display: none;
      }
    }
  `]
})
export class HotelCheckinComponent implements OnInit {
  readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  
  readonly currentStep = signal<number>(1);
  
  ngOnInit(): void {
    this.hotelService.fetchDocumentSubjects();
  }
  
  selectRoomType(room: RoomType): void {
    this.hotelService.selectRoomType(room);
  }
  
  selectDocument(doc: DocumentSubject): void {
    this.hotelService.selectDocument(doc);
  }
  
  toggleField(fieldId: string): void {
    this.hotelService.toggleField(fieldId);
  }
  
  getEnabledFieldsCount(): number {
    return this.hotelService.getEnabledFields().length;
  }
  
  nextStep(): void {
    if (this.currentStep() === 3) {
      this.generateQRCode();
    } else {
      this.currentStep.set(this.currentStep() + 1);
    }
  }
  
  previousStep(): void {
    this.currentStep.set(this.currentStep() - 1);
  }
  
  generateQRCode(): void {
    this.hotelService.createPresentationViaApi();
    this.currentStep.set(4);
  }
  
  copyQRUrl(): void {
    const url = this.hotelService.apiPresentationResponse()?.qr_code_url;
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }
  
  resetFlow(): void {
    this.hotelService.reset();
    this.currentStep.set(1);
  }
  
  goToCheckOut(): void {
    this.router.navigate(['/hotel/checkout']);
  }
  
  getRoomGradient(type: string): string {
    const gradients: Record<string, string> = {
      'standard': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'deluxe': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'suite': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'presidential': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[type] || gradients['standard'];
  }
  
  truncateDid(did: string): string {
    if (!did || did.length <= 30) return did || 'N/A';
    return `${did.substring(0, 20)}...${did.substring(did.length - 8)}`;
  }

  /**
   * Gets the icon type for a document based on its name from API response
   */
  getDocumentIconType(docName: string): string {
    const name = docName.toLowerCase();
    
    // Check for fingerprint icon types (Gov ID, Aadhar, etc.)
    if (name.includes('gov') || name.includes('aadhar') || name.includes('aadhaar') || 
        name.includes('voter') || name.includes('national id') || name.includes('identity')) {
      return 'fingerprint';
    }
    
    // Check for credit card icon types (Driving License, PAN, etc.)
    if (name.includes('driving') || name.includes('license') || name.includes('pan') || 
        name.includes('credit') || name.includes('card') || name.includes('permit')) {
      return 'credit_card';
    }
    
    // Default fallback
    return 'default';
  }
}
