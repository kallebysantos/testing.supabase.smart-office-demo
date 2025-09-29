/**
 * Rooms Header - Header section for the rooms page
 * 
 * Displays page title, description, live status indicator, and legend
 */


interface RoomsHeaderProps {
  roomCount: number
}

export function RoomsHeader({ roomCount }: RoomsHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap-reverse md:flex-row items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conference Rooms</h1>
          <p className="text-gray-600 mt-2">
            Real-time occupancy and environmental monitoring for {roomCount} rooms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>

      <RoomStatusLegend />
    </div>
  )
}

function RoomStatusLegend() {
  const statusItems = [
    { color: 'bg-green-500', label: 'Available' },
    { color: 'bg-yellow-500', label: 'Occupied' },
    { color: 'bg-red-500', label: 'Full' },
    { color: 'bg-gray-400', label: 'No Data' }
  ]

  return (
    <div className="flex items-center space-x-6 text-sm text-gray-600">
      {statusItems.map(({ color, label }) => (
        <div key={label} className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${color} rounded-full`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
