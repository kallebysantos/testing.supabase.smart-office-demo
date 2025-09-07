/**
 * Rooms Grid - Grid layout for room cards
 * 
 * Responsive grid that displays room cards with proper loading and empty states
 */

import { Building2 } from 'lucide-react'
import { RoomCard } from './RoomCard'
import type { RoomWithSensorData } from '@/types'

interface RoomsGridProps {
  rooms: RoomWithSensorData[]
}

export function RoomsGrid({ rooms }: RoomsGridProps) {
  if (rooms.length === 0) {
    return <EmptyRoomsState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}

function EmptyRoomsState() {
  return (
    <div className="text-center py-12">
      <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">No Rooms Found</h3>
      <p className="text-gray-600">
        Run the room generation script to populate the database.
      </p>
    </div>
  )
}