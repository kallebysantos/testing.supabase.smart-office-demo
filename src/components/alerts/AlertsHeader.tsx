/**
 * Alerts Header - Header for the alerts page
 * 
 * Displays page title, status overview, and violation detection trigger
 */

import { AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TicketStatus } from '@/types'

interface AlertsHeaderProps {
  statusCounts: Record<TicketStatus, number>
  onTriggerDetection: () => void
}

export function AlertsHeader({ statusCounts, onTriggerDetection }: AlertsHeaderProps) {
  const activeTickets = (statusCounts.queued || 0) + (statusCounts.processing || 0) + (statusCounts.assigned || 0)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facilities Alert System</h1>
          <p className="text-gray-600 mt-2">
            Real-time capacity violation detection and automated service ticket management
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Live Queue Processing</span>
          </div>
          
          <Button
            onClick={onTriggerDetection}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Trigger Detection</span>
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-gray-900">Queue Status</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <StatusBadge label="Queued" count={statusCounts.queued || 0} variant="default" />
            <StatusBadge label="Processing" count={statusCounts.processing || 0} variant="secondary" />
            <StatusBadge label="Assigned" count={statusCounts.assigned || 0} variant="destructive" />
            <StatusBadge label="Resolved" count={statusCounts.resolved || 0} variant="outline" />
          </div>
        </div>
        
        {activeTickets > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {activeTickets} active ticket{activeTickets !== 1 ? 's' : ''} in the system
          </div>
        )}
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  label: string
  count: number
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

function StatusBadge({ label, count, variant }: StatusBadgeProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <Badge variant={variant} className="font-medium">
        {count}
      </Badge>
    </div>
  )
}