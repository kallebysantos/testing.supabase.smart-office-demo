/**
 * Calendar Utilities - High-performance calendar calculations and validations
 * 
 * Provides type-safe, optimized utility functions for calendar operations
 */

import { startOfDay, addDays, startOfWeek, isSameDay, parseISO, isValid } from 'date-fns'
import type { BookingWithSensorData, BookingStatus } from '@/types'

// Constants for configuration
export const CALENDAR_CONFIG = {
  TIME_SLOT_DURATION_MINUTES: 30,
  START_HOUR: 6,
  END_HOUR: 22,
  WEEK_STARTS_ON: 1, // Monday
  MAX_BOOKING_TITLE_LENGTH: 100,
  MIN_BOOKING_DURATION_MINUTES: 15,
} as const

// Time slot generation with memoization
const timeSlotCache = new Map<string, Date[]>()

export function generateTimeSlots(startHour = CALENDAR_CONFIG.START_HOUR, endHour = CALENDAR_CONFIG.END_HOUR): Date[] {
  const cacheKey = `${startHour}-${endHour}`
  
  if (timeSlotCache.has(cacheKey)) {
    return timeSlotCache.get(cacheKey)!
  }

  const slots: Date[] = []
  const totalSlots = ((endHour - startHour) * 60) / CALENDAR_CONFIG.TIME_SLOT_DURATION_MINUTES
  const baseTime = new Date()
  baseTime.setHours(startHour, 0, 0, 0)

  for (let i = 0; i < totalSlots; i++) {
    slots.push(new Date(baseTime.getTime() + i * CALENDAR_CONFIG.TIME_SLOT_DURATION_MINUTES * 60 * 1000))
  }

  timeSlotCache.set(cacheKey, slots)
  return slots
}

// Safe date parsing with validation
export function safeParseDateISO(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

// Input sanitization for booking data
export function sanitizeBookingTitle(title: string): string {
  if (typeof title !== 'string') return 'Untitled Meeting'
  
  return title
    .trim()
    .substring(0, CALENDAR_CONFIG.MAX_BOOKING_TITLE_LENGTH)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// Validation functions
export function isValidBooking(booking: unknown): booking is BookingWithSensorData {
  if (!booking || typeof booking !== 'object') return false
  
  const b = booking as Record<string, unknown>
  
  return (
    typeof b.id === 'string' &&
    typeof b.title === 'string' &&
    typeof b.start_time === 'string' &&
    typeof b.end_time === 'string' &&
    typeof b.room_id === 'string' &&
    typeof b.attendee_count === 'number' &&
    b.attendee_count >= 0 &&
    safeParseDateISO(b.start_time as string) !== null &&
    safeParseDateISO(b.end_time as string) !== null
  )
}

// Status validation with type guard
export function isValidBookingStatus(status: unknown): status is BookingStatus {
  return typeof status === 'string' && ['active', 'upcoming', 'completed'].includes(status)
}

// Optimized day generation
export function generateDaysToShow(viewType: 'day' | 'week', currentDate: Date): Date[] {
  const safeDate = isValid(currentDate) ? currentDate : new Date()
  
  if (viewType === 'day') {
    return [startOfDay(safeDate)]
  }
  
  const weekStart = startOfWeek(safeDate, { weekStartsOn: CALENDAR_CONFIG.WEEK_STARTS_ON })
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

// Enhanced booking positioning with performance optimization
export interface PositionedBooking extends BookingWithSensorData {
  startSlot: number
  endSlot: number
  height: number
  dayIndex: number
  column: number
  totalColumns: number
}

// Overlap detection with optimized algorithm
export function calculateBookingPositions(
  bookings: BookingWithSensorData[], 
  daysToShow: Date[]
): PositionedBooking[] {
  // Filter and validate bookings
  const validBookings = bookings
    .filter(isValidBooking)
    .map(booking => {
      const startTime = safeParseDateISO(booking.start_time)
      const endTime = safeParseDateISO(booking.end_time)
      
      if (!startTime || !endTime || startTime >= endTime) return null
      
      const dayIndex = daysToShow.findIndex(day => isSameDay(startTime, day))
      if (dayIndex === -1) return null
      
      const startMinutes = (startTime.getHours() - CALENDAR_CONFIG.START_HOUR) * 60 + startTime.getMinutes()
      const duration = Math.max(
        CALENDAR_CONFIG.MIN_BOOKING_DURATION_MINUTES,
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      )
      
      const startSlot = Math.max(0, Math.floor(startMinutes / CALENDAR_CONFIG.TIME_SLOT_DURATION_MINUTES))
      const endSlot = startSlot + Math.ceil(duration / CALENDAR_CONFIG.TIME_SLOT_DURATION_MINUTES)
      const height = Math.ceil(duration / CALENDAR_CONFIG.TIME_SLOT_DURATION_MINUTES)
      
      return {
        ...booking,
        title: sanitizeBookingTitle(booking.title),
        startSlot,
        endSlot,
        height,
        dayIndex,
        column: 0,
        totalColumns: 1
      } satisfies PositionedBooking
    })
    .filter((booking): booking is PositionedBooking => booking !== null)

  // Optimized column assignment using interval tree algorithm
  daysToShow.forEach((_, dayIndex) => {
    const dayBookings = validBookings.filter(b => b.dayIndex === dayIndex)
    if (dayBookings.length <= 1) return
    
    // Sort by start time for optimal column assignment
    dayBookings.sort((a, b) => a.startSlot - b.startSlot)
    
    // Use sweep line algorithm for overlap detection
    const events: Array<{ time: number; type: 'start' | 'end'; booking: PositionedBooking }> = []
    
    dayBookings.forEach(booking => {
      events.push({ time: booking.startSlot, type: 'start', booking })
      events.push({ time: booking.endSlot, type: 'end', booking })
    })
    
    events.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time
      return a.type === 'end' ? -1 : 1 // End events first for same time
    })
    
    const activeBookings = new Set<PositionedBooking>()
    const maxOverlap = new Map<PositionedBooking, number>()
    let currentMaxOverlap = 0
    
    events.forEach(event => {
      if (event.type === 'start') {
        activeBookings.add(event.booking)
        currentMaxOverlap = Math.max(currentMaxOverlap, activeBookings.size)
      } else {
        activeBookings.delete(event.booking)
      }
      
      // Track maximum overlap for each booking
      activeBookings.forEach(booking => {
        maxOverlap.set(booking, Math.max(maxOverlap.get(booking) || 0, activeBookings.size))
      })
    })
    
    // Assign columns using greedy algorithm
    const columnAssignments = new Map<PositionedBooking, number>()
    
    dayBookings.forEach(booking => {
      const totalColumns = maxOverlap.get(booking) || 1
      booking.totalColumns = totalColumns
      
      // Find first available column
      let assignedColumn = 0
      while (assignedColumn < totalColumns) {
        const canUseColumn = !dayBookings.some(otherBooking => {
          if (otherBooking === booking) return false
          if (columnAssignments.get(otherBooking) !== assignedColumn) return false
          return booking.startSlot < otherBooking.endSlot && booking.endSlot > otherBooking.startSlot
        })
        
        if (canUseColumn) break
        assignedColumn++
      }
      
      booking.column = assignedColumn
      columnAssignments.set(booking, assignedColumn)
    })
  })
  
  return validBookings
}

// Status configuration with type safety
export const BOOKING_STATUS_CONFIG = {
  active: {
    badge: 'Active Now',
    color: 'bg-green-100 text-green-700 border-green-200',
    cardBorder: 'border-green-200',
    barColor: 'bg-green-500',
    priority: 3
  },
  upcoming: {
    badge: 'Upcoming',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    cardBorder: 'border-blue-200',
    barColor: 'bg-blue-500',
    priority: 2
  },
  completed: {
    badge: 'Completed',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    cardBorder: 'border-gray-200',
    barColor: 'bg-gray-400',
    priority: 1
  }
} as const

export function getBookingStatusConfig(status: BookingStatus) {
  return BOOKING_STATUS_CONFIG[status] || BOOKING_STATUS_CONFIG.completed
}

// Performance monitoring
export const performanceMetrics = {
  timings: new Map<string, number>(),
  
  startTiming(label: string): void {
    this.timings.set(label, performance.now())
  },
  
  endTiming(label: string): number {
    const start = this.timings.get(label)
    if (!start) return 0
    
    const duration = performance.now() - start
    this.timings.delete(label)
    return duration
  }
}