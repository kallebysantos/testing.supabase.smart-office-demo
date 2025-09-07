/**
 * ViewTypeFilters - View type selection component
 * 
 * Provides toggle between List, Room, Day, Week, and Month views
 */

import { List, Building2, Calendar, Clock, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewType = 'list' | 'room' | 'day' | 'week' | 'month'

interface ViewTypeFiltersProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewTypeFilters({ activeView, onViewChange }: ViewTypeFiltersProps) {
  const viewOptions = [
    { 
      type: 'list' as const, 
      label: 'List View', 
      icon: List,
      description: 'Traditional list of bookings'
    },
    { 
      type: 'room' as const, 
      label: 'Room View', 
      icon: Building2,
      description: 'Organized by room'
    },
    { 
      type: 'day' as const, 
      label: 'Day', 
      icon: Clock,
      description: 'Daily calendar'
    },
    { 
      type: 'week' as const, 
      label: 'Week', 
      icon: Calendar,
      description: 'Weekly calendar'
    },
    { 
      type: 'month' as const, 
      label: 'Month', 
      icon: LayoutGrid,
      description: 'Monthly calendar'
    },
  ]

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {viewOptions.map((option) => {
        const Icon = option.icon
        const isActive = activeView === option.type
        
        return (
          <Button
            key={option.type}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(option.type)}
            className={`px-3 py-2 ${
              isActive
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={option.description}
          >
            <Icon className="h-4 w-4 mr-2" />
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}