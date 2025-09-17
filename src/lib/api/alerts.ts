/**
 * Alerts API - Service ticket and facilities management
 *
 * Handles service tickets, capacity violations, and real-time alerts
 * for facilities management workflows
 */

import { ApiClient, supabase } from "./client";
import type {
  ServiceTicket,
  TicketStatus,
  ApiResponse,
} from "@/types";

export class AlertsApi extends ApiClient {
  /**
   * Fetch all service tickets with room data
   */
  async getServiceTickets(): Promise<ApiResponse<ServiceTicketWithRoom[]>> {
    return this.handleResponse(async () => {
      const { data, error } = await supabase
        .from("service_tickets")
        .select(
          `
          *,
          rooms!inner(name, floor, building)
        `
        )
        .order("created_at", { ascending: false });

      if (error) return { data: null, error };

      const ticketsWithRoom =
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        data?.map((ticket: any) => ({
          ...ticket,
          room: {
            name: ticket.rooms.name,
            floor: ticket.rooms.floor,
            building: ticket.rooms.building,
          },
        })) || [];

      return { data: ticketsWithRoom, error: null };
    });
  }

  /**
   * Filter tickets by status
   */
  filterTicketsByStatus<T extends ServiceTicket>(
    tickets: T[],
    status: TicketStatus
  ): T[] {
    return tickets.filter((ticket) => ticket.status === status);
  }

  /**
   * Get ticket counts by status
   */
  getTicketStatusCounts(
    tickets: ServiceTicket[]
  ): Record<TicketStatus, number> {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<TicketStatus, number>);
  }

  /**
   * Get tickets by priority (1 = highest priority)
   * Only shows Priority 1 tickets in critical violations section
   */
  getHighPriorityTickets(
    tickets: ServiceTicketWithRoom[],
    maxPriority = 1
  ): ServiceTicketWithRoom[] {
    return tickets
      .filter(
        (ticket) =>
          ticket.priority <= maxPriority && ticket.status !== "resolved"
      )
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get recent activity (newly created, assigned, or resolved tickets)
   */
  getRecentTicketActivity(
    tickets: ServiceTicketWithRoom[],
    hoursBack = 24
  ): ServiceTicketWithRoom[] {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    return tickets
      .filter((ticket) => {
        const createdAt = new Date(ticket.created_at);
        const assignedAt = ticket.assigned_at
          ? new Date(ticket.assigned_at)
          : null;
        const resolvedAt = ticket.resolved_at
          ? new Date(ticket.resolved_at)
          : null;

        return (
          createdAt >= cutoffTime ||
          (assignedAt && assignedAt >= cutoffTime) ||
          (resolvedAt && resolvedAt >= cutoffTime)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }

  /**
   * Manually resolve a ticket (for demo purposes)
   */
  async resolveTicket(
    ticketId: string,
    resolutionNotes: string
  ): Promise<ApiResponse<ServiceTicket>> {
    return this.handleResponse(async () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return (supabase as any)
        .from("service_tickets")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single();
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });
  }

  /**
   * Trigger capacity violation detection (calls Edge Function)
   */
  async triggerViolationDetection(): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch("/api/detect-violations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to trigger violation detection",
        };
      }

      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        error: "Failed to communicate with violation detection service",
      };
    }
  }
}

// Extended type for tickets with room data
export interface ServiceTicketWithRoom extends ServiceTicket {
  room: {
    name: string;
    floor: number;
    building: string;
  };
}

export const alertsApi = new AlertsApi();
