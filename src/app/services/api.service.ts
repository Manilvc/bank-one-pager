import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * API response interface for subject fields
 */
export interface SubjectFieldResponse {
  id: number;
  field_key: string;
  field_name: string;
  field_description: string;
  field_type: string;
  is_required: boolean;
  display_order: number;
}

/**
 * API response interface for a single subject from the API
 */
export interface SubjectApiResponse {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  icon_color: string;
  did: string;
  field_count: number;
  is_active: boolean;
  fields?: SubjectFieldResponse[];
}

/**
 * Wrapper response from API
 */
export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
}

/**
 * Wrapper response for single item from API
 */
export interface ApiSingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Normalized subject for internal use
 */
export interface SubjectResponse {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: SubjectFieldResponse[];
}

/**
 * Generic API service for handling HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Fetches all active subjects from the API
   * @param activeOnly - Filter to return only active subjects
   */
  getSubjects(activeOnly: boolean): Observable<SubjectApiResponse[]> {
    const params = new HttpParams().set('active_only', activeOnly.toString());
    return this.http.get<ApiListResponse<SubjectApiResponse>>(`${this.baseUrl}/subjects`, { params: params }).pipe(
      map((response: ApiListResponse<SubjectApiResponse>) => response.data)
    );
  }

  /**
   * Fetches a single subject by ID with its fields
   * @param subjectId - The unique identifier of the subject
   */
  getSubjectById(subjectId: number): Observable<SubjectApiResponse> {
    return this.http.get<ApiSingleResponse<SubjectApiResponse>>(`${this.baseUrl}/subjects/${subjectId}`).pipe(
      map((response: ApiSingleResponse<SubjectApiResponse>) => response.data)
    );
  }

  /**
   * Creates a presentation definition via API
   * @param subjectId - The subject ID
   * @param accountType - The account type (savings, current, etc.)
   * @param fieldIds - Array of field IDs to include
   */
  createPresentation(subjectId: number, accountType: string, fieldIds: number[]): Observable<PresentationApiResponse> {
    const body: CreatePresentationRequest = {
      subject_id: subjectId,
      account_type: accountType,
      field_ids: fieldIds
    };
    return this.http.post<ApiSingleResponse<PresentationApiResponse>>(`${this.baseUrl}/presentations`, body).pipe(
      map((response: ApiSingleResponse<PresentationApiResponse>) => response.data)
    );
  }

  /**
   * Fetches dashboard statistics
   */
  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<ApiSingleResponse<DashboardStatistics>>(`${this.baseUrl}/dashboard/statistics`).pipe(
      map((response: ApiSingleResponse<DashboardStatistics>) => response.data)
    );
  }

  /**
   * Fetches recent activity for dashboard
   */
  getRecentActivity(): Observable<RecentActivityItem[]> {
    return this.http.get<ApiListResponse<RecentActivityItem>>(`${this.baseUrl}/dashboard/recent-activity`).pipe(
      map((response: ApiListResponse<RecentActivityItem>) => response.data)
    );
  }
}

/**
 * Request body for creating a presentation
 */
export interface CreatePresentationRequest {
  subject_id: number;
  account_type: string;
  field_ids: number[];
}

/**
 * API response for presentation creation
 */
export interface PresentationApiResponse {
  id: number;
  presentation_id: string;
  subject_id: number;
  account_type: string;
  qr_code_url: string;
  qr_code_data: string;
  status: string;
  created_at: string;
  expires_at: string;
}

/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  pending_reviews: number;
  approved: number;
  rejected: number;
  qr_definitions: number;
  pending_today: number;
  approved_this_week: number;
}

/**
 * Recent activity item
 */
export interface RecentActivityItem {
  id: number;
  holder_name: string;
  document_type: string;
  account_type: string;
  status: string;
  submitted_at: string;
}
