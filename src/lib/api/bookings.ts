/**
 * Bookings API - Handles all booking-related data operations
 *
 * Provides methods for fetching bookings with proper status determination
 * and room data integration
 */

import { ApiClient, supabase } from "./client";
import type {
  BookingWithRoomData,
  BookingWithSensorData,
  BookingStatus,
  RoomId,
  BookingId,
  ApiResponse,
  RoomBooking,
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
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        data?.map((booking: any) => ({
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

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const bookingWithRoom = {
        ...(data as any),
        room: { name: (data as any).rooms.name },
        status: this.determineBookingStatus((data as any).start_time, (data as any).end_time),
      };
      /* eslint-enable @typescript-eslint/no-explicit-any */

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
    } catch {
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
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        data?.map((booking: any) => ({
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
   * Create a new booking
   */
  async createBooking(booking: {
    room_id: string;
    title: string;
    start_time: string;
    end_time: string;
    attendee_count?: number;
  }): Promise<ApiResponse<RoomBooking>> {
    return this.handleResponse(async () => {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: "User not authenticated" };
      }

      // Check for booking conflicts
      const conflictCheck = await supabase.rpc('check_booking_conflict', {
        p_room_id: booking.room_id,
        p_start_time: booking.start_time,
        p_end_time: booking.end_time
      });

      if (conflictCheck.error) {
        return { data: null, error: "Failed to check booking conflicts" };
      }

      if (!conflictCheck.data) {
        return { data: null, error: "Room is already booked for this time slot" };
      }

      // Create the booking
      const { data, error } = await supabase
        .from("room_bookings")
        .insert({
          ...booking,
          organizer_email: user.email,
        })
        .select()
        .single();

      if (error) return { data: null, error };

      return { data, error: null };
    });
  }

  /**
   * Update an existing booking
   */
  async updateBooking(
    id: BookingId,
    updates: Partial<{
      title: string;
      start_time: string;
      end_time: string;
      attendee_count: number;
    }>
  ): Promise<ApiResponse<RoomBooking>> {
    return this.handleResponse(async () => {
      // If updating time, check for conflicts
      if (updates.start_time || updates.end_time) {
        const { data: currentBooking } = await supabase
          .from("room_bookings")
          .select("room_id, start_time, end_time")
          .eq("id", id)
          .single();

        if (currentBooking) {
          const conflictCheck = await supabase.rpc('check_booking_conflict', {
            p_room_id: currentBooking.room_id,
            p_start_time: updates.start_time || currentBooking.start_time,
            p_end_time: updates.end_time || currentBooking.end_time,
            p_booking_id: id
          });

          if (conflictCheck.error) {
            return { data: null, error: "Failed to check booking conflicts" };
          }

          if (!conflictCheck.data) {
            return { data: null, error: "Room is already booked for this time slot" };
          }
        }
      }

      const { data, error } = await supabase
        .from("room_bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) return { data: null, error };

      return { data, error: null };
    });
  }

  /**
   * Cancel/delete a booking
   */
  async cancelBooking(id: BookingId): Promise<ApiResponse<void>> {
    return this.handleResponse(async () => {
      const { error } = await supabase
        .from("room_bookings")
        .delete()
        .eq("id", id);

      if (error) return { data: null, error };

      return { data: undefined, error: null };
    });
  }

  /**
   * Get upcoming bookings for a room on a specific date
   */
  async getRoomBookingsForDate(
    roomId: RoomId,
    date: string
  ): Promise<ApiResponse<RoomBooking[]>> {
    return this.handleResponse(async () => {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("room_bookings")
        .select("*")
        .eq("room_id", roomId)
        .gte("start_time", startOfDay)
        .lte("end_time", endOfDay)
        .order("start_time", { ascending: true });

      if (error) return { data: null, error };

      return { data: data || [], error: null };
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
