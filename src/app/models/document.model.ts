/**
 * Enum representing document types for KYC verification
 */
export enum DocumentType {
  AADHAR = 'aadhar',
  PAN = 'pan',
  VOTER_ID = 'voter_id'
}

/**
 * Interface for individual document fields
 */
export interface DocumentField {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

/**
 * Interface for document subject configuration
 */
export interface DocumentSubject {
  type: DocumentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: DocumentField[];
}

/**
 * Static configuration for Aadhar Card fields
 */
const AADHAR_FIELDS: DocumentField[] = [
  {
    id: 'aadhar_full_name',
    name: 'Full Name',
    description: 'Complete name as per Aadhar',
    required: true,
    enabled: false
  },
  {
    id: 'aadhar_dob',
    name: 'Date of Birth',
    description: 'Date of birth of the holder',
    required: true,
    enabled: false
  },
  {
    id: 'aadhar_gender',
    name: 'Gender',
    description: 'Gender of the holder',
    required: false,
    enabled: false
  },
  {
    id: 'aadhar_address',
    name: 'Address',
    description: 'Complete residential address',
    required: true,
    enabled: false
  },
  {
    id: 'aadhar_number',
    name: 'Aadhar Number',
    description: '12-digit unique identification number',
    required: true,
    enabled: false
  },
  {
    id: 'aadhar_photo',
    name: 'Photo',
    description: 'Passport size photograph',
    required: false,
    enabled: false
  },
  {
    id: 'aadhar_pincode',
    name: 'PIN Code',
    description: 'Postal code of address',
    required: false,
    enabled: false
  },
  {
    id: 'aadhar_state',
    name: 'State',
    description: 'State of residence',
    required: false,
    enabled: false
  },
  {
    id: 'aadhar_district',
    name: 'District',
    description: 'District of residence',
    required: false,
    enabled: false
  }
];

/**
 * Static configuration for PAN Card fields
 */
const PAN_FIELDS: DocumentField[] = [
  {
    id: 'pan_full_name',
    name: 'Full Name',
    description: 'Name as per PAN card',
    required: true,
    enabled: false
  },
  {
    id: 'pan_father_name',
    name: "Father's Name",
    description: "Father's name of the holder",
    required: true,
    enabled: false
  },
  {
    id: 'pan_dob',
    name: 'Date of Birth',
    description: 'Date of birth of the holder',
    required: true,
    enabled: false
  },
  {
    id: 'pan_number',
    name: 'PAN Number',
    description: '10-character alphanumeric identifier',
    required: true,
    enabled: false
  },
  {
    id: 'pan_signature',
    name: 'Signature',
    description: 'Digital signature of holder',
    required: false,
    enabled: false
  },
  {
    id: 'pan_photo',
    name: 'Photo',
    description: 'Photograph on PAN card',
    required: false,
    enabled: false
  }
];

/**
 * Static configuration for Voter ID fields
 */
const VOTER_ID_FIELDS: DocumentField[] = [
  {
    id: 'voter_full_name',
    name: 'Full Name',
    description: 'Name as per Voter ID',
    required: true,
    enabled: false
  },
  {
    id: 'voter_father_name',
    name: "Father's/Husband's Name",
    description: "Relative's name",
    required: true,
    enabled: false
  },
  {
    id: 'voter_dob',
    name: 'Date of Birth',
    description: 'Date of birth or Age',
    required: false,
    enabled: false
  },
  {
    id: 'voter_age',
    name: 'Age',
    description: 'Current age of the holder',
    required: false,
    enabled: false
  },
  {
    id: 'voter_gender',
    name: 'Gender',
    description: 'Gender of the holder',
    required: false,
    enabled: false
  },
  {
    id: 'voter_address',
    name: 'Address',
    description: 'Residential address',
    required: true,
    enabled: false
  },
  {
    id: 'voter_id_number',
    name: 'EPIC Number',
    description: 'Electoral Photo Identity Card number',
    required: true,
    enabled: false
  },
  {
    id: 'voter_constituency',
    name: 'Constituency',
    description: 'Assembly constituency',
    required: false,
    enabled: false
  },
  {
    id: 'voter_photo',
    name: 'Photo',
    description: 'Photograph on Voter ID',
    required: false,
    enabled: false
  }
];

/**
 * Static configuration for all document subjects
 */
export const DOCUMENT_SUBJECTS: DocumentSubject[] = [
  {
    type: DocumentType.AADHAR,
    name: 'Aadhar Card',
    description: 'Unique Identification Authority of India (UIDAI) issued ID',
    icon: 'fingerprint',
    color: '#FF6B35',
    fields: AADHAR_FIELDS.map((field: DocumentField) => ({ ...field }))
  },
  {
    type: DocumentType.PAN,
    name: 'PAN Card',
    description: 'Permanent Account Number issued by Income Tax Department',
    icon: 'credit_card',
    color: '#2E86AB',
    fields: PAN_FIELDS.map((field: DocumentField) => ({ ...field }))
  },
  {
    type: DocumentType.VOTER_ID,
    name: 'Voter ID Card',
    description: 'Electoral Photo Identity Card issued by Election Commission',
    icon: 'how_to_vote',
    color: '#7B2D8E',
    fields: VOTER_ID_FIELDS.map((field: DocumentField) => ({ ...field }))
  }
];
