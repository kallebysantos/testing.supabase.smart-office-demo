export interface Room {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
  amenities: string[] | null
  image_url: string | null
  created_at: string
}

export interface SensorReading {
  id: string
  room_id: string | null
  occupancy: number
  temperature: number | null
  noise_level: number | null
  air_quality: number | null
  timestamp: string
}

export interface RoomWithLatestReading extends Room {
  latest_reading?: SensorReading | null
}

export type AvailabilityStatus = 'available' | 'occupied' | 'booked' | 'maintenance'

export interface RoomStatus {
  room: Room
  occupancy: number
  temperature: number | null
  noise_level: number | null
  air_quality: number | null
  availability: AvailabilityStatus
  last_updated: string
}

export interface FilterOptions {
  floor: number | 'all'
  availability: AvailabilityStatus | 'all'
  building: string | 'all'
}

export type SortOption = 'name' | 'occupancy' | 'temperature' | 'floor'
export type SortOrder = 'asc' | 'desc'