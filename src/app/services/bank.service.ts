import { Injectable, signal, computed } from '@angular/core';
import { AccountType, AccountTypeConfig, ACCOUNT_TYPES } from '../models/account.model';
import { DocumentType, DocumentSubject, DocumentField, DOCUMENT_SUBJECTS } from '../models/document.model';
import {
  PresentationDefinition,
  PresentationSubmission,
  SubmissionStatus,
  InputDescriptor,
  FieldConstraint,
  QRCodePayload
} from '../models/presentation.model';

/**
 * Service for managing bank operations, document verification,
 * and presentation definition/submission workflows
 */
@Injectable({
  providedIn: 'root'
})
export class BankService {
  // Signals for reactive state management
  private _selectedAccountType = signal<AccountType | null>(null);
  private _selectedDocument = signal<DocumentSubject | null>(null);
  private _presentationDefinitions = signal<PresentationDefinition[]>([]);
  private _submissions = signal<PresentationSubmission[]>([]);

  // Computed values
  readonly selectedAccountType = this._selectedAccountType.asReadonly();
  readonly selectedDocument = this._selectedDocument.asReadonly();
  readonly presentationDefinitions = this._presentationDefinitions.asReadonly();
  readonly submissions = this._submissions.asReadonly();

  // Computed: Get pending submissions count
  readonly pendingSubmissionsCount = computed(() => 
    this._submissions().filter((s: PresentationSubmission) => s.status === SubmissionStatus.PENDING).length
  );

  constructor() {
    this.loadMockSubmissions();
  }

  /**
   * Returns all available account types
   */
  getAccountTypes(): AccountTypeConfig[] {
    return ACCOUNT_TYPES;
  }

  /**
   * Returns all document subjects with fresh field states
   */
  getDocumentSubjects(): DocumentSubject[] {
    return DOCUMENT_SUBJECTS.map((doc: DocumentSubject) => ({
      ...doc,
      fields: doc.fields.map((field: DocumentField) => ({ ...field, enabled: false }))
    }));
  }

  /**
   * Sets the selected account type
   */
  selectAccountType(type: AccountType): void {
    this._selectedAccountType.set(type);
    this._selectedDocument.set(null);
  }

  /**
   * Selects a document subject and resets field states
   */
  selectDocument(document: DocumentSubject): void {
    const freshDocument: DocumentSubject = {
      ...document,
      fields: document.fields.map((field: DocumentField) => ({ ...field, enabled: false }))
    };
    this._selectedDocument.set(freshDocument);
  }

  /**
   * Toggles a field's enabled state in the selected document
   */
  toggleField(fieldId: string): void {
    const current = this._selectedDocument();
    if (!current) return;

    const updatedFields = current.fields.map((field: DocumentField) =>
      field.id === fieldId ? { ...field, enabled: !field.enabled } : field
    );

    this._selectedDocument.set({ ...current, fields: updatedFields });
  }

  /**
   * Gets enabled fields from the selected document
   */
  getEnabledFields(): DocumentField[] {
    const doc = this._selectedDocument();
    if (!doc) return [];
    return doc.fields.filter((field: DocumentField) => field.enabled);
  }

  /**
   * Creates a presentation definition from selected document and fields
   */
  createPresentationDefinition(name: string, purpose: string): PresentationDefinition {
    const accountType = this._selectedAccountType();
    const document = this._selectedDocument();

    if (!accountType || !document) {
      throw new Error('Account type and document must be selected');
    }

    const enabledFields = this.getEnabledFields();
    if (enabledFields.length === 0) {
      throw new Error('At least one field must be enabled');
    }

    const fieldConstraints: FieldConstraint[] = enabledFields.map((field: DocumentField) => ({
      fieldId: field.id,
      fieldName: field.name,
      required: field.required
    }));

    const inputDescriptor: InputDescriptor = {
      id: `${document.type}_descriptor`,
      name: document.name,
      purpose: `Verification of ${document.name} for ${name}`,
      constraints: {
        fields: fieldConstraints
      }
    };

    const definition: PresentationDefinition = {
      id: this.generateId(),
      name: name,
      purpose: purpose,
      accountType: accountType,
      documentType: document.type,
      format: {
        jwt: { alg: ['ES256', 'ES384'] },
        ldp_vc: { proof_type: ['Ed25519Signature2018'] }
      },
      input_descriptors: [inputDescriptor],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const qrPayload = this.generateQRPayload(definition);
    definition.qrCodeData = JSON.stringify(qrPayload);

    this._presentationDefinitions.update((defs: PresentationDefinition[]) => [...defs, definition]);

    return definition;
  }

  /**
   * Generates QR code payload for presentation request
   */
  private generateQRPayload(definition: PresentationDefinition): QRCodePayload {
    return {
      type: 'presentation_request',
      definitionId: definition.id,
      callbackUrl: 'https://bank.example.com/api/presentations/submit',
      challenge: this.generateId(),
      domain: 'bank.example.com',
      presentationDefinition: definition
    };
  }

  /**
   * Gets all presentation definitions
   */
  getPresentationDefinitions(): PresentationDefinition[] {
    return this._presentationDefinitions();
  }

  /**
   * Gets a specific presentation definition by ID
   */
  getPresentationDefinitionById(id: string): PresentationDefinition | undefined {
    return this._presentationDefinitions().find((d: PresentationDefinition) => d.id === id);
  }

  /**
   * Gets all submissions
   */
  getSubmissions(): PresentationSubmission[] {
    return this._submissions();
  }

  /**
   * Gets submissions filtered by status
   */
  getSubmissionsByStatus(status: SubmissionStatus): PresentationSubmission[] {
    return this._submissions().filter((s: PresentationSubmission) => s.status === status);
  }

  /**
   * Approves a submission
   */
  approveSubmission(submissionId: string, reviewedBy: string, comments: string): void {
    this._submissions.update((subs: PresentationSubmission[]) =>
      subs.map((sub: PresentationSubmission) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: SubmissionStatus.APPROVED,
              reviewedAt: new Date(),
              reviewedBy: reviewedBy,
              comments: comments
            }
          : sub
      )
    );
  }

  /**
   * Rejects a submission
   */
  rejectSubmission(submissionId: string, reviewedBy: string, comments: string): void {
    this._submissions.update((subs: PresentationSubmission[]) =>
      subs.map((sub: PresentationSubmission) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: SubmissionStatus.REJECTED,
              reviewedAt: new Date(),
              reviewedBy: reviewedBy,
              comments: comments
            }
          : sub
      )
    );
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Loads mock submissions for demonstration
   */
  private loadMockSubmissions(): void {
    const mockSubmissions: PresentationSubmission[] = [
      {
        id: 'sub-001',
        definitionId: 'def-001',
        holderDid: 'did:example:holder123',
        holderName: 'Rajesh Kumar',
        documentType: DocumentType.AADHAR,
        accountType: AccountType.SAVINGS,
        submittedFields: [
          { fieldId: 'aadhar_full_name', fieldName: 'Full Name', value: 'Rajesh Kumar' },
          { fieldId: 'aadhar_dob', fieldName: 'Date of Birth', value: '1990-05-15' },
          { fieldId: 'aadhar_address', fieldName: 'Address', value: '123, Gandhi Road, Mumbai, Maharashtra' },
          { fieldId: 'aadhar_number', fieldName: 'Aadhar Number', value: 'XXXX-XXXX-1234' }
        ],
        status: SubmissionStatus.PENDING,
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'sub-002',
        definitionId: 'def-002',
        holderDid: 'did:example:holder456',
        holderName: 'Priya Sharma',
        documentType: DocumentType.PAN,
        accountType: AccountType.CURRENT,
        submittedFields: [
          { fieldId: 'pan_full_name', fieldName: 'Full Name', value: 'Priya Sharma' },
          { fieldId: 'pan_father_name', fieldName: "Father's Name", value: 'Suresh Sharma' },
          { fieldId: 'pan_dob', fieldName: 'Date of Birth', value: '1985-08-22' },
          { fieldId: 'pan_number', fieldName: 'PAN Number', value: 'ABCDE1234F' }
        ],
        status: SubmissionStatus.PENDING,
        submittedAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'sub-003',
        definitionId: 'def-003',
        holderDid: 'did:example:holder789',
        holderName: 'Amit Patel',
        documentType: DocumentType.VOTER_ID,
        accountType: AccountType.SALARY,
        submittedFields: [
          { fieldId: 'voter_full_name', fieldName: 'Full Name', value: 'Amit Patel' },
          { fieldId: 'voter_father_name', fieldName: "Father's Name", value: 'Ramesh Patel' },
          { fieldId: 'voter_address', fieldName: 'Address', value: '45, Nehru Street, Ahmedabad, Gujarat' },
          { fieldId: 'voter_id_number', fieldName: 'EPIC Number', value: 'GJ/07/123/456789' }
        ],
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        reviewedBy: 'Manager Admin',
        comments: 'All documents verified successfully.'
      },
      {
        id: 'sub-004',
        definitionId: 'def-004',
        holderDid: 'did:example:holder101',
        holderName: 'Sneha Reddy',
        documentType: DocumentType.AADHAR,
        accountType: AccountType.FIXED_DEPOSIT,
        submittedFields: [
          { fieldId: 'aadhar_full_name', fieldName: 'Full Name', value: 'Sneha Reddy' },
          { fieldId: 'aadhar_dob', fieldName: 'Date of Birth', value: '1992-12-01' },
          { fieldId: 'aadhar_address', fieldName: 'Address', value: '78, MG Road, Hyderabad, Telangana' }
        ],
        status: SubmissionStatus.REJECTED,
        submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
        reviewedBy: 'Manager Admin',
        comments: 'Aadhar number missing from submission. Please resubmit with complete details.'
      },
      {
        id: 'sub-005',
        definitionId: 'def-005',
        holderDid: 'did:example:holder202',
        holderName: 'Vikram Singh',
        documentType: DocumentType.PAN,
        accountType: AccountType.NRI,
        submittedFields: [
          { fieldId: 'pan_full_name', fieldName: 'Full Name', value: 'Vikram Singh' },
          { fieldId: 'pan_father_name', fieldName: "Father's Name", value: 'Baldev Singh' },
          { fieldId: 'pan_dob', fieldName: 'Date of Birth', value: '1988-03-10' },
          { fieldId: 'pan_number', fieldName: 'PAN Number', value: 'FGHIJ5678K' }
        ],
        status: SubmissionStatus.PENDING,
        submittedAt: new Date(Date.now() - 15 * 60 * 1000)
      }
    ];

    this._submissions.set(mockSubmissions);
  }

  /**
   * Resets the workflow state
   */
  resetWorkflow(): void {
    this._selectedAccountType.set(null);
    this._selectedDocument.set(null);
  }
}
