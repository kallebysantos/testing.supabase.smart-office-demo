/**
 * useAlerts Hook - Manages service tickets and alerts with real-time updates
 *
 * Provides service ticket data with status filtering and real-time updates
 * for facilities management workflows
 */

import { useState, useEffect, useCallback } from "react";
import { alertsApi, ServiceTicketWithRoom } from "@/lib/api/alerts";
import { realtimeManager } from "@/lib/api/client";
import type { TicketStatus, ServiceTicket } from "@/types";

interface UseAlertsOptions {
  enableRealtime?: boolean;
  autoRefresh?: boolean;
}

interface UseAlertsReturn {
  tickets: ServiceTicketWithRoom[];
  loading: boolean;
  error: string | null;
  filterByStatus: (status: TicketStatus) => ServiceTicketWithRoom[];
  getStatusCounts: () => Record<TicketStatus, number>;
  getHighPriorityTickets: () => ServiceTicketWithRoom[];
  getRecentActivity: () => ServiceTicketWithRoom[];
  resolveTicket: (ticketId: string, notes: string) => Promise<void>;
  triggerDetection: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const { enableRealtime = true, autoRefresh = false } = options;

  const [tickets, setTickets] = useState<ServiceTicketWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const response = await alertsApi.getServiceTickets();

      if (response.success && response.data) {
        setTickets(response.data);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch service tickets");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("useAlerts fetchTickets error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTicketUpdate = useCallback(
    (payload: { eventType: string; new?: ServiceTicket }) => {
      console.log(
        "Service ticket update received:",
        payload.eventType,
        payload.new?.external_ticket_id
      );

      if (payload.eventType === "INSERT" && payload.new) {
        // const newTicket = payload.new as ServiceTicket;
        // For new tickets, refetch to get room data
        fetchTickets();
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const updatedTicket = payload.new as ServiceTicket;

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === updatedTicket.id
              ? { ...ticket, ...updatedTicket }
              : ticket
          )
        );
      }
    },
    [fetchTickets]
  );

  // Memoized filtering functions
  const filterByStatus = useCallback(
    (status: TicketStatus) => {
      return alertsApi.filterTicketsByStatus(tickets, status);
    },
    [tickets]
  );

  const getStatusCounts = useCallback(() => {
    return alertsApi.getTicketStatusCounts(tickets);
  }, [tickets]);

  const getHighPriorityTickets = useCallback(() => {
    return alertsApi.getHighPriorityTickets(tickets);
  }, [tickets]);

  const getRecentActivity = useCallback(() => {
    return alertsApi.getRecentTicketActivity(tickets);
  }, [tickets]);

  const resolveTicket = useCallback(async (ticketId: string, notes: string) => {
    try {
      const response = await alertsApi.resolveTicket(ticketId, notes);

      if (!response.success) {
        setError(response.error || "Failed to resolve ticket");
      }
      // Real-time subscription will handle the update
    } catch (err) {
      setError("Failed to resolve ticket");
      console.error("Error resolving ticket:", err);
    }
  }, []);

  const triggerDetection = useCallback(async () => {
    try {
      const response = await alertsApi.triggerViolationDetection();

      if (!response.success) {
        setError(response.error || "Failed to trigger detection");
      }
    } catch (err) {
      setError("Failed to trigger violation detection");
      console.error("Error triggering detection:", err);
    }
  }, []);

  useEffect(() => {
    fetchTickets();

    let realtimeChannelId: string | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    if (enableRealtime) {
      realtimeChannelId = realtimeManager.subscribe(
        "service_tickets",
        handleTicketUpdate,
        `alerts-updates-${Date.now()}`
      );
    }

    if (autoRefresh) {
      intervalId = setInterval(fetchTickets, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (realtimeChannelId) {
        realtimeManager.unsubscribe(realtimeChannelId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchTickets, enableRealtime, autoRefresh, handleTicketUpdate]);

  return {
    tickets,
    loading,
    error,
    filterByStatus,
    getStatusCounts,
    getHighPriorityTickets,
    getRecentActivity,
    resolveTicket,
    triggerDetection,
    refetch: fetchTickets,
  };
}
