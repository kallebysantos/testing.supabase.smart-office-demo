/**
 * useRooms Hook - Manages room data and real-time updates
 *
 * Provides a clean interface for fetching rooms with sensor data
 * and subscribing to real-time updates with proper cleanup
 */

import { useState, useEffect, useCallback } from "react";
import { roomsApi } from "@/lib/api/rooms";
import { realtimeManager } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { filterRoomsByAccess } from "@/lib/utils/rls-filter";
import type { RoomWithSensorData, SensorReading } from "@/types";

interface UseRoomsOptions {
  enableRealtime?: boolean;
  refetchInterval?: number;
}

interface UseRoomsReturn {
  rooms: RoomWithSensorData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRooms(options: UseRoomsOptions = {}): UseRoomsReturn {
  const { enableRealtime = true, refetchInterval } = options;
  const { userProfile } = useAuth();

  const [rooms, setRooms] = useState<RoomWithSensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await roomsApi.getRoomsWithSensorData();

      if (response.success && response.data) {
        // Apply RLS filtering based on user's floor access
        const filteredRooms = filterRoomsByAccess(response.data, userProfile);
        setRooms(filteredRooms);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch rooms");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("useRooms fetchRooms error:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const handleSensorUpdate = useCallback(
    (payload: { eventType: string; new?: SensorReading }) => {
      if (payload.eventType === "INSERT" && payload.new) {
        const newReading = payload.new as SensorReading;

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === newReading.room_id
              ? {
                  ...room,
                  currentOccupancy: newReading.occupancy,
                  currentTemperature: newReading.temperature,
                  currentNoiseLevel: newReading.noise_level,
                  currentAirQuality: newReading.air_quality,
                  lastUpdated: newReading.timestamp,
                  status: determineRoomStatus(
                    newReading.occupancy,
                    room.capacity
                  ),
                }
              : room
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    fetchRooms();

    let realtimeChannelId: string | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    // Set up real-time subscription
    if (enableRealtime) {
      realtimeChannelId = realtimeManager.subscribe(
        "sensor_readings",
        handleSensorUpdate,
        `rooms-sensor-updates-${Date.now()}`
      );
    }

    // Set up polling interval if specified
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(fetchRooms, refetchInterval);
    }

    return () => {
      if (realtimeChannelId) {
        realtimeManager.unsubscribe(realtimeChannelId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchRooms, enableRealtime, refetchInterval, handleSensorUpdate]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
  };
}

/**
 * Helper function to determine room status
 */
function determineRoomStatus(occupancy?: number, capacity?: number) {
  if (occupancy === undefined || capacity === undefined) return "unknown";
  if (occupancy === 0) return "available";
  if (occupancy >= capacity) return "full";
  return "occupied";
}
