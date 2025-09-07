/**
 * RoomView - Room-organized view with room details and meeting cards
 * 
 * Shows rooms with their details and all associated bookings as cards
 */

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Users, Wifi, Monitor, Coffee, Shield, Calendar, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { BookingWithSensorData, Room } from '@/types'

interface RoomViewProps {
  bookings: BookingWithSensorData[]
  rooms?: Room[] // Optional, will group from bookings if not provided
}

export function RoomView({ bookings, rooms }: RoomViewProps) {
  // Group bookings by room
  const bookingsByRoom = useMemo(() => {
    const grouped: { [roomId: string]: BookingWithSensorData[] } = {}

    bookings.forEach(booking => {
      const roomId = booking.room_id
      if (!grouped[roomId]) {
        grouped[roomId] = []
      }
      grouped[roomId].push(booking)
    })

    // Sort bookings within each room by start time
    Object.keys(grouped).forEach(roomId => {
      grouped[roomId].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    })

    return grouped
  }, [bookings])

  // Get unique rooms from bookings
  const uniqueRooms = useMemo(() => {
    const roomMap = new Map<string, { id: string; name: string; capacity?: number; floor?: number; building?: string; amenities?: string[] }>()
    
    bookings.forEach(booking => {
      if (!roomMap.has(booking.room_id)) {
        roomMap.set(booking.room_id, {
          id: booking.room_id,
          name: booking.room.name,
          // Add additional room details if available from rooms prop
          ...(rooms?.find(r => r.id === booking.room_id) || {})
        })
      }
    })

    return Array.from(roomMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [bookings, rooms])

  const getBookingStatusColor = (booking: BookingWithSensorData) => {
    switch (booking.status) {
      case 'active': return 'border-green-200 bg-green-50'
      case 'upcoming': return 'border-blue-200 bg-blue-50'
      case 'completed': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getBookingStatusBadge = (booking: BookingWithSensorData) => {
    switch (booking.status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Active Now</Badge>
      case 'upcoming': return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
      case 'completed': return <Badge className="bg-gray-100 text-gray-600">Completed</Badge>
      default: return null
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi
    if (amenityLower.includes('monitor') || amenityLower.includes('display') || amenityLower.includes('projector')) return Monitor
    if (amenityLower.includes('coffee') || amenityLower.includes('catering')) return Coffee
    if (amenityLower.includes('privacy') || amenityLower.includes('security')) return Shield
    return null
  }

  if (uniqueRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No rooms with bookings</h3>
        <p className="text-gray-600">Rooms will appear here when bookings are scheduled</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {uniqueRooms.map(room => {
        const roomBookings = bookingsByRoom[room.id] || []
        
        return (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Room Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {roomBookings.length} booking{roomBookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {/* Room Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {room.capacity && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{room.capacity} people</span>
                      </div>
                    )}
                    
                    {room.floor && room.building && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Floor {room.floor}, {room.building}</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      {room.amenities.slice(0, 4).map((amenity, index) => {
                        const Icon = getAmenityIcon(amenity)
                        return Icon ? (
                          <div key={index} className="flex items-center text-xs text-gray-500" title={amenity}>
                            <Icon className="h-3 w-3" />
                          </div>
                        ) : null
                      })}
                      {room.amenities.length > 4 && (
                        <span className="text-xs text-gray-500">+{room.amenities.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bookings */}
              {roomBookings.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {roomBookings.map(booking => (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getBookingStatusColor(booking)}`}
                    >
                      {/* Booking Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {booking.title}
                        </h4>
                        {getBookingStatusBadge(booking)}
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span>
                            {format(parseISO(booking.start_time), 'MMM d, h:mm a')} - {format(parseISO(booking.end_time), 'h:mm a')}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{booking.organizer_email}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span>{booking.attendee_count} attendees</span>
                        </div>

                        {/* Sensor Data for Active Meetings */}
                        {booking.status === 'active' && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {booking.currentOccupancy !== undefined && (
                                <div>
                                  <span className="text-gray-500">Occupancy:</span>
                                  <span className="ml-1 font-medium">{booking.currentOccupancy}</span>
                                </div>
                              )}
                              {booking.currentTemperature !== undefined && (
                                <div>
                                  <span className="text-gray-500">Temp:</span>
                                  <span className="ml-1 font-medium">{booking.currentTemperature}°F</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No bookings for this room</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}