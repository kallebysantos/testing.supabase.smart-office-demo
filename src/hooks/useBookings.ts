/**
 * useBookings Hook - Manages booking data with filtering and real-time updates
 *
 * Provides booking data with status filtering and real-time sensor data
 * for active meetings
 */

import { useState, useEffect, useCallback } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { realtimeManager } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { filterBookingsArray } from "@/lib/utils/rls-filter";
import type {
  BookingWithSensorData,
  BookingStatus,
  SensorReading,
} from "@/types";

interface UseBookingsOptions {
  enableRealtime?: boolean;
  includeSensorData?: boolean;
}

interface UseBookingsReturn {
  bookings: BookingWithSensorData[];
  loading: boolean;
  error: string | null;
  filterByStatus: (status: BookingStatus) => BookingWithSensorData[];
  getStatusCounts: () => Record<BookingStatus, number>;
  refetch: () => Promise<void>;
}

export function useBookings(
  options: UseBookingsOptions = {}
): UseBookingsReturn {
  const { enableRealtime = true, includeSensorData = true } = options;
  const { userProfile } = useAuth();

  const [bookings, setBookings] = useState<BookingWithSensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const response = includeSensorData
        ? await bookingsApi.getBookingsWithSensorData()
        : await bookingsApi.getBookings();

      if (response.success && response.data) {
        // Apply RLS filtering based on user role
        const filteredBookings = filterBookingsArray(
          response.data as BookingWithSensorData[],
          userProfile?.role
        );
        setBookings(filteredBookings);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("useBookings fetchBookings error:", err);
    } finally {
      setLoading(false);
    }
  }, [includeSensorData, userProfile?.role]);

  const handleBookingUpdate = useCallback(
    (payload: { eventType: string }) => {
      if (payload.eventType === "INSERT") {
        // Refetch bookings when new bookings are added
        fetchBookings();
      }
    },
    [fetchBookings]
  );

  const handleSensorUpdate = useCallback(
    (payload: { eventType: string; new?: SensorReading }) => {
      if (payload.eventType === "INSERT" && payload.new) {
        const newReading = payload.new as SensorReading;

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.room_id === newReading.room_id
              ? {
                  ...booking,
                  currentOccupancy: newReading.occupancy,
                  currentTemperature: newReading.temperature ?? undefined,
                  currentNoiseLevel: newReading.noise_level ?? undefined,
                  currentAirQuality: newReading.air_quality ?? undefined,
                  lastSensorUpdate: newReading.timestamp,
                }
              : booking
          )
        );
      }
    },
    []
  );

  // Memoized filtering functions
  const filterByStatus = useCallback(
    (status: BookingStatus) => {
      return bookingsApi.filterBookingsByStatus(bookings, status);
    },
    [bookings]
  );

  const getStatusCounts = useCallback(() => {
    return bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<BookingStatus, number>);
  }, [bookings]);

  useEffect(() => {
    fetchBookings();

    let bookingChannelId: string | null = null;
    let sensorChannelId: string | null = null;

    if (enableRealtime) {
      // Subscribe to booking changes
      bookingChannelId = realtimeManager.subscribe(
        "room_bookings",
        handleBookingUpdate,
        `bookings-updates-${Date.now()}`
      );

      // Subscribe to sensor changes if sensor data is enabled
      if (includeSensorData) {
        sensorChannelId = realtimeManager.subscribe(
          "sensor_readings",
          handleSensorUpdate,
          `bookings-sensor-updates-${Date.now()}`
        );
      }
    }

    return () => {
      if (bookingChannelId) {
        realtimeManager.unsubscribe(bookingChannelId);
      }
      if (sensorChannelId) {
        realtimeManager.unsubscribe(sensorChannelId);
      }
    };
  }, [
    fetchBookings,
    enableRealtime,
    includeSensorData,
    handleBookingUpdate,
    handleSensorUpdate,
  ]);

  return {
    bookings,
    loading,
    error,
    filterByStatus,
    getStatusCounts,
    refetch: fetchBookings,
  };
}
