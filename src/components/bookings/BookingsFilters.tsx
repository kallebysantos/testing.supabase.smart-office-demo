/**
 * Bookings Filters - Filter controls for booking status
 * 
 * Provides filter buttons with counts for different booking statuses
 */

import { Activity, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'

interface BookingsFiltersProps {
  activeFilter: BookingStatus
  onFilterChange: (status: BookingStatus) => void
  statusCounts: Record<BookingStatus, number>
}

export function BookingsFilters({ 
  activeFilter, 
  onFilterChange, 
  statusCounts 
}: BookingsFiltersProps) {
  const filters = [
    {
      status: 'active' as const,
      icon: Activity,
      label: 'Active Now',
      count: statusCounts.active || 0
    },
    {
      status: 'upcoming' as const,
      icon: Clock,
      label: 'Upcoming', 
      count: statusCounts.upcoming || 0
    },
    {
      status: 'completed' as const,
      icon: Calendar,
      label: 'Completed',
      count: statusCounts.completed || 0
    }
  ]

  return (
    <div className="flex items-center space-x-2 mb-6">
      {filters.map(({ status, icon: Icon, label, count }) => (
        <Button
          key={status}
          variant={activeFilter === status ? 'default' : 'outline'}
          onClick={() => onFilterChange(status)}
          className="flex items-center space-x-2"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </Button>
      ))}
    </div>
  )
}