'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import type { SensorReading } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Users, Calendar, Activity, Thermometer, AlertTriangle, TrendingUp, Volume2, Wind, RefreshCw } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FloorplanViewer } from '@/components/dashboard/FloorplanViewer'

interface DashboardMetrics {
  availableRooms: number
  roomsAboveCapacity: number
  averageTemperature: number
  averageNoiseLevel: number
  averageAirQuality: number
  averageUtilization: number
  totalRooms: number
}

interface RoomActivity {
  room_name: string
  action: string
  time_ago: string
  created_at: string
}

interface HighUtilizationRoom {
  name: string
  occupancy: number
  capacity: number
  utilization_percentage: number
  temperature: number | null
}

interface BuildingDetails {
  building: string
  floors: number[]
}

// Memoized components to prevent unnecessary re-renders
const MetricCard = memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: {
    title: string
    value: string | number
    subtitle: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
)
MetricCard.displayName = 'MetricCard'

const ActivityItem = memo(({ activity }: { activity: RoomActivity }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <Calendar className="h-4 w-4 text-blue-500" />
      <div>
        <p className="text-sm font-medium text-gray-900">{activity.room_name}</p>
        <p className="text-xs text-gray-500">{activity.action}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400">{activity.time_ago}</span>
  </div>
))
ActivityItem.displayName = 'ActivityItem'

const HighUtilizationRoomItem = memo(({ room }: { room: HighUtilizationRoom }) => (
  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-red-600" />
        <p className="text-sm font-medium text-gray-900">{room.name}</p>
      </div>
      <Badge variant="destructive" className="text-xs">
        {room.utilization_percentage}%
      </Badge>
    </div>
    <div className="flex items-center justify-between text-xs text-gray-600">
      <span>
        {room.occupancy}/{room.capacity} people
      </span>
      {room.temperature && <span>{room.temperature}°F</span>}
    </div>
    <Progress value={Math.min(room.utilization_percentage, 100)} className="mt-2 h-2 bg-red-600" />
  </div>
))
HighUtilizationRoomItem.displayName = 'HighUtilizationRoomItem'

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RoomActivity[]>([])
  const [highUtilizationRooms, setHighUtilizationRooms] = useState<HighUtilizationRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [buildings, setBuildings] = useState<BuildingDetails[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>()
  const [selectedFloor, setSelectedFloor] = useState<number>()

  // Throttle real-time updates to prevent excessive re-renders
  const lastUpdateRef = useRef<number>(0)
  const UPDATE_THROTTLE_MS = 2000 // Only allow updates every 2 seconds

  // Memoized handlers to prevent unnecessary re-renders
  const handleSelectBuilding = useCallback(
    (building: string) => {
      const selectedBuilding = buildings.find((b) => b.building === building)
      if (!selectedBuilding) return

      setSelectedBuilding(selectedBuilding.building)
      setSelectedFloor(selectedBuilding.floors.at(0))
    },
    [buildings]
  )

  const handleSelectFloor = useCallback((floorStr: string) => {
    const floor = Number.parseInt(floorStr)
    setSelectedFloor(floor)
  }, [])

  const fetchBuildingsData = useCallback(async () => {
    try {
      const { data } = await supabase.from('building_details').select('building, floors')

      const buildingsData = data as BuildingDetails[]
      setBuildings(buildingsData)

      const defaultBuilding = buildingsData?.at(0)

      if (defaultBuilding) {
        setSelectedBuilding(defaultBuilding.building)
        setSelectedFloor(defaultBuilding.floors.at(0))
      }
    } catch (error) {
      console.error('Error fetching buildings data:', error)
    }
  }, [])

  // Helper function to calculate time ago
  const getTimeAgo = useCallback((timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }, [])

  // Memoized calculation function to prevent unnecessary recalculations
  const calculateMetrics = useCallback((sensorData: SensorReading[], roomsData: { id: string; name: string; capacity: number }[]) => {
    const totalRooms = roomsData?.length || 0
    let availableRooms = 0
    let roomsAboveCapacity = 0
    let averageTemperature = 0
    let averageNoiseLevel = 0
    let averageAirQuality = 0
    let averageUtilization = 0

    const highUtilRooms: HighUtilizationRoom[] = []

    if (sensorData && roomsData) {
      // Create map of latest readings per room
      const latestReadings = new Map<string, SensorReading>()
      if (Array.isArray(sensorData)) {
        sensorData.forEach((reading: SensorReading) => {
          if (!reading.room_id) return
          if (
            !latestReadings.has(reading.room_id) ||
            (latestReadings.has(reading.room_id) && new Date(reading.timestamp) > new Date(latestReadings.get(reading.room_id)!.timestamp))
          ) {
            latestReadings.set(reading.room_id, reading)
          }
        })
      }

      let totalTemperature = 0
      let totalNoiseLevel = 0
      let totalAirQuality = 0
      let totalUtilization = 0
      let temperatureReadings = 0
      let noiseReadings = 0
      let airQualityReadings = 0

      roomsData.forEach((room: { id: string; name: string; capacity: number }) => {
        const latestReading = latestReadings.get(room.id)
        const occupancy = latestReading?.occupancy || 0
        const temperature = latestReading?.temperature || 72
        const noiseLevel = latestReading?.noise_level || 45
        const airQuality = latestReading?.air_quality || 82
        const utilization = room.capacity > 0 ? (occupancy / room.capacity) * 100 : 0

        if (occupancy === 0) availableRooms++
        if (occupancy > room.capacity) roomsAboveCapacity++

        totalTemperature += temperature
        temperatureReadings++
        totalNoiseLevel += noiseLevel
        noiseReadings++
        totalAirQuality += airQuality
        airQualityReadings++
        totalUtilization += utilization

        if (utilization >= 90) {
          highUtilRooms.push({
            name: room.name,
            occupancy,
            capacity: room.capacity,
            utilization_percentage: Math.round(utilization),
            temperature,
          })
        }
      })

      if (temperatureReadings > 0) {
        averageTemperature = Math.round(totalTemperature / temperatureReadings)
      }
      if (noiseReadings > 0) {
        averageNoiseLevel = Math.round(totalNoiseLevel / noiseReadings)
      }
      if (airQualityReadings > 0) {
        averageAirQuality = Math.round(totalAirQuality / airQualityReadings)
      }
      if (roomsData.length > 0) {
        averageUtilization = Math.round(totalUtilization / roomsData.length)
      }
    } else {
      availableRooms = totalRooms
      averageTemperature = 72
      averageNoiseLevel = 45
      averageAirQuality = 82
      averageUtilization = 0
    }

    return {
      metrics: {
        availableRooms,
        roomsAboveCapacity,
        averageTemperature,
        averageNoiseLevel,
        averageAirQuality,
        averageUtilization,
        totalRooms,
      },
      highUtilRooms: highUtilRooms.slice(0, 5),
    }
  }, [])

  // Fetch real-time metrics from Supabase
  const fetchDashboardData = useCallback(
    async (showLoading = false) => {
      console.log('fetchDashboardData')
      try {
        if (showLoading) {
          setIsLoading(true)
        }

        // Fetch data in parallel
        const [roomsResult, sensorResult, bookingsResult] = await Promise.allSettled([
          supabase.from('rooms').select('id, name, capacity'),
          supabase.from('sensor_readings').select('*').order('timestamp', { ascending: false }).limit(100),
          supabase.from('room_bookings').select('title, created_at, room_id').order('created_at', { ascending: false }).limit(4),
        ])

        const roomsData = roomsResult.status === 'fulfilled' ? roomsResult.value.data : null
        const sensorData = sensorResult.status === 'fulfilled' ? sensorResult.value.data : null
        const bookingsData = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data : null

        if (roomsResult.status === 'rejected') {
          throw roomsResult.reason
        }

        // Calculate metrics
        const { metrics, highUtilRooms } = calculateMetrics(sensorData || [], roomsData || [])

        // Process activity data
        let activity: RoomActivity[] = []
        if (bookingsData && roomsData) {
          const roomsMap = new Map(roomsData.map((room: { id: string; name: string }) => [room.id, room.name]))
          activity = bookingsData.map((booking: { title: string; created_at: string; room_id: string }) => ({
            room_name: roomsMap.get(booking.room_id) || 'Unknown Room',
            action: `Meeting: "${booking.title}"`,
            time_ago: getTimeAgo(booking.created_at),
            created_at: booking.created_at,
          }))
        }

        // Batch all state updates together to minimize re-renders
        setMetrics(metrics)
        setHighUtilizationRooms(highUtilRooms)
        setRecentActivity(activity)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching dashboard data:', error)

        // Set fallback data
        setMetrics({
          availableRooms: 0,
          roomsAboveCapacity: 0,
          averageTemperature: 72,
          averageNoiseLevel: 45,
          averageAirQuality: 82,
          averageUtilization: 0,
          totalRooms: 0,
        })
        setRecentActivity([])
        setHighUtilizationRooms([])
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    },
    [getTimeAgo, calculateMetrics]
  )

  // Throttled version of fetchDashboardData for real-time updates
  const throttledFetchDashboardData = useCallback(
    (showLoading = false) => {
      const now = Date.now()
      if (now - lastUpdateRef.current < UPDATE_THROTTLE_MS) {
        return // Throttled - too soon since last update
      }
      lastUpdateRef.current = now
      fetchDashboardData(showLoading)
    },
    [fetchDashboardData]
  )

  // Memoized real-time subscription setup
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_readings',
        },
        () => {
          throttledFetchDashboardData(false)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_bookings',
        },
        () => {
          throttledFetchDashboardData(false)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('disconnected')
        }
      })

    return channel
  }, [throttledFetchDashboardData])

  // Initial data load and real-time setup
  useEffect(() => {
    // Initial load with loading indicator
    fetchDashboardData(true)
    fetchBuildingsData()

    // Set up real-time subscription
    const channel = setupRealtimeSubscription()

    // Fallback: refresh every 30 seconds if real-time fails
    const interval = setInterval(() => {
      throttledFetchDashboardData(false)
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchDashboardData, fetchBuildingsData, setupRealtimeSubscription, throttledFetchDashboardData])

  // Memoized values to prevent unnecessary re-renders
  const lastUpdatedText = useMemo(() => {
    return lastUpdated ? getTimeAgo(lastUpdated.toISOString()) : ''
  }, [lastUpdated, getTimeAgo])

  const selectedBuildingFloors = useMemo(() => {
    return buildings.find((b) => b.building === selectedBuilding)?.floors || []
  }, [buildings, selectedBuilding])

  const refreshHandler = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !userProfile || !metrics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />

      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
                <p className="text-gray-600 mt-2">Real-time conference room utilization across all buildings</p>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      realtimeStatus === 'connected'
                        ? 'bg-green-500 animate-pulse'
                        : realtimeStatus === 'connecting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {realtimeStatus === 'connected'
                      ? 'Live Data'
                      : realtimeStatus === 'connecting'
                      ? 'Connecting...'
                      : 'Offline (30s refresh)'}

                    {lastUpdated && <span className="ml-2 text-xs  text-gray-400">• Updated {lastUpdatedText}</span>}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={refreshHandler} disabled={isLoading} className="flex items-center space-x-1">
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="mr-2">
                {userProfile.department}
              </Badge>
              <Badge variant="secondary">{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</Badge>
            </div>
          </div>

          {/* 3D Floor Model - Demo Showcase */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div className="flex items-center space-x-2">
                  <Select value={selectedBuilding} onValueChange={handleSelectBuilding}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map(({ building }) => (
                        <SelectItem key={building} value={building.toString()}>
                          {building}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500">-</span>
                  <Select value={selectedFloor?.toString()} onValueChange={handleSelectFloor}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBuildingFloors.map((floor) => (
                        <SelectItem key={floor} value={floor.toString()}>
                          Floor {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBuilding && selectedFloor && (
                <FloorplanViewer buildingDetails={{ building: selectedBuilding, floor: selectedFloor }} className="w-full" />
              )}
            </CardContent>
          </Card>

          {/* Real-time Metrics Grid - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Currently Available"
              value={metrics.availableRooms}
              subtitle={`of ${metrics.totalRooms} conference rooms`}
              icon={Building2}
              color="text-green-600"
            />

            <MetricCard
              title="Above Capacity"
              value={metrics.roomsAboveCapacity}
              subtitle="rooms over limit"
              icon={AlertTriangle}
              color="text-red-600"
            />

            <MetricCard
              title="Current Utilization"
              value={`${metrics.averageUtilization}%`}
              subtitle="average occupancy rate"
              icon={TrendingUp}
              color="text-blue-600"
            />
          </div>

          {/* Environmental Metrics Grid - Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Average Temperature"
              value={`${metrics.averageTemperature}°F`}
              subtitle="across all rooms"
              icon={Thermometer}
              color="text-orange-600"
            />

            <MetricCard
              title="Average Air Quality"
              value={`${metrics.averageAirQuality}/100`}
              subtitle="air quality index"
              icon={Wind}
              color="text-green-600"
            />

            <MetricCard
              title="Average Noise Level"
              value={`${metrics.averageNoiseLevel} dB`}
              subtitle="across all rooms"
              icon={Volume2}
              color="text-purple-600"
            />
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
                    recentActivity.map((activity, index) => <ActivityItem key={index} activity={activity} />)
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
                    highUtilizationRooms.map((room, index) => <HighUtilizationRoomItem key={index} room={room} />)
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">All rooms operating within capacity</p>
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
                  <h4 className="font-medium text-gray-900 mb-3">Floor Access</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.floor_access?.map((floor) => (
                      <Badge key={floor} variant="outline" className="text-xs">
                        Floor {floor}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No floor access configured</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Available Features</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>✓ Real-time occupancy monitoring</p>
                    <p>✓ Capacity violation alerts</p>
                    {userProfile.role !== 'employee' && (
                      <>
                        <p>✓ Utilization analytics</p>
                        <p>✓ Executive dashboards</p>
                      </>
                    )}
                    {userProfile.role === 'admin' && <p>✓ System administration</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
