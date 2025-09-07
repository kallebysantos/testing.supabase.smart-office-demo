import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { RoomData } from "@/lib/fakefloorplan";

interface SensorReading {
  room_id: string;
  occupancy: number;
  temperature: number;
  noise_level: number;
  air_quality: number;
  timestamp: string;
}

interface RoomInfo {
  id: string;
  name: string;
  capacity: number;
}

export function useRealtimeRoomData(rooms: RoomData[]) {
  const [roomData, setRoomData] = useState<RoomData[]>(rooms);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get conference rooms with roomId
    const conferenceRooms = rooms.filter(
      (room) => room.type === "conference" && room.roomId
    );

    if (conferenceRooms.length === 0) return;

    // Set up real-time subscription for sensor_readings
    const channel = supabase
      .channel("room-sensor-data")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_readings",
          filter: `room_id=in.(${conferenceRooms
            .map((r) => r.roomId)
            .join(",")})`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);

          // Fetch latest data for all conference rooms
          const { data: latestReadings, error } = await supabase
            .from("sensor_readings")
            .select(
              `
              room_id,
              occupancy,
              temperature,
              noise_level,
              air_quality,
              timestamp
            `
            )
            .in(
              "room_id",
              conferenceRooms.map((r) => r.roomId!)
            )
            .order("timestamp", { ascending: false });

          if (error) {
            console.error("Error fetching latest readings:", error);
            return;
          }

          // Update room data with latest sensor readings
          setRoomData((prevRooms) =>
            prevRooms.map((room) => {
              if (room.type === "conference" && room.roomId) {
                const latestReading = latestReadings?.find(
                  (reading) => reading.room_id === room.roomId
                );

                if (latestReading) {
                  return {
                    ...room,
                    occupancy: latestReading.occupancy,
                    temperature: Number(latestReading.temperature),
                    noiseLevel: Number(latestReading.noise_level),
                    airQuality: latestReading.air_quality,
                  };
                }
              }
              return room;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    // Initial data fetch
    const fetchInitialData = async () => {
      const { data: latestReadings, error } = await supabase
        .from("sensor_readings")
        .select(
          `
          room_id,
          occupancy,
          temperature,
          noise_level,
          air_quality,
          timestamp
        `
        )
        .in(
          "room_id",
          conferenceRooms.map((r) => r.roomId!)
        )
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching initial readings:", error);
        return;
      }

      // Update room data with initial sensor readings
      setRoomData((prevRooms) =>
        prevRooms.map((room) => {
          if (room.type === "conference" && room.roomId) {
            const latestReading = latestReadings?.find(
              (reading) => reading.room_id === room.roomId
            );

            if (latestReading) {
              return {
                ...room,
                occupancy: latestReading.occupancy,
                temperature: Number(latestReading.temperature),
                noiseLevel: Number(latestReading.noise_level),
                airQuality: latestReading.air_quality,
              };
            }
          }
          return room;
        })
      );
    };

    fetchInitialData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rooms, supabase]);

  return { roomData, isConnected };
}
