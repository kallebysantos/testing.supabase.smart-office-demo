/**
 * Ticket Status Utilities
 * 
 * Utility functions for working with service ticket statuses, priorities, and severities
 */

import type { TicketStatus, TicketSeverity, ServiceTicket } from '@/types'

/**
 * Get color class for ticket severity indicator
 */
export function getTicketSeverityColor(severity: TicketSeverity): string {
  switch (severity) {
    case 'low':
      return 'bg-blue-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'high':
      return 'bg-orange-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Get badge variant for ticket status
 */
export function getTicketStatusVariant(status: TicketStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'queued':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'assigned':
      return 'destructive'
    case 'resolved':
      return 'outline'
    default:
      return 'secondary'
  }
}

/**
 * Get human-readable status text
 */
export function getStatusDisplayText(status: TicketStatus): string {
  switch (status) {
    case 'queued':
      return 'Queued'
    case 'processing':
      return 'Processing'
    case 'assigned':
      return 'Assigned'
    case 'resolved':
      return 'Resolved'
    default:
      return status
  }
}

/**
 * Get priority display text with color
 */
export function getPriorityDisplay(priority: number): { text: string; color: string } {
  if (priority === 1) {
    return { text: 'P1 - Critical', color: 'text-red-600' }
  } else if (priority === 2) {
    return { text: 'P2 - High', color: 'text-orange-600' }
  } else if (priority === 3) {
    return { text: 'P3 - Medium', color: 'text-yellow-600' }
  } else {
    return { text: `P${priority} - Low`, color: 'text-blue-600' }
  }
}

/**
 * Calculate ticket age in hours
 */
export function getTicketAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
}

/**
 * Get ticket age display text
 */
export function getTicketAgeText(createdAt: string): string {
  const hours = getTicketAge(createdAt)
  
  if (hours < 1) {
    return 'Just created'
  } else if (hours === 1) {
    return '1 hour ago'
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else {
    const days = Math.floor(hours / 24)
    return days === 1 ? '1 day ago' : `${days} days ago`
  }
}

/**
 * Determine if ticket is overdue based on priority and age
 */
export function isTicketOverdue(ticket: ServiceTicket): boolean {
  const hours = getTicketAge(ticket.created_at)
  
  // SLA thresholds by priority (in hours)
  const slaThresholds = {
    1: 2,   // P1: 2 hours
    2: 8,   // P2: 8 hours  
    3: 24,  // P3: 24 hours
    4: 72   // P4: 72 hours
  }
  
  const threshold = slaThresholds[ticket.priority as keyof typeof slaThresholds] || 72
  return hours > threshold && ticket.status !== 'resolved'
}

/**
 * Get SLA status for ticket
 */
export function getSLAStatus(ticket: ServiceTicket): {
  status: 'on-track' | 'at-risk' | 'overdue'
  color: string
  text: string
} {
  if (ticket.status === 'resolved') {
    return { status: 'on-track', color: 'text-green-600', text: 'Resolved' }
  }
  
  const hours = getTicketAge(ticket.created_at)
  const slaThresholds = {
    1: 2,   // P1: 2 hours
    2: 8,   // P2: 8 hours  
    3: 24,  // P3: 24 hours
    4: 72   // P4: 72 hours
  }
  
  const threshold = slaThresholds[ticket.priority as keyof typeof slaThresholds] || 72
  const warningThreshold = Math.floor(threshold * 0.8) // 80% of SLA
  
  if (hours > threshold) {
    return { status: 'overdue', color: 'text-red-600', text: 'Overdue' }
  } else if (hours > warningThreshold) {
    return { status: 'at-risk', color: 'text-orange-600', text: 'At Risk' }
  } else {
    return { status: 'on-track', color: 'text-green-600', text: 'On Track' }
  }
}