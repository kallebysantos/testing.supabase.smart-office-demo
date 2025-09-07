/**
 * Bookings Page - Meeting management with multiple view types
 * 
 * Supports List, Room, Day, Week, and Month views with status filtering
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { BookingsHeader } from '@/components/bookings/BookingsHeader'
import { BookingsFilters } from '@/components/bookings/BookingsFilters'
import { ViewTypeFilters, type ViewType } from '@/components/bookings/ViewTypeFilters'
import { BookingsList } from '@/components/bookings/BookingsList'
import { CalendarView } from '@/components/bookings/CalendarView'
import { RoomView } from '@/components/bookings/RoomView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useBookings } from '@/hooks/useBookings'
import { roomsApi } from '@/lib/api/rooms'
import type { BookingStatus, Room } from '@/types'

export default function BookingsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { bookings, loading: bookingsLoading, error, filterByStatus, getStatusCounts } = useBookings()
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('active')
  const [viewType, setViewType] = useState<ViewType>('list')
  const [rooms, setRooms] = useState<Room[]>([])

  // Fetch rooms data for room view
  useEffect(() => {
    const fetchRooms = async () => {
      const response = await roomsApi.getRooms()
      if (response.success && response.data) {
        setRooms(response.data)
      }
    }
    
    if (viewType === 'room') {
      fetchRooms()
    }
  }, [viewType])

  if (authLoading || bookingsLoading) {
    return <LoadingSpinner text="Loading bookings..." />
  }

  if (!user || !userProfile) {
    return null
  }

  const filteredBookings = filterByStatus(activeFilter)
  const statusCounts = getStatusCounts()

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      )
    }

    switch (viewType) {
      case 'list':
        return (
          <BookingsList 
            bookings={filteredBookings}
            activeFilter={activeFilter}
          />
        )
      
      case 'room':
        return <RoomView bookings={filteredBookings} rooms={rooms} />
      
      case 'day':
      case 'week':
      case 'month':
        return <CalendarView bookings={filteredBookings} viewType={viewType} />
      
      default:
        return (
          <BookingsList 
            bookings={filteredBookings}
            activeFilter={activeFilter}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          <ErrorBoundary>
            <BookingsHeader />
            
            {/* Filter Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
                <BookingsFilters 
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  statusCounts={statusCounts}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">View Type</h3>
                <ViewTypeFilters
                  activeView={viewType}
                  onViewChange={setViewType}
                />
              </div>
            </div>
            
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}