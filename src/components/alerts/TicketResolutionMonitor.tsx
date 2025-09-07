/**
 * Ticket Resolution Monitor - Real-time resolution tracking
 * 
 * Displays resolved tickets with resolution details and provides
 * manual resolution controls for assigned tickets
 */

import { useState } from 'react'
import { CheckCircle, Clock, User, MessageSquare, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatTimeAgo } from '@/lib/utils/format'
import { getTicketSeverityColor, getSLAStatus, getTicketAgeText } from '@/lib/utils/ticket-status'
import type { ServiceTicketWithRoom } from '@/types'

interface TicketResolutionMonitorProps {
  resolvedTickets: ServiceTicketWithRoom[]
  onResolveTicket: (ticketId: string, notes: string) => Promise<void>
}

export function TicketResolutionMonitor({ 
  resolvedTickets, 
  onResolveTicket 
}: TicketResolutionMonitorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Resolution Monitor</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Recent ticket resolutions and resolution tools</p>
      </CardHeader>
      <CardContent>
        {resolvedTickets.length > 0 ? (
          <div className="space-y-3">
            {resolvedTickets.map((ticket) => (
              <ResolvedTicketItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent resolutions</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <ManualResolutionTool onResolve={onResolveTicket} />
        </div>
      </CardContent>
    </Card>
  )
}

interface ResolvedTicketItemProps {
  ticket: ServiceTicketWithRoom
}

function ResolvedTicketItem({ ticket }: ResolvedTicketItemProps) {
  const severityColor = getTicketSeverityColor(ticket.severity)
  const slaStatus = getSLAStatus(ticket)
  const resolutionTime = ticket.resolved_at 
    ? formatTimeAgo(ticket.resolved_at)
    : 'Unknown'

  return (
    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
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
          <Badge variant="outline" className="text-xs text-green-700 border-green-300">
            Resolved
          </Badge>
          {ticket.external_ticket_id && (
            <ExternalLink className="h-3 w-3 text-gray-400" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`text-xs ${slaStatus.color}`}>
            {slaStatus.text}
          </Badge>
          <span className="text-xs text-gray-500">
            P{ticket.priority}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h5 className="font-medium text-sm text-gray-900">{ticket.room.name}</h5>
        <p className="text-xs text-gray-600 line-clamp-2">{ticket.title}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Resolved {resolutionTime}</span>
            </div>
            
            {ticket.assigned_to && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <User className="h-3 w-3" />
                <span>{ticket.assigned_to}</span>
              </div>
            )}
          </div>
          
          <span className="text-xs text-gray-500">
            {getTicketAgeText(ticket.created_at)}
          </span>
        </div>

        {/* Resolution Notes */}
        {ticket.resolution_notes && (
          <div className="mt-2 p-2 bg-white rounded border text-xs">
            <div className="flex items-start space-x-1">
              <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 leading-relaxed">
                {ticket.resolution_notes}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ManualResolutionToolProps {
  onResolve: (ticketId: string, notes: string) => Promise<void>
}

function ManualResolutionTool({ onResolve }: ManualResolutionToolProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    if (!ticketId.trim() || !notes.trim()) return
    
    setLoading(true)
    try {
      await onResolve(ticketId.trim(), notes.trim())
      setTicketId('')
      setNotes('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to resolve ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Manual Resolution</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Service Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ticket ID
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Enter ticket ID or external ticket ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Resolution Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the resolution actions taken..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!ticketId.trim() || !notes.trim() || loading}
            >
              {loading ? 'Resolving...' : 'Resolve Ticket'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}