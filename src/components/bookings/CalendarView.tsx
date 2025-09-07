/**
 * CalendarView - Main calendar component wrapper
 * 
 * Routes to appropriate calendar view based on parent view type
 */

import { useState } from 'react'
import { DayWeekView } from './DayWeekView'
import { MonthView } from './MonthView'
import type { BookingWithSensorData } from '@/types'

interface CalendarViewProps {
  bookings: BookingWithSensorData[]
  viewType?: 'day' | 'week' | 'month'
}

export function CalendarView({ bookings, viewType = 'week' }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Calendar content */}
      <div className="p-6">
        {(viewType === 'day' || viewType === 'week') && (
          <DayWeekView
            viewType={viewType}
            bookings={bookings}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )}
        
        {viewType === 'month' && (
          <MonthView
            bookings={bookings}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )}
      </div>
    </div>
  )
}