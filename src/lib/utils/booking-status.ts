/**
 * Booking status utilities - Consistent booking status handling
 * 
 * Provides utilities for determining booking status, colors, and variants
 */

import type { BookingStatus } from '@/types'

/**
 * Get badge variant for booking status
 */
export function getBookingStatusVariant(status: BookingStatus): 'default' | 'destructive' | 'secondary' {
  const variantMap: Record<BookingStatus, 'default' | 'destructive' | 'secondary'> = {
    upcoming: 'default',
    active: 'destructive', 
    completed: 'secondary'
  }
  
  return variantMap[status]
}

/**
 * Get human-readable status text
 */
export function getBookingStatusText(status: BookingStatus): string {
  const textMap: Record<BookingStatus, string> = {
    upcoming: 'Upcoming',
    active: 'Active Now',
    completed: 'Completed'
  }
  
  return textMap[status]
}

/**
 * Determine booking status based on start and end times
 */
export function determineBookingStatus(startTime: string, endTime: string): BookingStatus {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now >= start && now <= end) {
    return 'active'
  } else if (now < start) {
    return 'upcoming'
  } else {
    return 'completed'
  }
}

/**
 * Check if booking is currently active
 */
export function isBookingActive(startTime: string, endTime: string): boolean {
  return determineBookingStatus(startTime, endTime) === 'active'
}

/**
 * Get remaining time for active booking
 */
export function getRemainingTime(endTime: string): string | null {
  const now = new Date()
  const end = new Date(endTime)
  
  if (now >= end) return null
  
  const diffMs = end.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes remaining`
  }
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  }
  
  return `${hours}h ${minutes}m remaining`
}

/**
 * Calculate booking duration in minutes
 */
export function getBookingDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
}