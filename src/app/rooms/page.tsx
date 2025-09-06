'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Thermometer, Users, Loader2, Volume2, Wind } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Room {
  id: string
  name: string
  capacity: number
  image_url?: string
}

interface SensorReading {
  room_id: string
  occupancy: number
  temperature: number
  noise_level: number
  air_quality: number
  timestamp: string
}

interface RoomWithSensorData extends Room {
  currentOccupancy?: number
  currentTemperature?: number
  currentNoiseLevel?: number
  currentAirQuality?: number
  lastUpdated?: string
  isUpdating?: boolean
}

export default function RoomsPage() {
  const { user, userProfile, loading } = useAuth()
  const [rooms, setRooms] = useState<RoomWithSensorData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch rooms and sensor data
  const fetchRoomsData = async () => {
    try {
      setIsLoading(true)

      // Get all rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, capacity, image_url')
        .order('name')

      console.log('Rooms query result:', { roomsData, roomsError })

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError)
        return
      }

      if (!roomsData || roomsData.length === 0) {
        console.log('No rooms found in database')
      }

      // Get latest sensor readings for each room
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_readings')
        .select('room_id, occupancy, temperature, noise_level, air_quality, timestamp')
        .order('timestamp', { ascending: false })

      if (sensorError) {
        console.warn('No sensor data available yet:', sensorError)
      }

      // Combine room data with latest sensor readings
      const roomsWithSensorData: RoomWithSensorData[] = roomsData.map(room => {
        // Find the latest sensor reading for this room
        const latestReading = sensorData?.find(reading => reading.room_id === room.id)
        
        return {
          ...room,
          currentOccupancy: latestReading?.occupancy,
          currentTemperature: latestReading?.temperature,
          currentNoiseLevel: latestReading?.noise_level,
          currentAirQuality: latestReading?.air_quality,
          lastUpdated: latestReading?.timestamp
        }
      })

      setRooms(roomsWithSensorData)

    } catch (error) {
      console.error('Error fetching rooms data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    fetchRoomsData()

    // Subscribe to sensor_readings changes with a unique channel name
    const channelName = `rooms-sensor-updates-${Date.now()}`
    console.log('Setting up subscription with channel:', channelName)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          console.log('Sensor data updated:', payload)
          console.log('Event type:', payload.eventType)
          console.log('New reading:', payload.new)
          
          // Update the specific room with glow effect (no full page refresh)
          if (payload.eventType === 'INSERT' && payload.new) {
            const newReading = payload.new as SensorReading
            console.log('Updating room:', newReading.room_id, 'with glow effect')
            
            // Update the room data and trigger glow in a single state update
            setRooms(prevRooms => 
              prevRooms.map(room => 
                room.id === newReading.room_id
                  ? {
                      ...room,
                      currentOccupancy: newReading.occupancy,
                      currentTemperature: newReading.temperature,
                      currentNoiseLevel: newReading.noise_level,
                      currentAirQuality: newReading.air_quality,
                      lastUpdated: newReading.timestamp,
                      isUpdating: true
                    }
                  : room
              )
            )
            
            // Remove the glow after 2 seconds
            setTimeout(() => {
              setRooms(prevRooms => 
                prevRooms.map(room => 
                  room.id === newReading.room_id
                    ? { ...room, isUpdating: false }
                    : room
                )
              )
            }, 2000)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to sensor_readings updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to sensor_readings')
        }
      })

    // Backup refresh only every 10 minutes (real-time should handle most updates)
    const interval = setInterval(() => {
      console.log('Backup refresh triggered (10min interval)')
      fetchRoomsData()
    }, 600000) // Every 10 minutes as backup only

    return () => {
      console.log('Cleaning up subscription')
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  // Get occupancy status for styling
  const getOccupancyStatus = (occupancy?: number, capacity?: number) => {
    if (occupancy === undefined) return 'unknown'
    if (occupancy === 0) return 'available'
    if (capacity && occupancy >= capacity) return 'full'
    return 'occupied'
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'occupied': return 'bg-yellow-500' 
      case 'full': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conference Rooms</h1>
                <p className="text-gray-600 mt-2">Real-time occupancy and temperature monitoring</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
            
            {/* Status Legend */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Full</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>No Data</span>
              </div>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => {
              const status = getOccupancyStatus(room.currentOccupancy, room.capacity)
              const statusColor = getStatusColor(status)

              return (
                <Card key={room.id} className={`overflow-hidden hover:shadow-lg transition-all duration-500 ${
                  room.isUpdating 
                    ? 'shadow-lg shadow-yellow-200 bg-gradient-to-br from-yellow-50 to-white border-yellow-200' 
                    : 'shadow-sm'
                }`}>
                  <div className="relative">
                    {/* Room Image */}
                    {room.image_url ? (
                      <img 
                        src={room.image_url} 
                        alt={room.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Indicator */}
                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${statusColor}`}></div>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Room Name */}
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{room.name}</h3>
                    
                    {/* Current Metrics */}
                    <div className="space-y-2">
                      {/* Occupancy */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Occupancy</span>
                        </div>
                        <div className="text-right">
                          {room.currentOccupancy !== undefined ? (
                            <span className="font-medium text-gray-900">
                              {room.currentOccupancy}/{room.capacity}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Temperature</span>
                        </div>
                        <div className="text-right">
                          {room.currentTemperature !== undefined ? (
                            <span className="font-medium text-gray-900">
                              {room.currentTemperature}°F
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>

                      {/* Noise Level */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Noise</span>
                        </div>
                        <div className="text-right">
                          {room.currentNoiseLevel !== undefined ? (
                            <span className="font-medium text-gray-900">
                              {room.currentNoiseLevel} dB
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>

                      {/* Air Quality */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wind className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Air Quality</span>
                        </div>
                        <div className="text-right">
                          {room.currentAirQuality !== undefined ? (
                            <span className="font-medium text-gray-900">
                              {room.currentAirQuality}/100
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Badge 
                        variant={status === 'available' ? 'default' : status === 'full' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {status === 'unknown' ? 'No Data' : status}
                      </Badge>
                      
                      {room.lastUpdated && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last updated: {new Date(room.lastUpdated).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No Rooms Message */}
          {rooms.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Rooms Found</h3>
              <p className="text-gray-600">
                Run the room generation script to populate the database.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}