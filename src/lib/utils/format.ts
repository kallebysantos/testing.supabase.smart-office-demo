/**
 * Formatting utilities - Consistent data formatting across the app
 * 
 * Provides reusable formatting functions for dates, numbers, and other data types
 */

/**
 * Format temperature with proper unit
 */
export function formatTemperature(temperature: number): string {
  return `${temperature}°F`
}

/**
 * Format time from ISO string to local time
 */
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

/**
 * Format date from ISO string to local date
 */
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Format date and time together
 */
export function formatDateTime(timestamp: string) {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

/**
 * Format occupancy as a percentage
 */
export function formatOccupancyPercentage(occupancy: number, capacity: number): string {
  if (capacity === 0) return '0%'
  return `${Math.round((occupancy / capacity) * 100)}%`
}

/**
 * Format numbers with proper locale
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

/**
 * Calculate and format time ago
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
  return `${Math.floor(diffInMinutes / 1440)} days ago`
}