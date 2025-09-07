"use client";

import { useAuth } from "@/contexts/AuthContext";
import NavigationMenu from "@/components/navigation/NavigationMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Calendar,
  Activity,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Volume2,
  Wind,
  RefreshCw,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { FloorModel3D } from "@/components/dashboard/FloorModel3D";
import { generateFloorplan } from "@/lib/fakefloorplan";
import { useRealtimeRoomData } from "@/hooks/useRealtimeRoomData";

interface DashboardMetrics {
  availableRooms: number;
  roomsAboveCapacity: number;
  averageTemperature: number;
  averageNoiseLevel: number;
  averageAirQuality: number;
  averageUtilization: number;
  totalRooms: number;
}

interface RoomActivity {
  room_name: string;
  action: string;
  time_ago: string;
  created_at: string;
}

interface HighUtilizationRoom {
  name: string;
  occupancy: number;
  capacity: number;
  utilization_percentage: number;
  temperature: number | null;
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RoomActivity[]>([]);
  const [highUtilizationRooms, setHighUtilizationRooms] = useState<
    HighUtilizationRoom[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("2");
  const [selectedFloor, setSelectedFloor] = useState("12");

  // Generate floorplan data with real-time metrics integration - All rooms
  const initialFloorplanData = useMemo(() => {
    return generateFloorplan();
  }, []);

  // Use real-time room data hook for conference rooms
  const { roomData: realtimeRoomData, isConnected: roomDataConnected } =
    useRealtimeRoomData(initialFloorplanData.rooms);

  const floorplanData = useMemo(() => {
    return {
      ...initialFloorplanData,
      rooms: realtimeRoomData,
    };
  }, [initialFloorplanData, realtimeRoomData]);

  // Fetch real-time metrics from Supabase
  const fetchDashboardData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      // Get rooms first
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, name, capacity");

      if (roomsError) throw roomsError;

      // Get latest sensor readings per room using a more efficient query
      const { data: sensorData, error: sensorError } = (await supabase.rpc(
        "get_latest_sensor_readings"
      )) as {
        data: Array<{
          room_id: string;
          occupancy: number;
          temperature: number;
          noise_level: number;
          air_quality: number;
          reading_timestamp: string;
        }> | null;
        error: any;
      };

      if (sensorError) {
        console.warn("Error fetching sensor data:", sensorError);
      }

      // Calculate real metrics from database data
      const totalRooms = roomsData?.length || 0;
      let availableRooms = 0;
      let roomsAboveCapacity = 0;
      let averageTemperature = 0;
      let averageNoiseLevel = 0;
      let averageAirQuality = 0;
      let averageUtilization = 0;

      const highUtilRooms: HighUtilizationRoom[] = [];

      // Calculate metrics from real sensor data
      if (sensorData && roomsData) {
        availableRooms = 0;
        roomsAboveCapacity = 0;
        let totalTemperature = 0;
        let totalNoiseLevel = 0;
        let totalAirQuality = 0;
        let totalUtilization = 0;
        let temperatureReadings = 0;
        let noiseReadings = 0;
        let airQualityReadings = 0;

        // Create map of latest readings (RPC already returns latest per room)
        const latestReadings = new Map<
          string,
          {
            room_id: string;
            occupancy: number;
            temperature: number;
            noise_level: number;
            air_quality: number;
            reading_timestamp: string;
          }
        >();
        if (sensorData && Array.isArray(sensorData)) {
          sensorData.forEach(
            (reading: {
              room_id: string;
              occupancy: number;
              temperature: number;
              noise_level: number;
              air_quality: number;
              reading_timestamp: string;
            }) => {
              latestReadings.set(reading.room_id, reading);
            }
          );
        }

        // Debug info (remove in production)
        // console.log('Dashboard Debug:', {
        //   totalRooms: roomsData.length,
        //   totalSensorReadings: Array.isArray(sensorData) ? sensorData.length : 0,
        //   uniqueRoomReadings: latestReadings.size
        // });

        roomsData.forEach(
          (room: { id: string; name: string; capacity: number }) => {
            const latestReading = latestReadings.get(room.id);
            const occupancy = latestReading?.occupancy || 0;
            const temperature = latestReading?.temperature || 72;
            const noiseLevel = latestReading?.noise_level || 45;
            const airQuality = latestReading?.air_quality || 82;
            const utilization =
              room.capacity > 0 ? (occupancy / room.capacity) * 100 : 0;

            // Count metrics
            if (occupancy === 0) availableRooms++;
            if (occupancy > room.capacity) roomsAboveCapacity++;

            totalTemperature += temperature;
            temperatureReadings++;
            totalNoiseLevel += noiseLevel;
            noiseReadings++;
            totalAirQuality += airQuality;
            airQualityReadings++;
            totalUtilization += utilization;

            // High utilization rooms (90%+)
            if (utilization >= 90) {
              highUtilRooms.push({
                name: room.name,
                occupancy,
                capacity: room.capacity,
                utilization_percentage: Math.round(utilization),
                temperature,
              });
            }
          }
        );

        // Calculate averages
        if (temperatureReadings > 0) {
          averageTemperature = Math.round(
            totalTemperature / temperatureReadings
          );
        }
        if (noiseReadings > 0) {
          averageNoiseLevel = Math.round(totalNoiseLevel / noiseReadings);
        }
        if (airQualityReadings > 0) {
          averageAirQuality = Math.round(totalAirQuality / airQualityReadings);
        }
        if (roomsData.length > 0) {
          averageUtilization = Math.round(totalUtilization / roomsData.length);
        }
      } else {
        // If no sensor data, all rooms are available
        availableRooms = totalRooms;
        averageTemperature = 72;
        averageNoiseLevel = 45;
        averageAirQuality = 82;
        averageUtilization = 0;
      }

      const dashboardMetrics: DashboardMetrics = {
        availableRooms,
        roomsAboveCapacity,
        averageTemperature,
        averageNoiseLevel,
        averageAirQuality,
        averageUtilization,
        totalRooms,
      };

      setMetrics(dashboardMetrics);
      setHighUtilizationRooms(highUtilRooms.slice(0, 5));
      setLastUpdated(new Date());

      // Get recent bookings as activity (simplified)
      const { data: recentBookings, error: bookingsError } = await supabase
        .from("room_bookings")
        .select("title, created_at, room_id")
        .order("created_at", { ascending: false })
        .limit(4);

      if (!bookingsError && recentBookings && roomsData) {
        const roomsMap = new Map(
          roomsData.map((room: { id: string; name: string }) => [
            room.id,
            room.name,
          ])
        );
        const activity: RoomActivity[] = recentBookings.map(
          (booking: {
            title: string;
            created_at: string;
            room_id: string;
          }) => ({
            room_name: roomsMap.get(booking.room_id) || "Unknown Room",
            action: `Meeting: "${booking.title}"`,
            time_ago: getTimeAgo(booking.created_at),
            created_at: booking.created_at,
          })
        );
        setRecentActivity(activity);
      } else {
        // No recent bookings - show empty state
        setRecentActivity([]);
      }

      // Update timestamp for silent updates too
      if (!showLoading) {
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Set fallback data if there's an error - use real room count if available
      setMetrics({
        availableRooms: 0,
        roomsAboveCapacity: 0,
        averageTemperature: 72,
        averageNoiseLevel: 45,
        averageAirQuality: 82,
        averageUtilization: 0,
        totalRooms: 0,
      });

      setRecentActivity([]);
      setHighUtilizationRooms([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Real-time updates
  useEffect(() => {
    // Initial load with loading indicator
    fetchDashboardData(true);

    // Set up real-time subscription for sensor readings
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          console.log("Dashboard: sensor data updated", payload);
          // Silent update without loading indicator
          fetchDashboardData(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_bookings",
        },
        (payload) => {
          console.log("Dashboard: booking data updated", payload);
          // Silent update without loading indicator
          fetchDashboardData(false);
        }
      )
      .subscribe((status) => {
        console.log("Dashboard real-time subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Dashboard real-time subscription active");
          setRealtimeStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Dashboard real-time subscription failed");
          setRealtimeStatus("disconnected");
        } else if (status === "TIMED_OUT") {
          console.warn("⚠️ Dashboard real-time subscription timed out");
          setRealtimeStatus("disconnected");
        } else if (status === "CLOSED") {
          console.log("📴 Dashboard real-time subscription closed");
          setRealtimeStatus("disconnected");
        }
      });

    // Fallback: refresh every 30 seconds if real-time fails
    const interval = setInterval(() => {
      console.log("Dashboard: fallback refresh triggered");
      // Silent update without loading indicator
      fetchDashboardData(false);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile || !metrics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />

      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Executive Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Real-time conference room utilization across all buildings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      realtimeStatus === "connected" && roomDataConnected
                        ? "bg-green-500 animate-pulse"
                        : realtimeStatus === "connecting" || !roomDataConnected
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {realtimeStatus === "connected" && roomDataConnected
                      ? "Live Data"
                      : realtimeStatus === "connecting" || !roomDataConnected
                      ? "Connecting..."
                      : "Offline (30s refresh)"}
                    {lastUpdated && (
                      <span className="ml-2 text-xs text-gray-400">
                        • Updated {getTimeAgo(lastUpdated.toISOString())}
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDashboardData(true)}
                  disabled={isLoading}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="mr-2">
                {userProfile.department}
              </Badge>
              <Badge variant="secondary">
                {userProfile.role.charAt(0).toUpperCase() +
                  userProfile.role.slice(1)}
              </Badge>
            </div>
          </div>

          {/* 3D Floor Model - Demo Showcase */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedBuilding}
                    onValueChange={setSelectedBuilding}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 2 }, (_, i) => i + 1).map(
                        (building) => (
                          <SelectItem
                            key={building}
                            value={building.toString()}
                          >
                            Building {building}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500">-</span>
                  <Select
                    value={selectedFloor}
                    onValueChange={setSelectedFloor}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            Floor {floor}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FloorModel3D
                rooms={floorplanData.rooms}
                autoRotate={false}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Real-time Metrics Grid - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Currently Available
                </CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.availableRooms}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  of {metrics.totalRooms} conference rooms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Above Capacity
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.roomsAboveCapacity}
                </div>
                <p className="text-xs text-gray-500 mt-1">rooms over limit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current Utilization
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.averageUtilization}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  average occupancy rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Metrics Grid - Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Temperature
                </CardTitle>
                <Thermometer className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.averageTemperature}°F
                </div>
                <p className="text-xs text-gray-500 mt-1">across all rooms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Air Quality
                </CardTitle>
                <Wind className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.averageAirQuality}/100
                </div>
                <p className="text-xs text-gray-500 mt-1">air quality index</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Noise Level
                </CardTitle>
                <Volume2 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.averageNoiseLevel} dB
                </div>
                <p className="text-xs text-gray-500 mt-1">across all rooms</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Bookings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.room_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.action}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {activity.time_ago}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent bookings</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rooms Near/Above Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Rooms Near or Above Capacity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highUtilizationRooms.length > 0 ? (
                    highUtilizationRooms.map((room, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-medium text-gray-900">
                              {room.name}
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {room.utilization_percentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>
                            {room.occupancy}/{room.capacity} people
                          </span>
                          {room.temperature && (
                            <span>{room.temperature}°F</span>
                          )}
                        </div>
                        <Progress
                          value={Math.min(room.utilization_percentage, 100)}
                          className="mt-2 h-2"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        All rooms operating within capacity
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Access Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Floor Access
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.floor_access?.map((floor) => (
                      <Badge key={floor} variant="outline" className="text-xs">
                        Floor {floor}
                      </Badge>
                    )) || (
                      <span className="text-sm text-gray-500">
                        No floor access configured
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Available Features
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>✓ Real-time occupancy monitoring</p>
                    <p>✓ Capacity violation alerts</p>
                    {userProfile.role !== "employee" && (
                      <>
                        <p>✓ Utilization analytics</p>
                        <p>✓ Executive dashboards</p>
                      </>
                    )}
                    {userProfile.role === "admin" && (
                      <p>✓ System administration</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
