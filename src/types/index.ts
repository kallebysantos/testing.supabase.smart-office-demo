/**
 * Central type definitions for the Smart Office Dashboard
 *
 * This file extends Supabase-generated types with branded types and UI-specific interfaces.
 * Database types are imported from @/lib/supabase/types (auto-generated)
 */

import type { Database } from "@/lib/supabase/types";

// ============================================================================
// CORE DATABASE TYPES (from Supabase)
// ============================================================================

// Direct exports from Supabase-generated types
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type SensorReading = Database["public"]["Tables"]["sensor_readings"]["Row"];
export type RoomBooking = Database["public"]["Tables"]["room_bookings"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type FacilityAlert = Database["public"]["Tables"]["facility_alerts"]["Row"];
export type DailyRoomAnalytics = Database["public"]["Tables"]["daily_room_analytics"]["Row"];

// Service tickets table (not in generated types yet - needs regeneration)
export interface ServiceTicket {
  id: string;
  room_id: string;
  ticket_type: "capacity_violation" | "maintenance" | "environmental";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "queued" | "processing" | "assigned" | "resolved";
  priority: number;
  trigger_reading_id?: string;
  violation_data?: Record<string, unknown>;
  assigned_to?: string;
  assigned_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  external_ticket_id?: string;
  external_system: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BRANDED TYPES (for type safety)
// ============================================================================

export type RoomId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };
export type BookingId = string & { readonly __brand: unique symbol };

// ============================================================================
// ENUM TYPES
// ============================================================================

export type UserRole = "employee" | "facilities" | "admin";
export type BookingStatus = "upcoming" | "active" | "completed";
export type RoomStatus = "available" | "occupied" | "full" | "unknown";
export type TicketStatus = "queued" | "processing" | "assigned" | "resolved";
export type TicketSeverity = "low" | "medium" | "high" | "critical";
export type TicketType = "capacity_violation" | "maintenance" | "environmental";
export type AvailabilityStatus = 'available' | 'occupied' | 'booked' | 'maintenance';

// ============================================================================
// DERIVED/UI TYPES
// ============================================================================

// Room types with additional data
export interface RoomWithSensorData extends Room {
  currentOccupancy?: number;
  currentTemperature?: number;
  currentNoiseLevel?: number;
  currentAirQuality?: number;
  lastUpdated?: string;
  status: RoomStatus;
}

export interface RoomWithLatestReading extends Room {
  latest_reading?: SensorReading | null;
}

export interface RoomStatusData {
  room: Room;
  occupancy: number;
  temperature: number | null;
  noise_level: number | null;
  air_quality: number | null;
  availability: AvailabilityStatus;
  last_updated: string;
}

// Booking types with additional data
export interface BookingWithRoomData extends RoomBooking {
  room: Pick<Room, "name">;
  status: BookingStatus;
}

export interface BookingWithSensorData extends BookingWithRoomData {
  currentOccupancy?: number;
  currentTemperature?: number;
  currentNoiseLevel?: number;
  currentAirQuality?: number;
  lastSensorUpdate?: string;
}

// Service ticket with room data
export interface ServiceTicketWithRoom extends ServiceTicket {
  room?: Pick<Room, "name">;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DashboardMetrics {
  availableRooms: number;
  roomsAboveCapacity: number;
  averageTemperature: number;
  averageNoiseLevel: number;
  averageAirQuality: number;
  averageUtilization: number;
  totalRooms: number;
}

export interface RoomUtilizationData {
  room_name: string;
  avg_utilization: number;
  total_bookings: number;
  avg_occupancy: number;
  capacity_violations: number;
  avg_temperature: number;
  avg_air_quality: number;
  avg_noise_level: number;
  utilization_trend: "up" | "down" | "stable";
}

export interface TimeSeriesData {
  date: string;
  utilization: number;
  capacity_violations: number;
  avg_temperature: number;
  avg_air_quality: number;
  avg_noise: number;
  bookings: number;
}

// ============================================================================
// FILTER AND UI TYPES
// ============================================================================

export interface FilterOptions {
  floor: number | 'all';
  availability: AvailabilityStatus | 'all';
  building: string | 'all';
}

export type SortOption = 'name' | 'occupancy' | 'temperature' | 'floor';
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface RealtimeConfig {
  table: string;
  event: "*" | "INSERT" | "UPDATE" | "DELETE";
  schema?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const USER_ROLES = ["employee", "facilities", "admin"] as const;
export const BOOKING_STATUSES = ["upcoming", "active", "completed"] as const;
export const ROOM_STATUSES = [
  "available",
  "occupied",
  "full",
  "unknown",
] as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isUserRole = (role: string): role is UserRole => {
  return USER_ROLES.includes(role as UserRole);
};

export const isBookingStatus = (status: string): status is BookingStatus => {
  return BOOKING_STATUSES.includes(status as BookingStatus);
};

export const isRoomStatus = (status: string): status is RoomStatus => {
  return ROOM_STATUSES.includes(status as RoomStatus);
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;