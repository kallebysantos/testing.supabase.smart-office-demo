/**
 * Bookings List - List of booking cards
 * 
 * Displays filtered bookings with proper empty states
 */

import { Calendar } from 'lucide-react'
import { BookingCard } from './BookingCard'
import type { BookingWithSensorData, BookingStatus } from '@/types'

interface BookingsListProps {
  bookings: BookingWithSensorData[]
  activeFilter: BookingStatus
}

export function BookingsList({ bookings, activeFilter }: BookingsListProps) {
  if (bookings.length === 0) {
    return <EmptyBookingsState filter={activeFilter} />
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard 
          key={booking.id} 
          booking={booking}
          showSensorData={activeFilter === 'active'}
        />
      ))}
    </div>
  )
}

interface EmptyBookingsStateProps {
  filter: BookingStatus
}

function EmptyBookingsState({ filter }: EmptyBookingsStateProps) {
  const messages = {
    active: 'No meetings are currently active',
    upcoming: 'No upcoming meetings scheduled', 
    completed: 'No completed meetings found'
  }

  return (
    <div className="text-center py-12">
      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {messages[filter]}
      </h3>
      <p className="text-gray-600">
        {filter === 'active' 
          ? 'Check back when meetings are in session'
          : 'Bookings will appear here once they are created in the calendar system'
        }
      </p>
    </div>
  )
}