import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankService } from '../../services/bank.service';
import { AccountType, AccountTypeConfig } from '../../models/account.model';
import { DocumentSubject, DocumentField } from '../../models/document.model';
import { QRCodeComponent } from 'angularx-qrcode';

/**
 * Account opening component with multi-step wizard
 * Step 1: Select Account Type
 * Step 2: Select Document Subject
 * Step 3: Select Required Fields
 * Step 4: Generate Presentation Definition & QR Code
 */
@Component({
  selector: 'app-account-opening',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  template: `
    <div class="account-opening">
      <header class="page-header">
        <div class="header-content">
          <h1>Account Opening</h1>
          <p>Create verification requests for new account applications</p>
        </div>
      </header>
      
      <!-- Progress Steps -->
      <div class="progress-bar">
        <div class="progress-step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
          <div class="step-number">1</div>
          <span class="step-label">Account Type</span>
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
      
      <!-- Step 1: Account Type Selection -->
      @if (currentStep() === 1) {
        <section class="step-content">
          <h2>Select Account Type</h2>
          <p class="step-description">Choose the type of bank account the customer wants to open</p>
          
          <div class="account-types-grid">
            @for (account of accountTypes; track account.type) {
              <button 
                class="account-card"
                [class.selected]="selectedAccountType() === account.type"
                (click)="selectAccountType(account.type)">
                <div class="account-icon" [style.background]="getAccountGradient(account.type)">
                  @switch (account.type) {
                    @case ('savings') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                    }
                    @case ('current') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>
                    }
                    @case ('fixed_deposit') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    }
                    @case ('recurring_deposit') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                    }
                    @case ('nri') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                    }
                    @case ('salary') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/></svg>
                    }
                  }
                </div>
                <div class="account-info">
                  <h3>{{ account.name }}</h3>
                  <p>{{ account.description }}</p>
                </div>
                <div class="account-details">
                  <span class="detail">
                    <strong>Min Balance:</strong> ₹{{ account.minBalance | number }}
                  </span>
                  <span class="detail">
                    <strong>Interest:</strong> {{ account.interestRate }}
                  </span>
                </div>
                @if (selectedAccountType() === account.type) {
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
            <button class="secondary-btn" (click)="resetWorkflow()">Cancel</button>
            <button 
              class="primary-btn" 
              [disabled]="!selectedAccountType()"
              (click)="nextStep()">
              Continue
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </section>
      }
      
      <!-- Step 2: Document Selection -->
      @if (currentStep() === 2) {
        <section class="step-content">
          <h2>Select Document for Verification</h2>
          <p class="step-description">Choose the KYC document to request from the customer</p>
          
          @if (subjectsLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading document types...</p>
            </div>
          }
          
          @if (subjectsError()) {
            <div class="error-banner">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>{{ subjectsError() }}</span>
            </div>
          }
          
          <div class="documents-grid">
            @for (doc of documentSubjects(); track doc.id) {
              <button 
                class="document-card"
                [class.selected]="selectedDocument()?.id === doc.id"
                [style.--accent-color]="doc.color"
                (click)="selectDocument(doc)">
                <div class="document-icon" [style.background]="doc.color + '20'" [style.color]="doc.color">
                  @switch (doc.type) {
                    @case ('aadhar') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/></svg>
                    }
                    @case ('pan') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                    }
                    @case ('voter_id') {
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-2.12-2.12-1.41 1.41 3.53 3.54L18.41 9.4l-1.41-1.45zM11.95 3L4 6.03V12h2.69L12 6.68 17.31 12H20V6.03L11.95 3z"/></svg>
                    }
                  }
                </div>
                <div class="document-info">
                  <h3>{{ doc.name }}</h3>
                  <p>{{ doc.description }}</p>
                  @if (doc.did) {
                    <span class="document-did" [title]="doc.did">{{ doc.did }}</span>
                  }
                  <span class="field-count">{{ doc.fields.length }} fields available</span>
                </div>
                @if (selectedDocument()?.id === doc.id) {
                  <div class="selected-badge" [style.background]="doc.color">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                }
              </button>
            }
          </div>
          
          <div class="step-actions">
            <button class="secondary-btn" (click)="prevStep()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              Back
            </button>
            <button 
              class="primary-btn" 
              [disabled]="!selectedDocument()"
              (click)="nextStep()">
              Continue
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </section>
      }
      
      <!-- Step 3: Field Selection -->
      @if (currentStep() === 3) {
        <section class="step-content">
          <h2>Select Required Fields</h2>
          <p class="step-description">Enable the fields you need from the customer's {{ selectedDocument()?.name }}</p>
          
          @if (subjectsLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading fields...</p>
            </div>
          } @else {
          <div class="fields-container">
            <div class="fields-header">
              <div class="document-preview" [style.--accent-color]="selectedDocument()?.color" [style.color]="selectedDocument()?.color">
                @switch (selectedDocument()?.type) {
                  @case ('aadhar') {
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/></svg>
                  }
                  @case ('pan') {
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  }
                  @case ('voter_id') {
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-2.12-2.12-1.41 1.41 3.53 3.54L18.41 9.4l-1.41-1.45zM11.95 3L4 6.03V12h2.69L12 6.68 17.31 12H20V6.03L11.95 3z"/></svg>
                  }
                }
                <span>{{ selectedDocument()?.name }}</span>
              </div>
              <div class="selection-info">
                <span class="count">{{ enabledFieldsCount() }} fields selected</span>
              </div>
            </div>
            
            <div class="fields-grid">
              @for (field of selectedDocument()?.fields; track field.id) {
                <div 
                  class="field-card"
                  [class.enabled]="field.enabled"
                  [class.required]="field.required"
                  (click)="toggleField(field.id)">
                  <div class="field-checkbox">
                    @if (field.enabled) {
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    }
                  </div>
                  <div class="field-info">
                    <span class="field-name">
                      {{ field.name }}
                      @if (field.required) {
                        <span class="required-badge">Required</span>
                      }
                    </span>
                    <span class="field-desc">{{ field.description }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
          }
          
          <div class="step-actions">
            <button class="secondary-btn" (click)="prevStep()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              Back
            </button>
            <button 
              class="primary-btn" 
              [disabled]="enabledFieldsCount() === 0 || subjectsLoading()"
              (click)="nextStep()">
              Generate QR Code
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </section>
      }
      
      <!-- Step 4: QR Code Generation -->
      @if (currentStep() === 4) {
        <section class="step-content">
          <h2>Presentation Definition Created</h2>
          <p class="step-description">Scan this QR code with the holder's wallet application</p>
          
          @if (presentationLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Generating QR Code...</p>
            </div>
          } @else if (presentationError()) {
            <div class="error-banner">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>{{ presentationError() }}</span>
            </div>
          } @else {
          <div class="qr-container">
            <div class="qr-wrapper">
              <div class="qr-frame">
                @if (apiPresentationResponse()?.qr_code_url) {
                  <img [src]="apiPresentationResponse()?.qr_code_url" alt="QR Code" class="qr-image" />
                } @else if (presentationDefinition()) {
                  <qrcode 
                    [qrdata]="presentationDefinition()?.qrCodeData || ''"
                    [width]="280"
                    [errorCorrectionLevel]="'M'"
                    [colorDark]="'#000000'"
                    [colorLight]="'#ffffff'"
                  ></qrcode>
                }
              </div>
              <div class="qr-label">
                <span class="label-title">Verification Request</span>
                <span class="label-id">ID: {{ apiPresentationResponse()?.presentation_id || presentationDefinition()?.id }}</span>
              </div>
            </div>
            
            <div class="definition-summary">
              <h3>Request Summary</h3>
              
              <div class="summary-item">
                <span class="summary-label">Account Type</span>
                <span class="summary-value">{{ getAccountTypeName(presentationDefinition()?.accountType) }}</span>
              </div>
              
              <div class="summary-item">
                <span class="summary-label">Document</span>
                <span class="summary-value">{{ getDocumentTypeName(presentationDefinition()?.documentType) }}</span>
              </div>
              
              <div class="summary-item">
                <span class="summary-label">Created</span>
                <span class="summary-value">{{ apiPresentationResponse()?.created_at || (presentationDefinition()?.createdAt | date:'medium') }}</span>
              </div>
              
              <div class="summary-item">
                <span class="summary-label">Expires</span>
                <span class="summary-value">{{ apiPresentationResponse()?.expires_at || (presentationDefinition()?.expiresAt | date:'medium') }}</span>
              </div>

              @if (apiPresentationResponse()?.status) {
                <div class="summary-item">
                  <span class="summary-label">Status</span>
                  <span class="summary-value status-badge">{{ apiPresentationResponse()?.status }}</span>
                </div>
              }
              
              <div class="requested-fields">
                <h4>Requested Fields</h4>
                <div class="field-tags">
                  @for (descriptor of presentationDefinition()?.input_descriptors; track descriptor.id) {
                    @for (field of descriptor.constraints.fields; track field.fieldId) {
                      <span class="field-tag">{{ field.fieldName }}</span>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
          }
          
          <div class="step-actions">
            <button class="secondary-btn" (click)="resetWorkflow()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Close
            </button>
            <button class="primary-btn" (click)="createAnother()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create Another
            </button>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .account-opening {
      animation: fadeIn 0.4s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .page-header {
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
    
    /* Progress Bar */
    .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 48px;
      padding: 0 20%;
    }
    
    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }
    
    .progress-step.active .step-number {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      border-color: #00d4aa;
      color: #0a0a0f;
    }
    
    .progress-step.completed .step-number {
      background: #00d4aa;
      border-color: #00d4aa;
      color: #0a0a0f;
    }
    
    .step-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.3s ease;
    }
    
    .progress-step.active .step-label {
      color: #00d4aa;
    }
    
    .progress-line {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 16px;
      margin-bottom: 24px;
      transition: background 0.3s ease;
    }
    
    .progress-line.active {
      background: linear-gradient(90deg, #00d4aa 0%, #00a085 100%);
    }
    
    /* Step Content */
    .step-content {
      background: linear-gradient(145deg, #16161f 0%, #12121a 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      padding: 40px;
    }
    
    .step-content h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .step-description {
      color: rgba(255, 255, 255, 0.5);
      font-size: 15px;
      margin-bottom: 32px;
    }

    /* Loading State */
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

    /* Error Banner */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 107, 53, 0.1);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .error-banner svg {
      width: 20px;
      height: 20px;
      color: #ff6b35;
      flex-shrink: 0;
    }

    .error-banner span {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
    
    /* Account Types Grid */
    .account-types-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .account-card {
      background: rgba(255, 255, 255, 0.02);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .account-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .account-card.selected {
      background: rgba(0, 212, 170, 0.08);
      border-color: #00d4aa;
    }
    
    .account-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: #00d4aa;
    }
    
    .account-icon svg {
      width: 26px;
      height: 26px;
    }
    
    .account-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
    }
    
    .account-info p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .account-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .account-details .detail {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .account-details .detail strong {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .selected-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      background: #00d4aa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0a0a0f;
    }
    
    .selected-badge svg {
      width: 16px;
      height: 16px;
    }
    
    /* Documents Grid */
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .document-card {
      background: rgba(255, 255, 255, 0.02);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .document-card:hover {
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-2px);
    }
    
    .document-card.selected {
      border-color: var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 8%, transparent);
    }
    
    .document-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .document-icon svg {
      width: 30px;
      height: 30px;
    }
    
    .document-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .document-info p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .document-did {
      display: block;
      font-size: 11px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: rgba(0, 212, 170, 0.7);
      background: rgba(0, 212, 170, 0.08);
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      cursor: help;
    }

    .field-count {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.06);
      padding: 4px 10px;
      border-radius: 20px;
    }
    
    /* Fields Section */
    .fields-container {
      margin-bottom: 40px;
    }
    
    .fields-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
    }
    
    .document-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 16px;
    }
    
    .document-preview svg {
      width: 24px;
      height: 24px;
    }
    
    .selection-info .count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .field-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .field-card:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    
    .field-card.enabled {
      background: rgba(0, 212, 170, 0.08);
      border-color: rgba(0, 212, 170, 0.4);
    }
    
    .field-checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .field-card.enabled .field-checkbox {
      background: #00d4aa;
      border-color: #00d4aa;
      color: #0a0a0f;
    }
    
    .field-checkbox svg {
      width: 16px;
      height: 16px;
    }
    
    .field-info {
      display: flex;
      flex-direction: column;
    }
    
    .field-name {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .required-badge {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    
    .field-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 4px;
    }
    
    /* QR Code Section */
    .qr-container {
      display: flex;
      gap: 48px;
      margin-bottom: 40px;
    }
    
    .qr-wrapper {
      flex-shrink: 0;
    }
    
    .qr-frame {
      background: #fff;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .qr-image {
      width: 280px;
      height: 280px;
      display: block;
    }

    .status-badge {
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .qr-label {
      text-align: center;
      margin-top: 16px;
    }
    
    .label-title {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    
    .label-id {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 4px;
      font-family: monospace;
    }
    
    .definition-summary {
      flex: 1;
    }
    
    .definition-summary h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 24px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .summary-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .summary-value {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    
    .requested-fields {
      margin-top: 24px;
    }
    
    .requested-fields h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 12px;
    }
    
    .field-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .field-tag {
      font-size: 12px;
      padding: 6px 12px;
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
      border-radius: 20px;
    }
    
    /* Step Actions */
    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .primary-btn, .secondary-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    
    .primary-btn {
      background: linear-gradient(135deg, #00d4aa 0%, #00a085 100%);
      color: #0a0a0f;
    }
    
    .primary-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
    }
    
    .primary-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .secondary-btn {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .primary-btn svg, .secondary-btn svg {
      width: 18px;
      height: 18px;
    }
    
    @media (max-width: 1200px) {
      .account-types-grid,
      .documents-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .qr-container {
        flex-direction: column;
        align-items: center;
      }
    }
    
    @media (max-width: 768px) {
      .account-types-grid,
      .documents-grid,
      .fields-grid {
        grid-template-columns: 1fr;
      }
      
      .progress-bar {
        padding: 0 10%;
      }
    }
  `]
})
export class AccountOpeningComponent {
  private readonly bankService = inject(BankService);
  private readonly router = inject(Router);
  
  readonly currentStep = signal<number>(1);
  readonly presentationDefinition = signal<any>(null);
  
  readonly accountTypes: AccountTypeConfig[] = this.bankService.getAccountTypes();
  readonly documentSubjects = this.bankService.documentSubjects;
  readonly subjectsLoading = this.bankService.subjectsLoading;
  readonly subjectsError = this.bankService.subjectsError;
  readonly presentationLoading = this.bankService.presentationLoading;
  readonly presentationError = this.bankService.presentationError;
  readonly apiPresentationResponse = this.bankService.apiPresentationResponse;
  
  readonly selectedAccountType = this.bankService.selectedAccountType;
  readonly selectedDocument = this.bankService.selectedDocument;

  constructor() {
    // Fetch document subjects from API on component init
    this.bankService.fetchDocumentSubjects();
  }
  
  readonly enabledFieldsCount = computed(() => {
    const doc = this.selectedDocument();
    if (!doc) return 0;
    return doc.fields.filter((f: DocumentField) => f.enabled).length;
  });
  
  selectAccountType(type: AccountType): void {
    this.bankService.selectAccountType(type);
  }
  
  selectDocument(doc: DocumentSubject): void {
    this.bankService.selectDocument(doc);
  }
  
  toggleField(fieldId: string): void {
    this.bankService.toggleField(fieldId);
  }
  
  nextStep(): void {
    const step = this.currentStep();
    
    // When moving from step 2 to step 3, fetch fields for selected subject
    if (step === 2) {
      const selectedDoc = this.selectedDocument();
      if (selectedDoc?.id) {
        this.bankService.fetchSubjectFields(selectedDoc.id);
      }
    }
    
    if (step === 3) {
      this.generatePresentationDefinition();
    }
    
    this.currentStep.update((s: number) => Math.min(s + 1, 4));
  }
  
  prevStep(): void {
    this.currentStep.update((step: number) => Math.max(step - 1, 1));
  }
  
  private generatePresentationDefinition(): void {
    const accountType = this.selectedAccountType();
    const document = this.selectedDocument();
    
    if (!accountType || !document) return;
    
    // Call API to create presentation
    this.bankService.createPresentationViaApi();
    
    // Also create local definition for display
    const definition = this.bankService.createPresentationDefinition(
      `${this.getAccountTypeName(accountType)} - ${document.name} Verification`,
      `Verification request for opening a ${this.getAccountTypeName(accountType).toLowerCase()}`
    );
    
    this.presentationDefinition.set(definition);
  }
  
  resetWorkflow(): void {
    this.bankService.resetWorkflow();
    this.bankService.clearPresentationResponse();
    this.currentStep.set(1);
    this.presentationDefinition.set(null);
    this.router.navigate(['/dashboard']);
  }
  
  createAnother(): void {
    this.bankService.resetWorkflow();
    this.bankService.clearPresentationResponse();
    this.currentStep.set(1);
    this.presentationDefinition.set(null);
  }
  
  getAccountGradient(type: AccountType): string {
    const gradients: Record<AccountType, string> = {
      [AccountType.SAVINGS]: 'linear-gradient(135deg, rgba(0, 212, 170, 0.2) 0%, rgba(0, 160, 133, 0.1) 100%)',
      [AccountType.CURRENT]: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)',
      [AccountType.FIXED_DEPOSIT]: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
      [AccountType.RECURRING_DEPOSIT]: 'linear-gradient(135deg, rgba(46, 134, 171, 0.2) 0%, rgba(30, 100, 140, 0.1) 100%)',
      [AccountType.NRI]: 'linear-gradient(135deg, rgba(123, 45, 142, 0.2) 0%, rgba(90, 30, 110, 0.1) 100%)',
      [AccountType.SALARY]: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(200, 80, 40, 0.1) 100%)'
    };
    return gradients[type] || gradients[AccountType.SAVINGS];
  }
  
  getAccountTypeName(type: AccountType | undefined): string {
    if (!type) return '';
    const names: Record<AccountType, string> = {
      [AccountType.SAVINGS]: 'Savings Account',
      [AccountType.CURRENT]: 'Current Account',
      [AccountType.FIXED_DEPOSIT]: 'Fixed Deposit',
      [AccountType.RECURRING_DEPOSIT]: 'Recurring Deposit',
      [AccountType.NRI]: 'NRI Account',
      [AccountType.SALARY]: 'Salary Account'
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
}
