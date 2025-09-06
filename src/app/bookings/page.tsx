'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Building2, Loader2, User, Thermometer, Volume2, Wind, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type BookingFilter = 'active' | 'upcoming' | 'completed'

interface RoomBooking {
  id: string
  room_id: string
  title: string
  organizer_email: string
  start_time: string
  end_time: string
  attendee_count: number
  created_at: string
  room?: {
    name: string
  }
}

interface SensorReading {
  room_id: string
  occupancy: number
  temperature: number
  noise_level: number
  air_quality: number
  timestamp: string
}

interface BookingWithSensorData extends RoomBooking {
  currentOccupancy?: number
  currentTemperature?: number
  currentNoiseLevel?: number
  currentAirQuality?: number
  lastSensorUpdate?: string
}

export default function BookingsPage() {
  const { user, userProfile, loading } = useAuth()
  const [bookings, setBookings] = useState<BookingWithSensorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('active') // Default to Active Now

  // Helper function to determine booking status
  const getBookingStatus = (booking: RoomBooking): BookingFilter => {
    const now = new Date()
    const startTime = new Date(booking.start_time)
    const endTime = new Date(booking.end_time)

    if (now >= startTime && now <= endTime) {
      return 'active'
    } else if (now < startTime) {
      return 'upcoming'
    } else {
      return 'completed'
    }
  }

  // Filter bookings based on active filter
  const filteredBookings = bookings.filter(booking => getBookingStatus(booking) === activeFilter)

  // Fetch bookings and sensor data
  const fetchBookingsData = async () => {
    try {
      setIsLoading(true)

      // Get all bookings with room names, ordered by latest first
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('room_bookings')
        .select(`
          id,
          room_id,
          title,
          organizer_email,
          start_time,
          end_time,
          attendee_count,
          created_at,
          rooms!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        setBookings([])
        return
      }

      // Get latest sensor readings for each room
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_readings')
        .select('room_id, occupancy, temperature, noise_level, air_quality, timestamp')
        .order('timestamp', { ascending: false })

      if (sensorError) {
        console.warn('No sensor data available yet:', sensorError)
      }

      // Combine booking data with latest sensor readings
      const bookingsWithSensorData: BookingWithSensorData[] = (bookingsData || []).map(booking => {
        // Find the latest sensor reading for this room
        const latestReading = sensorData?.find(reading => reading.room_id === booking.room_id)
        
        return {
          ...booking,
          room: { name: booking.rooms.name },
          currentOccupancy: latestReading?.occupancy,
          currentTemperature: latestReading?.temperature,
          currentNoiseLevel: latestReading?.noise_level,
          currentAirQuality: latestReading?.air_quality,
          lastSensorUpdate: latestReading?.timestamp
        }
      })

      setBookings(bookingsWithSensorData)

    } catch (error) {
      console.error('Error fetching bookings data:', error)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    fetchBookingsData()

    // Subscribe to room_bookings changes
    const bookingsChannel = supabase
      .channel('bookings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_bookings'
        },
        (payload) => {
          console.log('Booking data updated:', payload)
          fetchBookingsData() // Refresh data when bookings change
        }
      )
      .subscribe()

    // Subscribe to sensor_readings changes for real-time occupancy
    const sensorChannel = supabase
      .channel('bookings-sensor-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          console.log('Sensor data updated:', payload)
          
          // Update only the specific room's sensor data instead of refetching all
          if (payload.eventType === 'INSERT' && payload.new) {
            const newReading = payload.new as SensorReading
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking.room_id === newReading.room_id
                  ? {
                      ...booking,
                      currentOccupancy: newReading.occupancy,
                      currentTemperature: newReading.temperature,
                      currentNoiseLevel: newReading.noise_level,
                      currentAirQuality: newReading.air_quality,
                      lastSensorUpdate: newReading.timestamp
                    }
                  : booking
              )
            )
          }
        }
      )
      .subscribe()

    // Remove frequent refresh - only rely on real-time updates
    // const interval = setInterval(fetchBookingsData, 30000)

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(sensorChannel)
      // clearInterval(interval)
    }
  }, [])

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming': return 'default'
      case 'active': return 'destructive'
      case 'completed': return 'secondary'
      default: return 'outline'
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
                <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-600 mt-2">Real-time conference room reservations with live occupancy data</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 mb-6">
              <Button
                variant={activeFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('active')}
                className="flex items-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span>Active Now</span>
                <Badge variant="secondary" className="ml-2">
                  {bookings.filter(b => getBookingStatus(b) === 'active').length}
                </Badge>
              </Button>
              
              <Button
                variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('upcoming')}
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Upcoming</span>
                <Badge variant="secondary" className="ml-2">
                  {bookings.filter(b => getBookingStatus(b) === 'upcoming').length}
                </Badge>
              </Button>
              
              <Button
                variant={activeFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('completed')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Completed</span>
                <Badge variant="secondary" className="ml-2">
                  {bookings.filter(b => getBookingStatus(b) === 'completed').length}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const status = getBookingStatus(booking)
                const startDateTime = formatDateTime(booking.start_time)
                const endDateTime = formatDateTime(booking.end_time)

                return (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Booking Title */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {booking.title}
                          </h3>
                          
                          {/* Room and Organizer */}
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{booking.room?.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-700">{booking.organizer_email}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
                          {status === 'active' ? 'Active Now' : status}
                        </Badge>
                      </div>

                      {/* Time and Attendee Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{startDateTime.date}</div>
                            <div className="text-gray-600">Date</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {startDateTime.time} - {endDateTime.time}
                            </div>
                            <div className="text-gray-600">Time</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {booking.attendee_count || 'Not specified'} attendees
                            </div>
                            <div className="text-gray-600">Expected</div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Sensor Data - Only show for active bookings */}
                      {status === 'active' && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Room Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Current Occupancy</span>
                            {booking.currentOccupancy !== undefined ? (
                              <span className="font-medium text-gray-900">
                                {booking.currentOccupancy} people
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Temperature</span>
                            {booking.currentTemperature !== undefined ? (
                              <span className="font-medium text-gray-900">
                                {booking.currentTemperature}°F
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Noise Level</span>
                            {booking.currentNoiseLevel !== undefined ? (
                              <span className="font-medium text-gray-900">
                                {booking.currentNoiseLevel} dB
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Air Quality</span>
                            {booking.currentAirQuality !== undefined ? (
                              <span className="font-medium text-gray-900">
                                {booking.currentAirQuality}/100
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </div>
                        </div>
                        
                        {booking.lastSensorUpdate && (
                          <p className="text-xs text-gray-400 mt-2">
                            Last sensor update: {new Date(booking.lastSensorUpdate).toLocaleTimeString()}
                          </p>
                        )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* No Bookings Message */
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">
                There are currently no conference room bookings in the system.
              </p>
              <p className="text-sm text-gray-500">
                Bookings will appear here once they are created in the calendar system.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}