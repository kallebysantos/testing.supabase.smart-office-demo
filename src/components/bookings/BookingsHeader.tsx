/**
 * Bookings Header - Header section for bookings page
 * 
 * Displays page title, description, and live status indicator
 */

export function BookingsHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap-reverse md:flex-row items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">
            Real-time conference room reservations with live occupancy data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>
    </div>
  )
}
