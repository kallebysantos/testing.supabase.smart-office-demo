/**
 * MonthView - Monthly calendar with booking lists per day
 * 
 * Shows calendar grid with booking count and list per day
 */

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BookingWithSensorData } from '@/types'

interface MonthViewProps {
  bookings: BookingWithSensorData[]
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function MonthView({ bookings, currentDate, onDateChange }: MonthViewProps) {
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let currentDay = calendarStart

    while (currentDay <= calendarEnd) {
      days.push(new Date(currentDay))
      currentDay = addDays(currentDay, 1)
    }

    return days
  }, [currentDate])

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped: { [key: string]: BookingWithSensorData[] } = {}

    bookings.forEach(booking => {
      const bookingDate = parseISO(booking.start_time)
      const dayKey = format(bookingDate, 'yyyy-MM-dd')
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(booking)
    })

    return grouped
  }, [bookings])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    onDateChange(newDate)
  }

  const getBookingColor = (booking: BookingWithSensorData) => {
    switch (booking.status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayBookings = bookingsByDay[dayKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth 
                    ? 'bg-gray-50 text-gray-400' 
                    : isCurrentDay 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isCurrentDay 
                      ? 'text-blue-600 font-bold' 
                      : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayBookings.length}
                    </Badge>
                  )}
                </div>

                {/* Bookings List */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <div
                      key={booking.id}
                      className={`p-1.5 rounded text-xs truncate cursor-pointer hover:shadow-sm transition-shadow ${getBookingColor(booking)}`}
                      title={`${booking.title} - ${booking.room.name} - ${format(parseISO(booking.start_time), 'h:mm a')}`}
                    >
                      <div className="font-medium truncate">{booking.title}</div>
                      <div className="flex items-center text-xs opacity-75 mt-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{format(parseISO(booking.start_time), 'h:mm a')}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span className="text-gray-600">Upcoming</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-gray-600">Active Now</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
      </div>
    </div>
  )
}