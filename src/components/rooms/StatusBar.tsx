'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle
} from 'lucide-react'
import { RoomStatus } from '@/types/room'

interface StatusBarProps {
  roomStatuses: RoomStatus[]
  lastUpdate: string | null
  isConnected: boolean
}

export default function StatusBar({ 
  roomStatuses, 
  lastUpdate, 
  isConnected 
}: StatusBarProps) {
  // Calculate statistics
  const totalRooms = roomStatuses.length
  const availableRooms = roomStatuses.filter(rs => rs.occupancy === 0).length
  // const occupiedRooms = roomStatuses.filter(rs => rs.occupancy > 0).length
  const totalOccupancy = roomStatuses.reduce((sum, rs) => sum + rs.occupancy, 0)
  const totalCapacity = roomStatuses.reduce((sum, rs) => sum + rs.room.capacity, 0)
  const overallOccupancyPercentage = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0
  
  const formatLastUpdate = (timestamp: string) => {
    const now = new Date()
    const updated = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return updated.toLocaleTimeString()
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-600'
    if (percentage < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConnectionStatus = () => {
    if (isConnected && lastUpdate) {
      const timeSinceUpdate = new Date().getTime() - new Date(lastUpdate).getTime()
      const isRecentUpdate = timeSinceUpdate < 2 * 60 * 1000 // 2 minutes
      
      if (isRecentUpdate) {
        return {
          icon: CheckCircle,
          label: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      }
    }
    
    return {
      icon: AlertCircle,
      label: 'Disconnected',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  }

  const connectionStatus = getConnectionStatus()
  const ConnectionIcon = connectionStatus.icon

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Rooms */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
              <p className="text-sm text-gray-500">Total Rooms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rooms */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{availableRooms}</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {Math.round((availableRooms / totalRooms) * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Available Now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Occupancy */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{totalOccupancy}</p>
                <span className="text-sm text-gray-500">/ {totalCapacity}</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">Overall Occupancy</p>
                <span className={`text-sm font-medium ${getOccupancyColor(overallOccupancyPercentage)}`}>
                  {Math.round(overallOccupancyPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${connectionStatus.bgColor} rounded-lg`}>
              <ConnectionIcon className={`h-5 w-5 ${connectionStatus.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className={`text-sm font-medium ${connectionStatus.color}`}>
                  {connectionStatus.label}
                </p>
                <div className="flex items-center space-x-1">
                  <Circle 
                    className={`h-2 w-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} 
                  />
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">
                  {lastUpdate ? formatLastUpdate(lastUpdate) : 'No updates'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}