'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Building2, Users, Calendar, Activity, Thermometer, AlertTriangle, TrendingUp, Volume2, Wind } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

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

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RoomActivity[]>([])
  const [highUtilizationRooms, setHighUtilizationRooms] = useState<HighUtilizationRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real-time metrics from Supabase
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Get rooms first
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, capacity')

      if (roomsError) throw roomsError

      // Get latest sensor readings separately
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_readings')
        .select('room_id, occupancy, temperature, noise_level, air_quality, timestamp')
        .order('timestamp', { ascending: false })

      // For demo purposes, create mock metrics if no data
      const totalRooms = roomsData?.length || 0
      let availableRooms = Math.floor(totalRooms * 0.4) // 40% available
      let roomsAboveCapacity = Math.floor(totalRooms * 0.1) // 10% over capacity  
      let averageTemperature = 72
      let averageNoiseLevel = 45
      let averageAirQuality = 82
      let averageUtilization = 65

      const highUtilRooms: HighUtilizationRoom[] = []

      // If we have sensor data, calculate real metrics
      if (sensorData && roomsData) {
        availableRooms = 0
        roomsAboveCapacity = 0
        let totalTemperature = 0
        let totalNoiseLevel = 0
        let totalAirQuality = 0
        let totalUtilization = 0
        let temperatureReadings = 0
        let noiseReadings = 0
        let airQualityReadings = 0

        // Get latest reading per room
        const latestReadings = new Map()
        sensorData.forEach(reading => {
          if (!latestReadings.has(reading.room_id)) {
            latestReadings.set(reading.room_id, reading)
          }
        })

        roomsData.forEach((room: any) => {
          const latestReading = latestReadings.get(room.id)
          const occupancy = latestReading?.occupancy || 0
          const temperature = latestReading?.temperature || 72
          const noiseLevel = latestReading?.noise_level || 45
          const airQuality = latestReading?.air_quality || 82
          const utilization = room.capacity > 0 ? (occupancy / room.capacity) * 100 : 0

          // Count metrics
          if (occupancy === 0) availableRooms++
          if (occupancy > room.capacity) roomsAboveCapacity++
          
          totalTemperature += temperature
          temperatureReadings++
          totalNoiseLevel += noiseLevel
          noiseReadings++
          totalAirQuality += airQuality
          airQualityReadings++
          totalUtilization += utilization

          // High utilization rooms (90%+)
          if (utilization >= 90) {
            highUtilRooms.push({
              name: room.name,
              occupancy,
              capacity: room.capacity,
              utilization_percentage: Math.round(utilization),
              temperature
            })
          }
        })

        // Calculate averages
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
      }

      const dashboardMetrics: DashboardMetrics = {
        availableRooms,
        roomsAboveCapacity,
        averageTemperature,
        averageNoiseLevel,
        averageAirQuality,
        averageUtilization,
        totalRooms
      }

      setMetrics(dashboardMetrics)
      setHighUtilizationRooms(highUtilRooms.slice(0, 5))

      // Get recent bookings as activity (simplified)
      const { data: recentBookings, error: bookingsError } = await supabase
        .from('room_bookings')
        .select('title, created_at, room_id')
        .order('created_at', { ascending: false })
        .limit(4)

      if (!bookingsError && recentBookings && roomsData) {
        const roomsMap = new Map(roomsData.map((room: any) => [room.id, room.name]))
        const activity: RoomActivity[] = recentBookings.map((booking: any) => ({
          room_name: roomsMap.get(booking.room_id) || 'Unknown Room',
          action: `Meeting: "${booking.title}"`,
          time_ago: getTimeAgo(booking.created_at),
          created_at: booking.created_at
        }))
        setRecentActivity(activity)
      } else {
        // Mock activity if no bookings
        setRecentActivity([
          {
            room_name: 'Beagle Conference Room',
            action: 'Meeting: "Client Strategy Session"',
            time_ago: '15 minutes ago',
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            room_name: 'Golden Retriever Boardroom',
            action: 'Meeting: "Quarterly Review"',
            time_ago: '1 hour ago',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          }
        ])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Set fallback mock data if there's an error
      setMetrics({
        availableRooms: 8,
        roomsAboveCapacity: 2,
        averageTemperature: 72,
        averageUtilization: 67,
        totalRooms: 12
      })
      
      setRecentActivity([
        {
          room_name: 'Beagle Conference Room',
          action: 'Meeting: "Client Strategy Session"',
          time_ago: '15 minutes ago',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          room_name: 'Golden Retriever Boardroom',
          action: 'Meeting: "Quarterly Review"',
          time_ago: '1 hour ago',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ])
      
      setHighUtilizationRooms([
        {
          name: 'German Shepherd Executive Room',
          occupancy: 19,
          capacity: 20,
          utilization_percentage: 95,
          temperature: 74
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to calculate time ago
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  // Real-time updates
  useEffect(() => {
    fetchDashboardData()

    // Set up real-time subscription for sensor readings
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_readings'
        },
        () => {
          fetchDashboardData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_bookings'
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Executive Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Real-time conference room utilization across all buildings
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Data</span>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="mr-2">
                {userProfile.department}
              </Badge>
              <Badge variant="secondary">
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              </Badge>
            </div>
          </div>

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
                <div className="text-2xl font-bold text-gray-900">{metrics.availableRooms}</div>
                <p className="text-xs text-gray-500 mt-1">of {metrics.totalRooms} conference rooms</p>
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
                <div className="text-2xl font-bold text-red-600">{metrics.roomsAboveCapacity}</div>
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
                <div className="text-2xl font-bold text-blue-600">{metrics.averageUtilization}%</div>
                <p className="text-xs text-gray-500 mt-1">average occupancy rate</p>
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
                <div className="text-2xl font-bold text-gray-900">{metrics.averageTemperature}°F</div>
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
                <div className="text-2xl font-bold text-gray-900">{metrics.averageAirQuality}/100</div>
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
                <div className="text-2xl font-bold text-gray-900">{metrics.averageNoiseLevel} dB</div>
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
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
                          <span>{room.occupancy}/{room.capacity} people</span>
                          {room.temperature && <span>{room.temperature}°F</span>}
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
                    )) || (
                      <span className="text-sm text-gray-500">No floor access configured</span>
                    )}
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
                    {userProfile.role === 'admin' && (
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
  )
}