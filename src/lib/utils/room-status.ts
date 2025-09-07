/**
 * Room status utilities - Consistent room status handling
 * 
 * Provides utilities for determining room colors, variants, and status logic
 */

import type { RoomStatus } from '@/types'

/**
 * Get CSS color class for room status indicator
 */
export function getRoomStatusColor(status: RoomStatus): string {
  const colorMap: Record<RoomStatus, string> = {
    available: 'bg-green-500',
    occupied: 'bg-yellow-500', 
    full: 'bg-red-500',
    unknown: 'bg-gray-400'
  }
  
  return colorMap[status]
}

/**
 * Get badge variant for room status
 */
export function getRoomStatusVariant(status: RoomStatus): 'default' | 'destructive' | 'secondary' {
  const variantMap: Record<RoomStatus, 'default' | 'destructive' | 'secondary'> = {
    available: 'default',
    occupied: 'secondary',
    full: 'destructive',
    unknown: 'secondary'
  }
  
  return variantMap[status]
}

/**
 * Determine room status based on occupancy and capacity
 */
export function determineRoomStatus(occupancy?: number, capacity?: number): RoomStatus {
  if (occupancy === undefined || capacity === undefined) return 'unknown'
  if (occupancy === 0) return 'available'
  if (occupancy >= capacity) return 'full'
  return 'occupied'
}

/**
 * Get human-readable status text
 */
export function getRoomStatusText(status: RoomStatus): string {
  const textMap: Record<RoomStatus, string> = {
    available: 'Available',
    occupied: 'Occupied',
    full: 'Full',
    unknown: 'No Data'
  }
  
  return textMap[status]
}

/**
 * Check if room is available for booking
 */
export function isRoomAvailable(status: RoomStatus): boolean {
  return status === 'available'
}

/**
 * Get room utilization level
 */
export function getRoomUtilization(occupancy: number, capacity: number): {
  percentage: number
  level: 'low' | 'medium' | 'high' | 'over'
} {
  if (capacity === 0) return { percentage: 0, level: 'low' }
  
  const percentage = Math.round((occupancy / capacity) * 100)
  
  let level: 'low' | 'medium' | 'high' | 'over'
  if (percentage === 0) level = 'low'
  else if (percentage <= 50) level = 'medium'
  else if (percentage < 100) level = 'high'
  else level = 'over'
  
  return { percentage, level }
}