/**
 * Alerts Page - Real-time facilities management and service tickets
 * 
 * Monitors capacity violations, service ticket queues, and automated
 * resolution workflows for enterprise facilities management
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import NavigationMenu from '@/components/navigation/NavigationMenu'
import { AlertsHeader } from '@/components/alerts/AlertsHeader'
import { AlertsDashboard } from '@/components/alerts/AlertsDashboard'
import { ServiceTicketsQueue } from '@/components/alerts/ServiceTicketsQueue'
import { TicketResolutionMonitor } from '@/components/alerts/TicketResolutionMonitor'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAlerts } from '@/hooks/useAlerts'

export default function AlertsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const {
    loading: alertsLoading,
    error,
    filterByStatus,
    getStatusCounts,
    getHighPriorityTickets,
    getRecentActivity,
    resolveTicket,
    triggerDetection
  } = useAlerts()

  if (authLoading || alertsLoading) {
    return <LoadingSpinner text="Loading alerts system..." />
  }

  if (!user || !userProfile) {
    return null
  }

  // Only allow facilities and admin users
  if (userProfile.role === 'employee') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to Facilities and Admin users.</p>
        </div>
      </div>
    )
  }

  const queuedTickets = filterByStatus('queued')
  const processingTickets = filterByStatus('processing')
  const assignedTickets = filterByStatus('assigned')
  const resolvedTickets = filterByStatus('resolved')
  const statusCounts = getStatusCounts()
  const highPriorityTickets = getHighPriorityTickets()
  const recentActivity = getRecentActivity()

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          <ErrorBoundary>
            <AlertsHeader 
              statusCounts={statusCounts}
              onTriggerDetection={triggerDetection}
            />
            
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Dashboard Overview */}
                <AlertsDashboard 
                  statusCounts={statusCounts}
                  highPriorityTickets={highPriorityTickets}
                  recentActivity={recentActivity}
                />

                {/* Real-time Queue Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ServiceTicketsQueue 
                    queuedTickets={queuedTickets}
                    processingTickets={processingTickets}
                    assignedTickets={assignedTickets}
                  />
                  
                  <TicketResolutionMonitor 
                    resolvedTickets={resolvedTickets.slice(0, 10)}
                    onResolveTicket={resolveTicket}
                  />
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}