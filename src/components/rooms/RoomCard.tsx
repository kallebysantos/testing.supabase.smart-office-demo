/**
 * Room Card - Individual room display component
 * 
 * Shows room information, current metrics, and status with proper
 * responsive design and accessibility
 */

import Image from 'next/image'
import { Building2, Users, Thermometer, Volume2, Wind } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTemperature, formatTime } from '@/lib/utils/format'
import { getRoomStatusColor, getRoomStatusVariant } from '@/lib/utils/room-status'
import type { RoomWithSensorData } from '@/types'

interface RoomCardProps {
  room: RoomWithSensorData
}

export function RoomCard({ room }: RoomCardProps) {
  const statusColor = getRoomStatusColor(room.status)
  const statusVariant = getRoomStatusVariant(room.status)

  return (
    <Card className="pt-0 overflow-hidden hover:shadow-lg transition-shadow shadow-sm">
      <RoomImage room={room} statusColor={statusColor} />
      <CardContent className="px-4 py-2">
        <RoomTitle name={room.name} />
        <RoomMetrics room={room} />
        <RoomStatus status={room.status} variant={statusVariant} lastUpdated={room.lastUpdated} />
      </CardContent>
    </Card>
  )
}

interface RoomImageProps {
  room: RoomWithSensorData
  statusColor: string
}

function RoomImage({ room, statusColor }: RoomImageProps) {
  return (
    <div className="relative">
      {room.image_url ? (
        <div className="relative w-full h-48">
          <Image
            src={room.image_url}
            alt={`${room.name} interior`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-gray-400" aria-hidden="true" />
        </div>
      )}

      {/* Status Indicator */}
      <span className="absolute top-3 right-3 flex size-3.5" aria-label={`Room status: ${room.status}`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusColor} opacity-75`}></span>
        <span className={`relative inline-flex size-3.5 rounded-full ${statusColor}`}></span>
      </span>
    </div>
  )
}

function RoomTitle({ name }: { name: string }) {
  return (
    <h3 className="font-bold text-lg text-gray-900 mb-3">
      {name}
    </h3>
  )
}

interface RoomMetricsProps {
  room: RoomWithSensorData
}

function RoomMetrics({ room }: RoomMetricsProps) {
  const metrics = [
    {
      icon: Users,
      label: 'Occupancy',
      value: room.currentOccupancy !== undefined
        ? `${room.currentOccupancy}/${room.capacity}`
        : 'No data',
      available: room.currentOccupancy !== undefined
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: room.currentTemperature !== undefined
        ? formatTemperature(room.currentTemperature)
        : 'No data',
      available: room.currentTemperature !== undefined
    },
    {
      icon: Volume2,
      label: 'Noise',
      value: room.currentNoiseLevel !== undefined
        ? `${room.currentNoiseLevel} dB`
        : 'No data',
      available: room.currentNoiseLevel !== undefined
    },
    {
      icon: Wind,
      label: 'Air Quality',
      value: room.currentAirQuality !== undefined
        ? `${room.currentAirQuality}/100`
        : 'No data',
      available: room.currentAirQuality !== undefined
    }
  ]

  return (
    <div className="space-y-2 mb-4">
      {metrics.map(({ icon: Icon, label, value, available }) => (
        <MetricRow
          key={label}
          icon={Icon}
          label={label}
          value={value}
          available={available}
        />
      ))}
    </div>
  )
}

interface MetricRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  available: boolean
}

function MetricRow({ icon: Icon, label, value, available }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-600" aria-hidden="true" />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-medium ${available ? 'text-gray-900' : 'text-gray-400 text-sm'}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

interface RoomStatusProps {
  status: string
  variant: 'default' | 'destructive' | 'secondary'
  lastUpdated?: string
}

function RoomStatus({ status, variant, lastUpdated }: RoomStatusProps) {
  const displayStatus = status === 'unknown' ? 'No Data' : status

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <Badge variant={variant} className="capitalize mb-2">
        {displayStatus}
      </Badge>

      {lastUpdated && (
        <p className="text-xs text-gray-400">
          Last updated: {formatTime(lastUpdated)}
        </p>
      )}
    </div>
  )
}
