'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Thermometer, 
  Building, 
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'
import { RoomStatus, AvailabilityStatus } from '@/types/room'
import { cn } from '@/lib/utils'

interface RoomCardProps {
  roomStatus: RoomStatus
}

const getStatusConfig = (status: AvailabilityStatus, occupancyPercentage: number) => {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        color: 'bg-green-100 text-green-800 border-green-200',
        indicator: 'bg-green-500',
        cardBorder: 'border-green-200'
      }
    case 'occupied':
      return {
        label: 'Occupied',
        color: occupancyPercentage > 80 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        indicator: occupancyPercentage > 80 ? 'bg-red-500' : 'bg-yellow-500',
        cardBorder: occupancyPercentage > 80 ? 'border-red-200' : 'border-yellow-200'
      }
    case 'booked':
      return {
        label: 'Booked',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        indicator: 'bg-blue-500',
        cardBorder: 'border-blue-200'
      }
    case 'maintenance':
      return {
        label: 'Maintenance',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        indicator: 'bg-gray-500',
        cardBorder: 'border-gray-200'
      }
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        indicator: 'bg-gray-400',
        cardBorder: 'border-gray-200'
      }
  }
}

const getOccupancyStatus = (occupancy: number, capacity: number) => {
  const percentage = (occupancy / capacity) * 100
  
  if (occupancy === 0) return 'available'
  if (percentage > 90) return 'occupied' // Nearly full
  if (percentage > 0) return 'occupied' // Has people
  return 'available'
}

export default function RoomCard({ roomStatus }: RoomCardProps) {
  const { room, occupancy, temperature, last_updated } = roomStatus
  
  const occupancyPercentage = (occupancy / room.capacity) * 100
  const actualAvailability = getOccupancyStatus(occupancy, room.capacity)
  const statusConfig = getStatusConfig(actualAvailability, occupancyPercentage)
  
  const isRecentData = last_updated && 
    new Date().getTime() - new Date(last_updated).getTime() < 5 * 60 * 1000 // 5 minutes

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date()
    const updated = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return updated.toLocaleDateString()
  }

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1',
        statusConfig.cardBorder,
        'border-2'
      )}
    >
      {/* Status Indicator Bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', statusConfig.indicator)} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Floor {room.floor}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isRecentData ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <Badge variant="outline" className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {room.name}
          </h3>
          <p className="text-sm text-gray-500">{room.building}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Occupancy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Occupancy</span>
            </div>
            <span className="text-sm font-semibold">
              {occupancy}/{room.capacity}
              <span className="text-gray-500 ml-1">
                ({Math.round(occupancyPercentage)}%)
              </span>
            </span>
          </div>
          <Progress 
            value={occupancyPercentage} 
            className="h-2"
          />
        </div>

        {/* Temperature */}
        {temperature && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Temperature</span>
            </div>
            <span className="text-sm font-semibold">
              {temperature}°F
            </span>
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity) => (
                <Badge 
                  key={amenity}
                  variant="secondary" 
                  className="text-xs px-2 py-0.5"
                >
                  {amenity.replace('_', ' ')}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{room.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last update</span>
          </div>
          <span className={cn(
            isRecentData ? 'text-green-600' : 'text-red-600'
          )}>
            {last_updated ? formatLastUpdate(last_updated) : 'No data'}
          </span>
        </div>

        {/* Warning for stale data */}
        {!isRecentData && last_updated && (
          <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Data may be stale</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}