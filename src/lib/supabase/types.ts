export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          floor: number
          building: string
          amenities: string[] | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          floor: number
          building?: string
          amenities?: string[] | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          floor?: number
          building?: string
          amenities?: string[] | null
          image_url?: string | null
          created_at?: string
        }
      }
      sensor_readings: {
        Row: {
          id: string
          room_id: string | null
          occupancy: number
          temperature: number | null
          noise_level: number | null
          air_quality: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          occupancy: number
          temperature?: number | null
          noise_level?: number | null
          air_quality?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          occupancy?: number
          temperature?: number | null
          noise_level?: number | null
          air_quality?: number | null
          timestamp?: string
        }
      }
      room_bookings: {
        Row: {
          id: string
          room_id: string | null
          title: string
          organizer_email: string | null
          start_time: string
          end_time: string
          attendee_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          title: string
          organizer_email?: string | null
          start_time: string
          end_time: string
          attendee_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          title?: string
          organizer_email?: string | null
          start_time?: string
          end_time?: string
          attendee_count?: number | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          department: string | null
          role: 'employee' | 'facilities' | 'admin'
          floor_access: number[] | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          department?: string | null
          role?: 'employee' | 'facilities' | 'admin'
          floor_access?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          department?: string | null
          role?: 'employee' | 'facilities' | 'admin'
          floor_access?: number[] | null
          created_at?: string
        }
      }
      daily_room_analytics: {
        Row: {
          id: string
          room_id: string | null
          date: string
          total_occupancy_hours: number | null
          peak_occupancy: number | null
          avg_temperature: number | null
          booking_count: number | null
          utilization_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          date: string
          total_occupancy_hours?: number | null
          peak_occupancy?: number | null
          avg_temperature?: number | null
          booking_count?: number | null
          utilization_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          date?: string
          total_occupancy_hours?: number | null
          peak_occupancy?: number | null
          avg_temperature?: number | null
          booking_count?: number | null
          utilization_rate?: number | null
          created_at?: string
        }
      }
      facility_alerts: {
        Row: {
          id: string
          room_id: string | null
          alert_type: string
          message: string
          severity: 'low' | 'medium' | 'high'
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          alert_type: string
          message: string
          severity?: 'low' | 'medium' | 'high'
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          alert_type?: string
          message?: string
          severity?: 'low' | 'medium' | 'high'
          resolved?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {}
        Returns: string
      }
      has_floor_access: {
        Args: {
          floor_number: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type SensorReading = Database['public']['Tables']['sensor_readings']['Row']
export type RoomBooking = Database['public']['Tables']['room_bookings']['Row']
export type FacilityAlert = Database['public']['Tables']['facility_alerts']['Row']