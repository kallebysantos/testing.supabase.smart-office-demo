/**
 * API Client - Centralized data access layer
 *
 * Provides a clean abstraction over Supabase operations with proper error handling,
 * type safety, and consistent patterns across the application.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ApiResponse, AppError } from "@/types";

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

/**
 * Base API client with standardized error handling
 */
export class ApiClient {
  protected async handleResponse<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await operation();

      if (error) {
        console.error("API Error:", error);
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      return {
        success: true,
        data: data ?? undefined,
      };
    } catch (err) {
      console.error("Unexpected API Error:", err);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  }

  protected formatError(error: unknown): string {
    if (error?.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An error occurred while processing your request";
  }

  protected createAppError(
    code: string,
    message: string,
    details?: unknown
  ): AppError {
    return { code, message, details };
  }
}

/**
 * Real-time subscription manager
 */
export class RealtimeManager {
  private channels = new Map<string, unknown>();

  subscribe<T>(
    tableName: string,
    callback: (payload: T) => void,
    channelId?: string
  ) {
    const id = channelId || `${tableName}-${Date.now()}`;

    const channel = supabase
      .channel(id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        callback
      )
      .subscribe();

    this.channels.set(id, channel);
    return id;
  }

  unsubscribe(channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, id) => {
      supabase.removeChannel(channel);
      this.channels.delete(id);
    });
  }
}

export const realtimeManager = new RealtimeManager();
