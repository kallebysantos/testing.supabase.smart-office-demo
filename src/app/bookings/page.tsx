/**
 * Bookings Page - Meeting management and real-time monitoring
 * 
 * Displays booking data with filtering, status management, and live sensor data
 * for active meetings. Uses proper hooks and component composition.
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { BookingsHeader } from '@/components/bookings/BookingsHeader'
import { BookingsFilters } from '@/components/bookings/BookingsFilters'
import { BookingsList } from '@/components/bookings/BookingsList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useBookings } from '@/hooks/useBookings'
import type { BookingStatus } from '@/types'

export default function BookingsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { bookings, loading: bookingsLoading, error, filterByStatus, getStatusCounts } = useBookings()
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('active')

  if (authLoading || bookingsLoading) {
    return <LoadingSpinner text="Loading bookings..." />
  }

  if (!user || !userProfile) {
    return null
  }

  const filteredBookings = filterByStatus(activeFilter)
  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          <ErrorBoundary>
            <BookingsHeader />
            
            <BookingsFilters 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              statusCounts={statusCounts}
            />
            
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : (
              <BookingsList 
                bookings={filteredBookings}
                activeFilter={activeFilter}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}