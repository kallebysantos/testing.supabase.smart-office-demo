/**
 * Central type definitions for the Smart Office Dashboard
 * 
 * This file contains all shared types to ensure consistency across the application
 * and eliminate duplication. All types are branded for additional type safety.
 */

// Branded types for better type safety
export type RoomId = string & { readonly __brand: unique symbol }
export type UserId = string & { readonly __brand: unique symbol }
export type BookingId = string & { readonly __brand: unique symbol }

// Core domain entities
export interface Room {
  id: RoomId
  name: string
  capacity: number
  floor: number
  building: string
  amenities?: string[]
  image_url?: string
  created_at: string
}

export interface SensorReading {
  id: string
  room_id: RoomId
  occupancy: number
  temperature: number
  noise_level: number
  air_quality: number
  timestamp: string
}

export interface RoomBooking {
  id: BookingId
  room_id: RoomId
  title: string
  organizer_email: string
  start_time: string
  end_time: string
  attendee_count: number
  created_at: string
}

export interface UserProfile {
  id: UserId
  email: string
  full_name: string | null
  department: string | null
  role: UserRole
  floor_access: number[]
  created_at: string
}

// Enums and union types
export type UserRole = 'employee' | 'facilities' | 'admin'
export type BookingStatus = 'upcoming' | 'active' | 'completed'
export type RoomStatus = 'available' | 'occupied' | 'full' | 'unknown'

// Derived types for UI components
export interface RoomWithSensorData extends Room {
  currentOccupancy?: number
  currentTemperature?: number
  currentNoiseLevel?: number
  currentAirQuality?: number
  lastUpdated?: string
  status: RoomStatus
}

export interface BookingWithRoomData extends RoomBooking {
  room: Pick<Room, 'name'>
  status: BookingStatus
}

export interface BookingWithSensorData extends BookingWithRoomData {
  currentOccupancy?: number
  currentTemperature?: number
  currentNoiseLevel?: number
  currentAirQuality?: number
  lastSensorUpdate?: string
}

// Analytics types
export interface DashboardMetrics {
  availableRooms: number
  roomsAboveCapacity: number
  averageTemperature: number
  averageNoiseLevel: number
  averageAirQuality: number
  averageUtilization: number
  totalRooms: number
}

export interface RoomUtilizationData {
  room_name: string
  avg_utilization: number
  total_bookings: number
  avg_occupancy: number
  capacity_violations: number
  avg_temperature: number
  avg_air_quality: number
  avg_noise_level: number
  utilization_trend: 'up' | 'down' | 'stable'
}

export interface TimeSeriesData {
  date: string
  utilization: number
  capacity_violations: number
  avg_temperature: number
  avg_air_quality: number
  avg_noise: number
  bookings: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  hasMore: boolean
}

// Configuration types
export interface RealtimeConfig {
  table: string
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema?: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: unknown
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  message: string
}

// Constants
export const USER_ROLES = ['employee', 'facilities', 'admin'] as const
export const BOOKING_STATUSES = ['upcoming', 'active', 'completed'] as const
export const ROOM_STATUSES = ['available', 'occupied', 'full', 'unknown'] as const

// Type guards
export const isUserRole = (role: string): role is UserRole => {
  return USER_ROLES.includes(role as UserRole)
}

export const isBookingStatus = (status: string): status is BookingStatus => {
  return BOOKING_STATUSES.includes(status as BookingStatus)
}

export const isRoomStatus = (status: string): status is RoomStatus => {
  return ROOM_STATUSES.includes(status as RoomStatus)
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>