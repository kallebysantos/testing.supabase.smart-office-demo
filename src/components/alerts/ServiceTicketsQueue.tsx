/**
 * Service Tickets Queue - Real-time queue monitoring
 * 
 * Displays queued, processing, and assigned tickets with live updates
 */

import { Clock, Loader2, User, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/utils/format'
import { getTicketSeverityColor, getTicketStatusVariant } from '@/lib/utils/ticket-status'
import type { ServiceTicketWithRoom } from '@/types'

interface ServiceTicketsQueueProps {
  queuedTickets: ServiceTicketWithRoom[]
  processingTickets: ServiceTicketWithRoom[]
  assignedTickets: ServiceTicketWithRoom[]
}

export function ServiceTicketsQueue({ 
  queuedTickets, 
  processingTickets, 
  assignedTickets 
}: ServiceTicketsQueueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Service Tickets Queue</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Real-time monitoring of capacity violation tickets</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Queued Tickets */}
        <QueueSection
          title="Queued for Processing"
          tickets={queuedTickets}
          icon={Clock}
          emptyMessage="No tickets in queue"
        />

        {/* Processing Tickets */}
        <QueueSection
          title="Currently Processing"
          tickets={processingTickets}
          icon={Loader2}
          emptyMessage="No tickets being processed"
          iconClass="animate-spin"
        />

        {/* Assigned Tickets */}
        <QueueSection
          title="Assigned to Team"
          tickets={assignedTickets}
          icon={User}
          emptyMessage="No tickets assigned"
        />
      </CardContent>
    </Card>
  )
}

interface QueueSectionProps {
  title: string
  tickets: ServiceTicketWithRoom[]
  icon: React.ComponentType<{ className?: string }>
  emptyMessage: string
  iconClass?: string
}

function QueueSection({ title, tickets, icon: Icon, emptyMessage, iconClass = '' }: QueueSectionProps) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <Icon className={`h-4 w-4 text-gray-600 ${iconClass}`} />
        <h4 className="font-medium text-gray-900">{title}</h4>
        <Badge variant="secondary" className="text-xs">
          {tickets.length}
        </Badge>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-2">
          {tickets.slice(0, 3).map((ticket) => (
            <TicketQueueItem key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-2">
              + {tickets.length - 3} more tickets
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

interface TicketQueueItemProps {
  ticket: ServiceTicketWithRoom
}

function TicketQueueItem({ ticket }: TicketQueueItemProps) {
  const severityColor = getTicketSeverityColor(ticket.severity)
  const statusVariant = getTicketStatusVariant(ticket.status)

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${severityColor}`} />
          <div className="flex items-center space-x-1">
            {ticket.external_ticket_id && (
              <Image 
                src="/images/servicenowicon.png" 
                alt="ServiceNow" 
                width={14} 
                height={14}
                className="opacity-75"
              />
            )}
            <span className="font-medium text-sm text-gray-900">
              {ticket.external_ticket_id || ticket.id.slice(0, 8)}
            </span>
          </div>
          <Badge variant={statusVariant} className="text-xs">
            {ticket.status}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          P{ticket.priority}
        </span>
      </div>

      <div className="space-y-1">
        <h5 className="font-medium text-sm text-gray-900">{ticket.room.name}</h5>
        <p className="text-xs text-gray-600 line-clamp-2">{ticket.description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Created {formatTimeAgo(ticket.created_at)}
          </span>
          
          {ticket.assigned_to && (
            <span className="text-xs text-blue-600 font-medium">
              {ticket.assigned_to}
            </span>
          )}
        </div>

        {/* Violation Data */}
        {ticket.violation_data && (
          <div className="mt-2 p-2 bg-white rounded border text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Occupancy:</span>
              <span className="font-medium text-red-600">
                {ticket.violation_data.occupancy}/{ticket.violation_data.capacity}
              </span>
            </div>
            {ticket.violation_data.violation_percentage && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Over capacity:</span>
                <span className="font-medium text-red-600">
                  {ticket.violation_data.violation_percentage}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}