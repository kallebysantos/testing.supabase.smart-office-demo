/**
 * Rooms Page - Real-time conference room monitoring
 * 
 * Displays all conference rooms with live sensor data, occupancy status,
 * and environmental metrics. Uses proper hooks and error boundaries.
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { RoomsGrid } from '@/components/rooms/RoomsGrid'
import { RoomsHeader } from '@/components/rooms/RoomsHeader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRooms } from '@/hooks/useRooms'

export default function RoomsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { rooms, loading: roomsLoading, error } = useRooms()

  if (authLoading || roomsLoading) {
    return <LoadingSpinner />
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          <ErrorBoundary>
            <RoomsHeader roomCount={rooms.length} />
            
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : (
              <RoomsGrid rooms={rooms} />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}