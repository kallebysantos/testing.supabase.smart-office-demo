'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Building, 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  Users,
  Thermometer,
  Hash
} from 'lucide-react'
import { FilterOptions, SortOption, SortOrder } from '@/types/room'

interface RoomFiltersProps {
  filters: FilterOptions
  sortBy: SortOption
  sortOrder: SortOrder
  onFilterChange: (filters: FilterOptions) => void
  onSortChange: (sortBy: SortOption, sortOrder: SortOrder) => void
  onClearFilters: () => void
  availableFloors: number[]
  availableBuildings: string[]
  totalRooms: number
  filteredCount: number
}

const availabilityOptions = [
  { value: 'all' as const, label: 'All Status', color: 'bg-gray-100 text-gray-800' },
  { value: 'available' as const, label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'occupied' as const, label: 'Occupied', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'booked' as const, label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance' as const, label: 'Maintenance', color: 'bg-red-100 text-red-800' }
]

const sortOptions = [
  { value: 'name' as const, label: 'Room Name', icon: Hash },
  { value: 'floor' as const, label: 'Floor', icon: Building },
  { value: 'occupancy' as const, label: 'Occupancy', icon: Users },
  { value: 'temperature' as const, label: 'Temperature', icon: Thermometer }
]

export default function RoomFilters({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortChange,
  onClearFilters,
  availableFloors,
  availableBuildings,
  totalRooms,
  filteredCount
}: RoomFiltersProps) {
  
  const hasActiveFilters = filters.floor !== 'all' || 
                          filters.availability !== 'all' || 
                          filters.building !== 'all'

  const handleSortToggle = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      // Toggle order if same sort field
      onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to ascending for new sort field
      onSortChange(newSortBy, 'asc')
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters & Sort</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Showing {filteredCount} of {totalRooms} rooms
          </span>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Building Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Building</label>
          <Select
            value={filters.building}
            onValueChange={(value) => 
              onFilterChange({ ...filters, building: value as string | 'all' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {availableBuildings.map((building) => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Floor Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Floor</label>
          <Select
            value={filters.floor.toString()}
            onValueChange={(value) => 
              onFilterChange({ 
                ...filters, 
                floor: value === 'all' ? 'all' : parseInt(value) 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {availableFloors.sort((a, b) => a - b).map((floor) => (
                <SelectItem key={floor} value={floor.toString()}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={filters.availability}
            onValueChange={(value) => 
              onFilterChange({ 
                ...filters, 
                availability: value as FilterOptions['availability']
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`text-xs ${option.color} border-0 px-2`}>
                      {option.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort By</label>
          <div className="flex space-x-1">
            {sortOptions.map((option) => {
              const Icon = option.icon
              const isActive = sortBy === option.value
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortToggle(option.value)}
                  className="flex-1 text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {option.label}
                  {isActive && (
                    sortOrder === 'asc' ? 
                    <SortAsc className="h-3 w-3 ml-1" /> : 
                    <SortDesc className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-xs font-medium text-gray-500">Active filters:</span>
          {filters.building !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Building: {filters.building}
            </Badge>
          )}
          {filters.floor !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Floor: {filters.floor}
            </Badge>
          )}
          {filters.availability !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.availability}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            Sort: {sortOptions.find(opt => opt.value === sortBy)?.label} {sortOrder === 'asc' ? '↑' : '↓'}
          </Badge>
        </div>
      )}
    </div>
  )
}