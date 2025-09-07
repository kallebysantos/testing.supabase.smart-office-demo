/**
 * Bookings API - Handles all booking-related data operations
 *
 * Provides methods for fetching bookings with proper status determination
 * and room data integration
 */

import { ApiClient, supabase } from "./client";
import type {
  RoomBooking,
  BookingWithRoomData,
  BookingWithSensorData,
  BookingStatus,
  RoomId,
  BookingId,
  ApiResponse,
} from "@/types";
import { roomsApi } from "./rooms";

export class BookingsApi extends ApiClient {
  /**
   * Fetch all bookings with room data
   */
  async getBookings(): Promise<ApiResponse<BookingWithRoomData[]>> {
    return this.handleResponse(async () => {
      const { data, error } = await supabase
        .from("room_bookings")
        .select(
          `
          id,
          room_id,
          title,
          organizer_email,
          start_time,
          end_time,
          attendee_count,
          created_at,
          rooms!inner(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) return { data: null, error };

      const bookingsWithRoom =
        data?.map((booking) => ({
          ...booking,
          room: { name: booking.rooms.name },
          status: this.determineBookingStatus(
            booking.start_time,
            booking.end_time
          ),
        })) || [];

      return { data: bookingsWithRoom, error: null };
    });
  }

  /**
   * Fetch booking by ID
   */
  async getBookingById(
    id: BookingId
  ): Promise<ApiResponse<BookingWithRoomData>> {
    return this.handleResponse(async () => {
      const { data, error } = await supabase
        .from("room_bookings")
        .select(
          `
          id,
          room_id,
          title,
          organizer_email,
          start_time,
          end_time,
          attendee_count,
          created_at,
          rooms!inner(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) return { data: null, error };

      const bookingWithRoom = {
        ...data,
        room: { name: data.rooms.name },
        status: this.determineBookingStatus(data.start_time, data.end_time),
      };

      return { data: bookingWithRoom, error: null };
    });
  }

  /**
   * Get bookings with sensor data for active meetings
   */
  async getBookingsWithSensorData(): Promise<
    ApiResponse<BookingWithSensorData[]>
  > {
    try {
      const bookingsResponse = await this.getBookings();

      if (!bookingsResponse.success || !bookingsResponse.data) {
        return bookingsResponse;
      }

      const sensorResponse = await roomsApi.getLatestSensorReadings();
      const sensorReadings = sensorResponse.data || [];

      // Create map of latest sensor readings by room_id
      const sensorMap = new Map();
      sensorReadings.forEach((reading) => {
        if (!sensorMap.has(reading.room_id)) {
          sensorMap.set(reading.room_id, reading);
        }
      });

      const bookingsWithSensor: BookingWithSensorData[] =
        bookingsResponse.data.map((booking) => {
          const sensorData = sensorMap.get(booking.room_id);

          return {
            ...booking,
            currentOccupancy: sensorData?.occupancy,
            currentTemperature: sensorData?.temperature,
            currentNoiseLevel: sensorData?.noise_level,
            currentAirQuality: sensorData?.air_quality,
            lastSensorUpdate: sensorData?.timestamp,
          };
        });

      return {
        success: true,
        data: bookingsWithSensor,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch bookings with sensor data",
      };
    }
  }

  /**
   * Filter bookings by status
   */
  filterBookingsByStatus<T extends BookingWithRoomData>(
    bookings: T[],
    status: BookingStatus
  ): T[] {
    return bookings.filter((booking) => booking.status === status);
  }

  /**
   * Get bookings for a specific room
   */
  async getRoomBookings(
    roomId: RoomId,
    limit: number = 50
  ): Promise<ApiResponse<BookingWithRoomData[]>> {
    return this.handleResponse(async () => {
      const { data, error } = await supabase
        .from("room_bookings")
        .select(
          `
          id,
          room_id,
          title,
          organizer_email,
          start_time,
          end_time,
          attendee_count,
          created_at,
          rooms!inner(name)
        `
        )
        .eq("room_id", roomId)
        .order("start_time", { ascending: false })
        .limit(limit);

      if (error) return { data: null, error };

      const bookingsWithRoom =
        data?.map((booking) => ({
          ...booking,
          room: { name: booking.rooms.name },
          status: this.determineBookingStatus(
            booking.start_time,
            booking.end_time
          ),
        })) || [];

      return { data: bookingsWithRoom, error: null };
    });
  }

  /**
   * Determine booking status based on current time
   */
  private determineBookingStatus(
    startTime: string,
    endTime: string
  ): BookingStatus {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Add some tolerance for timezone differences (5 minutes)
    const tolerance = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (
      now.getTime() >= start.getTime() - tolerance &&
      now.getTime() <= end.getTime() + tolerance
    ) {
      return "active";
    } else if (now.getTime() < start.getTime()) {
      return "upcoming";
    } else {
      return "completed";
    }
  }
}

export const bookingsApi = new BookingsApi();
