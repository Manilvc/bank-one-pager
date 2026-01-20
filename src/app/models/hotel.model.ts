/**
 * Hotel room type configuration
 */
export interface RoomType {
  type: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
}

/**
 * Available room types for hotel check-in
 */
export const ROOM_TYPES: RoomType[] = [
  {
    type: 'standard',
    name: 'Standard Room',
    description: 'Comfortable room with basic amenities',
    pricePerNight: 2500,
    maxGuests: 2,
    amenities: ['Wi-Fi', 'TV', 'AC', 'Bathroom']
  },
  {
    type: 'deluxe',
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities',
    pricePerNight: 4000,
    maxGuests: 3,
    amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Balcony']
  },
  {
    type: 'suite',
    name: 'Suite',
    description: 'Luxurious suite with separate living area',
    pricePerNight: 7500,
    maxGuests: 4,
    amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Living Room', 'Kitchenette']
  },
  {
    type: 'presidential',
    name: 'Presidential Suite',
    description: 'Ultra-luxurious suite with premium services',
    pricePerNight: 15000,
    maxGuests: 6,
    amenities: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Living Room', 'Kitchen', 'Jacuzzi', 'Butler Service']
  }
];

/**
 * Hotel check-in status
 */
export enum CheckInStatus {
  PENDING = 'pending',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

/**
 * Hotel check-in/check-out submission
 */
export interface HotelSubmission {
  request_id: string;
  room_type: string;
  document_name: string;
  holder_did: string | null;
  status: CheckInStatus;
  check_in_date: string;
  check_out_date: string | null;
  created_at: string;
  completed_at: string | null;
  submission_json: Record<string, unknown> | null;
}
