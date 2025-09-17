"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { RoomCard } from "./RoomCard";
import RoomFilters from "./RoomFilters";
import StatusBar from "./StatusBar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Room,
  SensorReading,
  RoomStatus,
  FilterOptions,
  SortOption,
  SortOrder,
  AvailabilityStatus,
} from "@/types/room";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Building2,
} from "lucide-react";

interface RoomGridProps {
  initialRooms?: Room[];
}

export default function RoomGrid({ initialRooms = [] }: RoomGridProps) {
  // State management
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(!initialRooms.length);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Filters and sorting
  const [filters, setFilters] = useState<FilterOptions>({
    floor: "all",
    availability: "all",
    building: "all",
  });
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (initialRooms.length > 0) {
        await fetchLatestSensorReadings();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*")
          .order("building", { ascending: true })
          .order("floor", { ascending: true })
          .order("name", { ascending: true });

        if (roomsError) throw roomsError;

        setRooms(roomsData || []);

        // Fetch latest sensor readings
        await fetchLatestSensorReadings();
      } catch (err) {
        console.error("Error fetching initial data:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        setError("Failed to load rooms data. Please check the database setup.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [initialRooms]);

  // Fetch latest sensor readings for all rooms
  const fetchLatestSensorReadings = async () => {
    try {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Get the latest reading for each room
      const latestReadings: SensorReading[] = [];
      const roomReadingMap = new Map<string, SensorReading>();

      /* eslint-disable @typescript-eslint/no-explicit-any */
      (data as any[])?.forEach((reading: any) => {
        if (reading.room_id && !roomReadingMap.has(reading.room_id)) {
          roomReadingMap.set(reading.room_id, reading);
          latestReadings.push(reading);
        }
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setSensorReadings(latestReadings);
      setLastUpdate(new Date().toISOString());
      setIsConnected(true);
    } catch (err) {
      console.error("Error fetching sensor readings:", err);
      console.error("Sensor error details:", JSON.stringify(err, null, 2));
      setIsConnected(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("sensor-readings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          console.log("Real-time sensor update:", payload);

          if (payload.eventType === "INSERT" && payload.new) {
            const newReading = payload.new as SensorReading;

            setSensorReadings((prevReadings) => {
              // Update or add the reading for this room
              const updatedReadings = prevReadings.filter(
                (r) => r.room_id !== newReading.room_id
              );
              return [...updatedReadings, newReading];
            });

            setLastUpdate(new Date().toISOString());
            setIsConnected(true);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchLatestSensorReadings();
  };

  // Create room statuses from rooms and sensor readings
  const roomStatuses: RoomStatus[] = useMemo(() => {
    return rooms.map((room) => {
      const latestReading = sensorReadings.find(
        (reading) => reading.room_id === room.id
      );

      const occupancy = latestReading?.occupancy || 0;
      const getAvailability = (): AvailabilityStatus => {
        if (occupancy === 0) return "available";
        return "occupied";
      };

      return {
        room,
        occupancy,
        temperature: latestReading?.temperature || null,
        noise_level: latestReading?.noise_level || null,
        air_quality: latestReading?.air_quality || null,
        availability: getAvailability(),
        last_updated: latestReading?.timestamp || "",
      };
    });
  }, [rooms, sensorReadings]);

  // Filter and sort room statuses
  const filteredAndSortedRoomStatuses = useMemo(() => {
    let filtered = roomStatuses;

    // Apply filters
    if (filters.building !== "all") {
      filtered = filtered.filter((rs) => rs.room.building === filters.building);
    }
    if (filters.floor !== "all") {
      filtered = filtered.filter((rs) => rs.room.floor === filters.floor);
    }
    if (filters.availability !== "all") {
      filtered = filtered.filter(
        (rs) => rs.availability === filters.availability
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.room.name.toLowerCase();
          bValue = b.room.name.toLowerCase();
          break;
        case "floor":
          aValue = a.room.floor;
          bValue = b.room.floor;
          break;
        case "occupancy":
          aValue = a.occupancy;
          bValue = b.occupancy;
          break;
        case "temperature":
          aValue = a.temperature || 0;
          bValue = b.temperature || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [roomStatuses, filters, sortBy, sortOrder]);

  // Get unique values for filters
  const availableFloors = useMemo(
    () => [...new Set(rooms.map((room) => room.floor))],
    [rooms]
  );
  const availableBuildings = useMemo(
    () => [...new Set(rooms.map((room) => room.building))],
    [rooms]
  );

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy: SortOption, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleClearFilters = () => {
    setFilters({
      floor: "all",
      availability: "all",
      building: "all",
    });
    setSortBy("name");
    setSortOrder("asc");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <StatusBar
        roomStatuses={roomStatuses}
        lastUpdate={lastUpdate}
        isConnected={isConnected}
      />

      {/* Filters */}
      <RoomFilters
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        availableFloors={availableFloors}
        availableBuildings={availableBuildings}
        totalRooms={roomStatuses.length}
        filteredCount={filteredAndSortedRoomStatuses.length}
      />

      {/* Connection Status Alert */}
      {!isConnected && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between text-yellow-800">
            <span>Real-time connection lost. Data may be outdated.</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Room Grid */}
      {filteredAndSortedRoomStatuses.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            No rooms found
          </p>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or check back later.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedRoomStatuses.map((roomStatus) => (
            <div
              key={roomStatus.room.id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <RoomCard room={roomStatus.room as any} />
            </div>
          ))}
        </div>
      )}

      {/* Real-time Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg border ${
            isConnected
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${
              isConnected ? "text-green-800" : "text-red-800"
            }`}
          >
            {isConnected ? "Live" : "Offline"}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
