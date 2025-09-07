/**
 * Rooms API - Handles all room-related data operations
 * 
 * Provides type-safe methods for fetching rooms, sensor data, and real-time updates
 */

import { ApiClient, supabase } from './client'
import type { 
  Room, 
  SensorReading, 
  RoomWithSensorData, 
  RoomId, 
  ApiResponse,
  RoomStatus 
} from '@/types'

export class RoomsApi extends ApiClient {
  /**
   * Fetch all rooms with basic information
   */
  async getRooms(): Promise<ApiResponse<Room[]>> {
    return this.handleResponse(async () => {
      return supabase
        .from('rooms')
        .select('id, name, capacity, floor, building, amenities, image_url, created_at')
        .order('name')
    })
  }

  /**
   * Fetch room by ID
   */
  async getRoomById(id: RoomId): Promise<ApiResponse<Room>> {
    return this.handleResponse(async () => {
      return supabase
        .from('rooms')
        .select('id, name, capacity, floor, building, amenities, image_url, created_at')
        .eq('id', id)
        .single()
    })
  }

  /**
   * Fetch latest sensor readings for all rooms
   */
  async getLatestSensorReadings(): Promise<ApiResponse<SensorReading[]>> {
    return this.handleResponse(async () => {
      return supabase
        .from('sensor_readings')
        .select('room_id, occupancy, temperature, noise_level, air_quality, timestamp')
        .order('timestamp', { ascending: false })
    })
  }

  /**
   * Fetch sensor readings for a specific room
   */
  async getRoomSensorReadings(
    roomId: RoomId, 
    limit: number = 100
  ): Promise<ApiResponse<SensorReading[]>> {
    return this.handleResponse(async () => {
      return supabase
        .from('sensor_readings')
        .select('*')
        .eq('room_id', roomId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    })
  }

  /**
   * Get rooms with their latest sensor data
   */
  async getRoomsWithSensorData(): Promise<ApiResponse<RoomWithSensorData[]>> {
    try {
      const [roomsResponse, sensorResponse] = await Promise.all([
        this.getRooms(),
        this.getLatestSensorReadings()
      ])

      if (!roomsResponse.success || !sensorResponse.success) {
        return {
          success: false,
          error: roomsResponse.error || sensorResponse.error || 'Failed to fetch data'
        }
      }

      const rooms = roomsResponse.data || []
      const sensorReadings = sensorResponse.data || []

      // Create a map of latest readings by room_id
      const latestReadingsMap = new Map<RoomId, SensorReading>()
      sensorReadings.forEach(reading => {
        if (!latestReadingsMap.has(reading.room_id)) {
          latestReadingsMap.set(reading.room_id, reading)
        }
      })

      const roomsWithData: RoomWithSensorData[] = rooms.map(room => {
        const latestReading = latestReadingsMap.get(room.id)
        
        return {
          ...room,
          currentOccupancy: latestReading?.occupancy,
          currentTemperature: latestReading?.temperature,
          currentNoiseLevel: latestReading?.noise_level,
          currentAirQuality: latestReading?.air_quality,
          lastUpdated: latestReading?.timestamp,
          status: this.determineRoomStatus(latestReading?.occupancy, room.capacity)
        }
      })

      return {
        success: true,
        data: roomsWithData
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to combine room and sensor data'
      }
    }
  }

  /**
   * Determine room status based on occupancy and capacity
   */
  private determineRoomStatus(occupancy?: number, capacity?: number): RoomStatus {
    if (occupancy === undefined || capacity === undefined) return 'unknown'
    if (occupancy === 0) return 'available'
    if (occupancy >= capacity) return 'full'
    return 'occupied'
  }
}

export const roomsApi = new RoomsApi()