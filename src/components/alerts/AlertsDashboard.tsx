/**
 * Alerts Dashboard - Overview dashboard for facilities management
 * 
 * Shows high-priority tickets, recent activity, and system metrics
 */

import { AlertTriangle, Clock, CheckCircle, Users } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/utils/format'
import { getTicketSeverityColor } from '@/lib/utils/ticket-status'
import type { ServiceTicketWithRoom, TicketStatus } from '@/types'

interface AlertsDashboardProps {
  statusCounts: Record<TicketStatus, number>
  highPriorityTickets: ServiceTicketWithRoom[]
  recentActivity: ServiceTicketWithRoom[]
}

export function AlertsDashboard({ 
  statusCounts, 
  highPriorityTickets, 
  recentActivity 
}: AlertsDashboardProps) {
  const totalTickets = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const activeTickets = (statusCounts.queued || 0) + (statusCounts.processing || 0) + (statusCounts.assigned || 0)
  const resolutionRate = totalTickets > 0 ? Math.round(((statusCounts.resolved || 0) / totalTickets) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {/* Active Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Tickets</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{activeTickets}</div>
          <p className="text-xs text-gray-500">Requiring attention</p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
          <Users className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{highPriorityTickets.length}</div>
          <p className="text-xs text-gray-500">Critical violations</p>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">3.2m</div>
          <p className="text-xs text-gray-500">Queue to assignment</p>
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
          <p className="text-xs text-gray-500">Last 24 hours</p>
        </CardContent>
      </Card>

      {/* High Priority Tickets List */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Critical Violations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highPriorityTickets.length > 0 ? (
            <div className="space-y-3">
              {highPriorityTickets.slice(0, 4).map((ticket) => (
                <HighPriorityTicketItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No critical violations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((ticket) => (
                <RecentActivityItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface HighPriorityTicketItemProps {
  ticket: ServiceTicketWithRoom
}

function HighPriorityTicketItem({ ticket }: HighPriorityTicketItemProps) {
  const severityColor = getTicketSeverityColor(ticket.severity)

  return (
    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${severityColor}`} />
          {ticket.external_ticket_id && (
            <Image 
              src="/images/servicenowicon.png" 
              alt="ServiceNow" 
              width={12} 
              height={12}
              className="opacity-70"
            />
          )}
          <span className="font-medium text-gray-900 text-sm">{ticket.room.name}</span>
          <Badge variant="destructive" className="text-xs">
            Priority {ticket.priority}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{ticket.title}</p>
      </div>
      <div className="text-xs text-gray-500">
        {formatTimeAgo(ticket.created_at)}
      </div>
    </div>
  )
}

interface RecentActivityItemProps {
  ticket: ServiceTicketWithRoom
}

function RecentActivityItem({ ticket }: RecentActivityItemProps) {
  const getActivityIcon = () => {
    if (ticket.status === 'resolved') return <CheckCircle className="h-4 w-4 text-green-600" />
    if (ticket.status === 'assigned') return <Users className="h-4 w-4 text-blue-600" />
    return <AlertTriangle className="h-4 w-4 text-orange-600" />
  }

  const getActivityText = () => {
    if (ticket.status === 'resolved') return 'Resolved'
    if (ticket.status === 'assigned') return `Assigned to ${ticket.assigned_to}`
    return 'Created'
  }

  return (
    <div className="flex items-center space-x-3 p-2">
      {getActivityIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {ticket.room.name}
        </p>
        <p className="text-xs text-gray-500">
          {getActivityText()} • {formatTimeAgo(ticket.updated_at)}
        </p>
      </div>
      <Badge 
        variant={ticket.status === 'resolved' ? 'outline' : 'secondary'} 
        className="text-xs"
      >
        {ticket.status}
      </Badge>
    </div>
  )
}