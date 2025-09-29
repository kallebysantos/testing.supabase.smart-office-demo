/**
 * Rooms Page - Real-time conference room monitoring
 *
 * Displays all conference rooms with live sensor data, occupancy status,
 * and environmental metrics. Uses proper hooks and error boundaries.
 */

'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { RoomsGrid } from '@/components/rooms/RoomsGrid'
import { RoomsHeader } from '@/components/rooms/RoomsHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRooms } from '@/hooks/useRooms'
import { CornerDownLeft } from 'lucide-react'
import { useState } from 'react'

type SearchBarProps = {
  onSearch: (query: string) => void
  disabled?: boolean
}
function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (disabled) return

    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl relative">
      <fieldset className="grid gap-2 w-full" disabled={disabled}>
        <label htmlFor="room-search" className="text-sm text-gray-600">
          Use natural language to search for a room
        </label>
        <div className="relative">
          <Input
            id="room-search"
            type="text"
            placeholder="A room that can seat 10 or more people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          {query && (
            <>
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <CornerDownLeft className="text-muted-foreground" size={14} />
              </span>
              <Button
                type="button"
                variant="ghost"
                className="absolute -right-20 top-1/2 -translate-y-1/2"
                onClick={(e) => {
                  e.preventDefault()
                  setQuery('')
                  onSearch('')
                }}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </fieldset>
    </form>
  )
}

export default function RoomsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { rooms, loading: roomsLoading, refetch: getRooms, error } = useRooms()

  if (authLoading) {
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
            <div className="flex flex-col gap-6">
              <RoomsHeader roomCount={rooms.length} />

              <div className="flex items-center  mb-6">
                <SearchBar onSearch={getRooms} disabled={roomsLoading} />
              </div>

              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                </div>
              ) : roomsLoading ? (
                <LoadingSpinner />
              ) : (
                <RoomsGrid rooms={rooms} />
              )}
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
