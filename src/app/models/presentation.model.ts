import { AccountType } from './account.model';
import { DocumentType } from './document.model';

/**
 * Enum for submission status
 */
export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Interface for field constraints in presentation definition
 */
export interface FieldConstraint {
  fieldId: string;
  fieldName: string;
  required: boolean;
}

/**
 * Interface for input descriptor in presentation definition
 */
export interface InputDescriptor {
  id: string;
  name: string;
  purpose: string;
  constraints: {
    fields: FieldConstraint[];
  };
}

/**
 * Interface for presentation definition format
 */
export interface PresentationDefinitionFormat {
  jwt?: { alg: string[] };
  ldp_vc?: { proof_type: string[] };
}

/**
 * Interface for presentation definition
 * Following the DIF Presentation Exchange specification
 */
export interface PresentationDefinition {
  id: string;
  name: string;
  purpose: string;
  accountType: AccountType;
  documentType: DocumentType;
  format?: PresentationDefinitionFormat;
  input_descriptors: InputDescriptor[];
  createdAt: Date;
  expiresAt: Date;
  qrCodeData?: string;
}

/**
 * Interface for submitted field data
 */
export interface SubmittedField {
  fieldId: string;
  fieldName: string;
  value: string;
}

/**
 * Interface for presentation submission
 * Represents data submitted by holder wallet
 */
export interface PresentationSubmission {
  id: string;
  definitionId: string;
  holderDid: string;
  holderName: string;
  documentType: DocumentType;
  accountType: AccountType;
  submittedFields: SubmittedField[];
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
}

/**
 * Interface for QR code payload
 */
export interface QRCodePayload {
  type: 'presentation_request';
  definitionId: string;
  callbackUrl: string;
  challenge: string;
  domain: string;
  presentationDefinition: PresentationDefinition;
}
