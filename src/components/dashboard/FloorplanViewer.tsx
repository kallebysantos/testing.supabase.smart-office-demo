"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Users, Thermometer, Volume2, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  amenities: string[];
  image_url: string | null;
}

interface SensorReading {
  room_id: string;
  occupancy: number;
  temperature: number;
  noise_level: number;
  air_quality: number;
  last_updated: string;
}

interface FloorplanViewerProps {
  className?: string;
  debugMode?: boolean;
  buildingDetails: {
    building: string,
    floor: number
  }
}

// These are percentage-based positions (0-100) relative to image dimensions
// This makes them responsive to any container size
const ROOM_POSITIONS = [
  { name: "Conference Room 1", x: 65.2, y: 51.9 },  // 227/1600 * 100, 695/800 * 100
  { name: "Conference Room 2", x: 29.2, y: 53.1 },  // 1205/1600 * 100, 625/800 * 100
  { name: "Conference Room 3", x: 73.7, y: 55.9 },  // 1435/1600 * 100, 675/800 * 100
  { name: "Conference Room 4", x: 69.0, y: 62.1 },  // 1300/1600 * 100, 740/800 * 100
];

export function FloorplanViewer({ buildingDetails, className = "" }: FloorplanViewerProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sensorData, setSensorData] = useState<Map<string, SensorReading>>(new Map());
  const [loading, setLoading] = useState(true);
  // const [showDebug, setShowDebug] = useState(debugMode);
  // const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, [buildingDetails])

  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRooms = async () => {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq('building', buildingDetails.building)
        .eq('floor', buildingDetails.floor)
        .limit(4)
        .order("id");

      if (roomsError) throw roomsError;

      if (roomsData) {
        setRooms(roomsData);

        const { data: sensorReadings, error: sensorError } = await supabase
          .from("sensor_readings")
          .select("*")
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          .in("room_id", roomsData.map((r: any) => r.id))
          .order("timestamp", { ascending: false });

        if (sensorError) throw sensorError;

        if (sensorReadings) {
          const latestReadings = new Map<string, SensorReading>();
          /* eslint-disable @typescript-eslint/no-explicit-any */
          (sensorReadings as any[]).forEach((reading: any) => {
            if (!latestReadings.has(reading.room_id)) {
              latestReadings.set(reading.room_id, reading);
            }
          });
          /* eslint-enable @typescript-eslint/no-explicit-any */
          setSensorData(latestReadings);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log("🔄 FloorplanViewer: Setting up real-time subscription...");

    const channel = supabase
      .channel("floorplan-sensor-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          console.log("📊 FloorplanViewer: Received sensor update:", payload);

          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newReading = payload.new as SensorReading;

            setSensorData(prev => {
              const updated = new Map(prev);
              updated.set(newReading.room_id, newReading);

              // Log which room was updated
              const room = rooms.find(r => r.id === newReading.room_id);
              if (room) {
                console.log(`✅ Updated ${room.name}: ${newReading.occupancy}/${room.capacity} occupancy`);
              }

              return updated;
            });

            // Add visual feedback for updated room
            setRecentlyUpdated(prev => new Set(prev).add(newReading.room_id));

            // Remove the glow effect after 3 seconds
            setTimeout(() => {
              setRecentlyUpdated(prev => {
                const newSet = new Set(prev);
                newSet.delete(newReading.room_id);
                return newSet;
              });
            }, 3000);
          }
        }
      )
      .subscribe((status) => {
        console.log("FloorplanViewer real-time subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log("✅ FloorplanViewer: Real-time subscription active");
          setRealtimeStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ FloorplanViewer: Real-time subscription failed");
          setRealtimeStatus("disconnected");
        } else if (status === "TIMED_OUT") {
          console.warn("⚠️ FloorplanViewer: Real-time subscription timed out");
          setRealtimeStatus("disconnected");
        } else if (status === "CLOSED") {
          console.log("📴 FloorplanViewer: Real-time subscription closed");
          setRealtimeStatus("disconnected");
        }
      });

    return channel;
  };

  const getRoomStatus = (room: Room): "available" | "occupied" | "over-capacity" => {
    const sensor = sensorData.get(room.id);
    if (!sensor) return "available";

    if (sensor.occupancy === 0) return "available";
    if (sensor.occupancy > room.capacity) return "over-capacity";
    return "occupied";
  };

  const getStatusColor = (status: "available" | "occupied" | "over-capacity") => {
    switch (status) {
      case "available":
        return "bg-green-500 shadow-green-500/50";
      case "occupied":
        return "bg-yellow-500 shadow-yellow-500/50";
      case "over-capacity":
        return "bg-red-500 shadow-red-500/50 animate-pulse";
    }
  };

  const getStatusBadgeVariant = (status: "available" | "occupied" | "over-capacity") => {
    switch (status) {
      case "available":
        return "secondary" as const;
      case "occupied":
        return "default" as const;
      case "over-capacity":
        return "destructive" as const;
    }
  };

  // const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (!showDebug || !containerRef.current) return;
  //
  //   const rect = containerRef.current.getBoundingClientRect();
  //   const x = ((e.clientX - rect.left) / rect.width) * 100;
  //   const y = ((e.clientY - rect.top) / rect.height) * 100;
  //
  //   setClickPosition({ x, y });
  //   console.log(`Clicked at: ${x.toFixed(1)}%, ${y.toFixed(1)}%`);
  // };

  if (loading) {
    return (
      <div className={`relative w-full max-w-4xl mx-auto h-[400px] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading floorplan...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
        {/* Real-time Status Indicator */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${realtimeStatus === "connected" ? "bg-green-500 animate-pulse" :
              realtimeStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                "bg-red-500"
              }`} />
            <span className="text-sm text-gray-600">
              {realtimeStatus === "connected" ? "Live updates active" :
                realtimeStatus === "connecting" ? "Connecting..." :
                  "Offline"}
            </span>
          </div>
        </div>

        {/* Debug Controls */}
        {/* <div className="mb-2 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2"
          >
            <Crosshair className="h-4 w-4" />
            {showDebug ? "Hide" : "Show"} Coordinate Helper
          </Button>
          {showDebug && clickPosition && (
            <div className="text-sm text-gray-600">
              Last click: {clickPosition.x.toFixed(1)}%, {clickPosition.y.toFixed(1)}%
            </div>
          )}
        </div> */}

        {/* Floorplan Container - 50% smaller (max-w-4xl instead of full width) */}
        <div
          ref={containerRef}
          className="relative w-full h-[400px] bg-white rounded-lg overflow-hidden border border-gray-200"
        >
          <Image
            src="/images/fakefloorplan.png"
            alt="Office Floorplan"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-contain"
            priority
          />

          {rooms.map((room, index) => {
            const position = ROOM_POSITIONS[index];
            const status = getRoomStatus(room);
            const sensor = sensorData.get(room.id);
            const isRecentlyUpdated = recentlyUpdated.has(room.id);

            return (
              <Tooltip key={room.id}>
                <TooltipTrigger asChild>
                  <div className="absolute flex h-4 w-4" style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}>
                    <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", getStatusColor(status), isRecentlyUpdated ? "animate-ping" : "")}></span>
                    <span className={cn("relative inline-flex rounded-full h-4 w-4", getStatusColor(status))}></span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-white/95 backdrop-blur-sm border-gray-200 p-3 min-w-[250px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {status === "over-capacity" ? "Over Capacity" : status}
                      </Badge>
                    </div>

                    {sensor && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{sensor.occupancy}/{room.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Thermometer className="h-3 w-3" />
                          <span>{sensor.temperature}°F</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Volume2 className="h-3 w-3" />
                          <span>{sensor.noise_level} dB</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Wind className="h-3 w-3" />
                          <span>{sensor.air_quality} AQI</span>
                        </div>
                      </div>
                    )}

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="pt-1 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Floor {room.floor} • Last updated: {sensor ? new Date(sensor.last_updated).toLocaleTimeString() : "N/A"}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Debug Overlay - Shows click position */}
          {/* {showDebug && clickPosition && (
            <div
              className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-20"
              style={{
                left: `${clickPosition.x}%`,
                top: `${clickPosition.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )} */}
        </div>

        {/* Instructions for Debug Mode */}
        {/* {showDebug && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">📍 Coordinate Helper Mode</p>
            <p>Click anywhere on the floorplan to get the percentage-based coordinates.</p>
            <p>These coordinates will remain accurate regardless of browser size.</p>
          </div>
        )} */}
      </div>
    </TooltipProvider>
  );
};
