import { Injectable, inject, signal, computed } from '@angular/core';
import { RoomType, ROOM_TYPES, CheckInStatus } from '../models/hotel.model';
import { DocumentSubject, DocumentField, DocumentType } from '../models/document.model';
import {
  PresentationDefinition,
  QRCodePayload
} from '../models/presentation.model';
import { ApiService, SubjectApiResponse, SubjectFieldResponse, PresentationApiResponse, CreatePresentationRequest } from './api.service';
import { catchError, of } from 'rxjs';

/**
 * Service for managing hotel check-in/check-out operations
 * Reuses the same APIs as BankService but with hotel-specific logic
 */
@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private readonly apiService = inject(ApiService);

  // Signals for reactive state management
  private _selectedRoomType = signal<RoomType | null>(null);
  private _selectedDocument = signal<DocumentSubject | null>(null);
  private _documentSubjects = signal<DocumentSubject[]>([]);
  private _subjectsLoading = signal<boolean>(false);
  private _subjectsError = signal<string | null>(null);
  private _presentationLoading = signal<boolean>(false);
  private _presentationError = signal<string | null>(null);
  private _apiPresentationResponse = signal<PresentationApiResponse | null>(null);
  private _selectedFields = signal<DocumentField[]>([]);

  // Computed values
  readonly selectedRoomType = this._selectedRoomType.asReadonly();
  readonly selectedDocument = this._selectedDocument.asReadonly();
  readonly documentSubjects = this._documentSubjects.asReadonly();
  readonly subjectsLoading = this._subjectsLoading.asReadonly();
  readonly subjectsError = this._subjectsError.asReadonly();
  readonly presentationLoading = this._presentationLoading.asReadonly();
  readonly presentationError = this._presentationError.asReadonly();
  readonly apiPresentationResponse = this._apiPresentationResponse.asReadonly();
  readonly selectedFields = this._selectedFields.asReadonly();

  // Available room types
  readonly roomTypes = ROOM_TYPES;

  /**
   * Fetches document subjects from API
   */
  fetchDocumentSubjects(): void {
    this._subjectsLoading.set(true);
    this._subjectsError.set(null);

    this.apiService.getSubjects(true).pipe(
      catchError((error: Error) => {
        console.error('Failed to load subjects:', error);
        this._subjectsError.set('Failed to load document types. Please try again.');
        this._subjectsLoading.set(false);
        return of([]);
      })
    ).subscribe((subjects: SubjectApiResponse[]) => {
      this._documentSubjects.set(this.mapApiSubjectsToModel(subjects));
      this._subjectsLoading.set(false);
    });
  }

  /**
   * Maps API subject response to internal DocumentSubject model
   */
  private mapApiSubjectsToModel(apiSubjects: SubjectApiResponse[]): DocumentSubject[] {
    return apiSubjects.map((subject: SubjectApiResponse) => ({
      id: subject.id,
      type: this.mapSubjectNameToType(subject.name),
      name: subject.name,
      description: subject.description,
      icon: subject.icon_name,
      color: subject.icon_color,
      did: subject.did,
      fields: [] // Fields will be loaded separately when document is selected
    }));
  }

  /**
   * Maps subject name to DocumentType enum
   */
  private mapSubjectNameToType(name: string): DocumentType {
    const normalized = name.toLowerCase();
    if (normalized.includes('aadhar') || normalized.includes('aadhaar')) {
      return DocumentType.AADHAR;
    } else if (normalized.includes('pan')) {
      return DocumentType.PAN;
    } else if (normalized.includes('voter')) {
      return DocumentType.VOTER_ID;
    }
    // Default fallback
    return DocumentType.AADHAR;
  }

  /**
   * Fetches fields for a specific subject
   */
  fetchSubjectFields(subjectId: number): void {
    this.apiService.getSubjectById(subjectId).pipe(
      catchError((error: Error) => {
        console.error('Failed to load subject fields:', error);
        return of(null);
      })
    ).subscribe((subject: SubjectApiResponse | null) => {
      if (subject && subject.fields) {
        const fields = this.mapApiFieldsToModel(subject.fields);
        this._selectedFields.set(fields);
      }
    });
  }

  /**
   * Maps API field response to internal DocumentField model
   */
  private mapApiFieldsToModel(apiFields: SubjectFieldResponse[]): DocumentField[] {
    return apiFields.map((field: SubjectFieldResponse) => ({
      id: field.id.toString(),
      apiId: field.id,
      name: field.field_name,
      description: field.field_description,
      required: field.is_required,
      enabled: field.is_required
    }));
  }

  /**
   * Selects a room type
   */
  selectRoomType(roomType: RoomType): void {
    this._selectedRoomType.set(roomType);
  }

  /**
   * Selects a document subject
   */
  selectDocument(document: DocumentSubject): void {
    this._selectedDocument.set(document);
    if (document.id) {
      this.fetchSubjectFields(document.id);
    }
  }

  /**
   * Toggles field selection
   */
  toggleField(fieldId: string): void {
    const fields = this._selectedFields();
    const field = fields.find((f: DocumentField) => f.id === fieldId);
    if (field && !field.required) {
      field.enabled = !field.enabled;
      this._selectedFields.set([...fields]);
    }
  }

  /**
   * Gets enabled fields
   */
  getEnabledFields(): DocumentField[] {
    return this._selectedFields().filter((field: DocumentField) => field.enabled);
  }

  /**
   * Gets room type name
   */
  getRoomTypeName(roomType: RoomType | null): string {
    if (!roomType) return '';
    return roomType.name;
  }

  /**
   * Creates a presentation definition via API for hotel check-in
   */
  createPresentationViaApi(): void {
    const roomType = this._selectedRoomType();
    const document = this._selectedDocument();

    if (!roomType || !document || !document.id) {
      this._presentationError.set('Room type and document must be selected');
      return;
    }

    const enabledFields = this.getEnabledFields();
    if (enabledFields.length === 0) {
      this._presentationError.set('At least one field must be enabled');
      return;
    }

    // Get field API IDs
    const fieldIds = enabledFields
      .filter((field: DocumentField) => field.apiId !== undefined)
      .map((field: DocumentField) => field.apiId as number);

    if (fieldIds.length === 0) {
      this._presentationError.set('No valid field IDs found');
      return;
    }

    // Build the presentation definition payload
    const payload: CreatePresentationRequest = {
      account_type: this.getRoomTypeName(roomType),
      expiry_hours: 24,
      field_ids: fieldIds,
      purpose: `Hotel check-in verification for ${this.getRoomTypeName(roomType)}`,
      subject_id: document.id
    };

    this._presentationLoading.set(true);
    this._presentationError.set(null);

    this.apiService.createPresentation(payload).pipe(
      catchError((error: Error) => {
        console.error('Failed to create presentation:', error);
        this._presentationError.set('Failed to create presentation. Please try again.');
        return of(null);
      })
    ).subscribe((response: PresentationApiResponse | null) => {
      this._presentationLoading.set(false);
      
      if (response) {
        this._apiPresentationResponse.set(response);
      }
    });
  }

  /**
   * Clears the presentation response
   */
  clearPresentationResponse(): void {
    this._apiPresentationResponse.set(null);
  }

  /**
   * Resets all selections
   */
  reset(): void {
    this._selectedRoomType.set(null);
    this._selectedDocument.set(null);
    this._selectedFields.set([]);
    this._apiPresentationResponse.set(null);
    this._presentationError.set(null);
  }
}
