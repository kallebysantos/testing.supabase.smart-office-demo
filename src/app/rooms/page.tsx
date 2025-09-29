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
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

type SearchBarProps = {
  onSearch: (query: string) => void
  disabled?: boolean
}
function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) return;

    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full  max-w-2xl">
      <fieldset className="flex items-center gap-2 w-full" disabled={disabled}>
        <Input
          type="text"
          placeholder="Natural language search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </fieldset>
    </form>
  );
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
            <div className='flex flex-col gap-6'>

              <RoomsHeader roomCount={rooms.length} />

              <div className='flex items-center justify-center mb-6'>
                <SearchBar onSearch={getRooms} disabled={roomsLoading} />
              </div>

              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                </div>
              )
                : roomsLoading
                  ? <LoadingSpinner />
                  : <RoomsGrid rooms={rooms} />
              }
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
