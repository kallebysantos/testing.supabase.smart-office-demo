import type { UserProfile } from "@/types";

/**
 * Simulates Row Level Security (RLS) by filtering sensitive data based on user role
 * In production, this would be handled by Supabase RLS policies on the database level
 */

export function filterBookingData<T extends { title?: string; organizer?: string; attendees?: string[] }>(
  data: T,
  userRole: string | undefined
): T {
  // Facilities managers and admins can see all data
  if (userRole === "facilities" || userRole === "admin") {
    return data;
  }

  // Regular employees cannot see meeting details (privacy simulation)
  return {
    ...data,
    title: data.title ? "Private Meeting" : undefined,
    organizer: data.organizer ? "Private" : undefined,
    attendees: data.attendees ? ["Private"] : undefined,
  };
}

export function filterBookingsArray<T extends { title?: string; organizer?: string; attendees?: string[] }>(
  bookings: T[],
  userRole: string | undefined
): T[] {
  return bookings.map(booking => filterBookingData(booking, userRole));
}

/**
 * Check if user has access to view detailed booking information
 */
export function canViewBookingDetails(userRole: string | undefined): boolean {
  return userRole === "facilities" || userRole === "admin";
}

/**
 * Check if user has access to a specific floor
 */
export function hasFloorAccess(
  userProfile: UserProfile | null,
  floor: number
): boolean {
  if (!userProfile) return false;
  
  // Facilities and admin have access to all floors
  if (userProfile.role === "facilities" || userProfile.role === "admin") {
    return true;
  }
  
  // Check if floor is in user's access list
  return userProfile.floors_access?.includes(floor) || false;
}

/**
 * Filter rooms based on user's floor access
 */
export function filterRoomsByAccess<T extends { floor: number }>(
  rooms: T[],
  userProfile: UserProfile | null
): T[] {
  if (!userProfile) return [];
  
  // Facilities and admin can see all rooms
  if (userProfile.role === "facilities" || userProfile.role === "admin") {
    return rooms;
  }
  
  // Filter based on floor access
  return rooms.filter(room => 
    userProfile.floors_access?.includes(room.floor) || false
  );
}