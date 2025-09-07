/**
 * Booking Card - Individual booking display component
 * 
 * Shows booking information with optional sensor data for active meetings
 */

import { Building2, User, Calendar, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatTime } from '@/lib/utils/format'
import { getBookingStatusVariant } from '@/lib/utils/booking-status'
import type { BookingWithSensorData } from '@/types'

interface BookingCardProps {
  booking: BookingWithSensorData
  showSensorData?: boolean
}

export function BookingCard({ booking, showSensorData = false }: BookingCardProps) {
  const startDateTime = formatDateTime(booking.start_time)
  const endDateTime = formatDateTime(booking.end_time)
  const statusVariant = getBookingStatusVariant(booking.status)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <BookingHeader 
          title={booking.title}
          status={booking.status}
          variant={statusVariant}
        />
        
        <BookingDetails
          roomName={booking.room.name}
          organizerEmail={booking.organizer_email}
        />
        
        <BookingTimeInfo
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          attendeeCount={booking.attendee_count}
        />
        
        {showSensorData && booking.status === 'active' && (
          <BookingSensorData booking={booking} />
        )}
      </CardContent>
    </Card>
  )
}

interface BookingHeaderProps {
  title: string
  status: string
  variant: 'default' | 'destructive' | 'secondary'
}

function BookingHeader({ title, status, variant }: BookingHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      </div>
      
      <Badge variant={variant} className="capitalize">
        {status === 'active' ? 'Active Now' : status}
      </Badge>
    </div>
  )
}

interface BookingDetailsProps {
  roomName: string
  organizerEmail: string
}

function BookingDetails({ roomName, organizerEmail }: BookingDetailsProps) {
  return (
    <div className="flex items-center space-x-4 mb-3">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900">{roomName}</span>
      </div>
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-600" />
        <span className="text-gray-700">{organizerEmail}</span>
      </div>
    </div>
  )
}

interface BookingTimeInfoProps {
  startDateTime: { date: string; time: string }
  endDateTime: { date: string; time: string }
  attendeeCount: number
}

function BookingTimeInfo({ startDateTime, endDateTime, attendeeCount }: BookingTimeInfoProps) {
  return (
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
            {attendeeCount || 'Not specified'} attendees
          </div>
          <div className="text-gray-600">Expected</div>
        </div>
      </div>
    </div>
  )
}

interface BookingSensorDataProps {
  booking: BookingWithSensorData
}

function BookingSensorData({ booking }: BookingSensorDataProps) {
  const sensorMetrics = [
    {
      label: 'Current Occupancy',
      value: booking.currentOccupancy !== undefined 
        ? `${booking.currentOccupancy} people`
        : 'No data'
    },
    {
      label: 'Temperature',
      value: booking.currentTemperature !== undefined 
        ? `${booking.currentTemperature}°F`
        : 'No data'
    },
    {
      label: 'Noise Level',
      value: booking.currentNoiseLevel !== undefined 
        ? `${booking.currentNoiseLevel} dB`
        : 'No data'
    },
    {
      label: 'Air Quality',
      value: booking.currentAirQuality !== undefined 
        ? `${booking.currentAirQuality}/100`
        : 'No data'
    }
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Current Room Status</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensorMetrics.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <span className={`font-medium ${
              value === 'No data' ? 'text-gray-400 text-sm' : 'text-gray-900'
            }`}>
              {value}
            </span>
          </div>
        ))}
      </div>
      
      {booking.lastSensorUpdate && (
        <p className="text-xs text-gray-400 mt-2">
          Last sensor update: {formatTime(booking.lastSensorUpdate)}
        </p>
      )}
    </div>
  )
}