/**
 * Fake Floorplan Data - Based on Real Office Layout
 *
 * This file contains the floorplan data structure and room definitions
 * for the Smart Office Dashboard demo. The layout is based on a real
 * office floorplan with conference rooms, offices, and amenities.
 */

export interface RoomPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomData {
  id: string;
  name: string;
  type:
    | "conference"
    | "office"
    | "huddle"
    | "break"
    | "reception"
    | "supply"
    | "restroom"
    | "elevator"
    | "cubicles";
  occupancy: number;
  capacity: number;
  temperature: number;
  airQuality: number;
  noiseLevel: number;
  position: RoomPosition;
  description?: string;
  roomId?: string; // Real database room ID for live data
}

export interface FloorplanConfig {
  totalWidth: number;
  totalHeight: number;
  scale: number; // pixels per foot
  rooms: RoomData[];
}

/**
 * Generate a realistic floorplan based on the actual office layout
 * Rectangular layout with elevators in center, offices around perimeter
 */
export function generateFloorplan(): FloorplanConfig {
  const scale = 2.5; // pixels per foot
  const totalWidth = Math.round(120.67 * scale); // ~302px
  const totalHeight = Math.round(60 * scale); // 150px

  const rooms: RoomData[] = [
    // CORNER OFFICES - These are the corner offices around the perimeter
    // Top-left corner office
    {
      id: "office-corner-tl",
      name: "Corner Office TL",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 0, width: 30, height: 25 },
      description: "CORNER OFFICE - Top Left",
    },
    // Top-right corner office
    {
      id: "office-corner-tr",
      name: "Corner Office TR",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 0, width: 30, height: 25 },
      description: "CORNER OFFICE - Top Right",
    },
    // Bottom-left corner office
    {
      id: "office-corner-bl",
      name: "Corner Office BL",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 180, width: 30, height: 20 },
      description: "CORNER OFFICE - Bottom Left",
    },
    // Bottom-right corner office
    {
      id: "office-corner-br",
      name: "Corner Office BR",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 180, width: 30, height: 20 },
      description: "CORNER OFFICE - Bottom Right",
    },

    // TOP ROW OFFICES (between corner offices) - 8 offices
    {
      id: "office-top-1",
      name: "Office T1",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 30, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-2",
      name: "Office T2",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 36,
      position: { x: 60, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-3",
      name: "Office T3",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 90, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-4",
      name: "Office T4",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 120, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-5",
      name: "Office T5",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 36,
      position: { x: 150, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-6",
      name: "Office T6",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 37,
      position: { x: 180, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-7",
      name: "Office T7",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 210, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },
    {
      id: "office-top-8",
      name: "Office T8",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 240, y: 0, width: 30, height: 25 },
      description: "Top row office",
    },

    // BOTTOM ROW OFFICES (between corner offices) - 8 offices, abutting bottom edge
    {
      id: "office-bottom-1",
      name: "Office B1",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 30, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-2",
      name: "Office B2",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 36,
      position: { x: 60, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-3",
      name: "Office B3",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 90, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-4",
      name: "Office B4",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 120, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-5",
      name: "Office B5",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 36,
      position: { x: 150, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-6",
      name: "Office B6",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 37,
      position: { x: 180, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-7",
      name: "Office B7",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 210, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },
    {
      id: "office-bottom-8",
      name: "Office B8",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 240, y: 180, width: 30, height: 20 },
      description: "Bottom row office",
    },

    // LEFT SIDE OFFICES (between corner offices) - 5 offices
    {
      id: "office-left-1",
      name: "Office L1",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 25, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-2",
      name: "Office L2",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 36,
      position: { x: 0, y: 45, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-3",
      name: "Office L3",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 0, y: 65, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-4",
      name: "Office L4",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 0, y: 85, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-5",
      name: "Office L5",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 105, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-6",
      name: "Office L6",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 125, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-7",
      name: "Office L7",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 145, width: 30, height: 20 },
      description: "Left side office",
    },
    {
      id: "office-left-8",
      name: "Office L8",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 0, y: 165, width: 30, height: 20 },
      description: "Left side office",
    },

    // RIGHT SIDE OFFICES (between corner offices) - 5 offices
    {
      id: "office-right-1",
      name: "Office R1",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 25, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-2",
      name: "Office R2",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 73,
      airQuality: 86,
      noiseLevel: 36,
      position: { x: 270, y: 45, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-3",
      name: "Office R3",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 71,
      airQuality: 84,
      noiseLevel: 35,
      position: { x: 270, y: 65, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-4",
      name: "Office R4",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 74,
      airQuality: 87,
      noiseLevel: 38,
      position: { x: 270, y: 85, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-5",
      name: "Office R5",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 105, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-6",
      name: "Office R6",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 125, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-7",
      name: "Office R7",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 145, width: 30, height: 20 },
      description: "Right side office",
    },
    {
      id: "office-right-8",
      name: "Office R8",
      type: "office",
      occupancy: 0,
      capacity: 1,
      temperature: 72,
      airQuality: 85,
      noiseLevel: 35,
      position: { x: 270, y: 165, width: 30, height: 20 },
      description: "Right side office",
    },

    // ELEVATORS IN CENTER - 4 elevators with squares and crossing lines
    {
      id: "elevator-1",
      name: "Elevator 1",
      type: "elevator",
      occupancy: 0,
      capacity: 0,
      temperature: 70,
      airQuality: 80,
      noiseLevel: 30,
      position: { x: 135, y: 55, width: 15, height: 15 },
      description: "Elevator 1",
    },
    {
      id: "elevator-2",
      name: "Elevator 2",
      type: "elevator",
      occupancy: 0,
      capacity: 0,
      temperature: 70,
      airQuality: 80,
      noiseLevel: 30,
      position: { x: 150, y: 55, width: 15, height: 15 },
      description: "Elevator 2",
    },
    {
      id: "elevator-3",
      name: "Elevator 3",
      type: "elevator",
      occupancy: 0,
      capacity: 0,
      temperature: 70,
      airQuality: 80,
      noiseLevel: 30,
      position: { x: 135, y: 70, width: 15, height: 15 },
      description: "Elevator 3",
    },
    {
      id: "elevator-4",
      name: "Elevator 4",
      type: "elevator",
      occupancy: 0,
      capacity: 0,
      temperature: 70,
      airQuality: 80,
      noiseLevel: 30,
      position: { x: 150, y: 70, width: 15, height: 15 },
      description: "Elevator 4",
    },

    // CONFERENCE ROOMS IN YELLOW - on either side of elevators (LIVE DATA)
    {
      id: "conference-left-top",
      name: "Cavapoo",
      type: "conference",
      occupancy: 1,
      capacity: 12,
      temperature: 70.8,
      airQuality: 85,
      noiseLevel: 45.2,
      position: { x: 50, y: 40, width: 60, height: 50 },
      description: "Large conference room with video equipment",
      roomId: "48075858-e483-4928-9cdc-149e6703e1ff", // Real room ID
    },
    {
      id: "conference-right-top",
      name: "Golden Retriever",
      type: "conference",
      occupancy: 1,
      capacity: 14,
      temperature: 70.4,
      airQuality: 90,
      noiseLevel: 43.2,
      position: { x: 180, y: 40, width: 60, height: 50 },
      description: "Large conference room with presentation setup",
      roomId: "65568e8b-79f7-489e-b632-163ddfc0ba94", // Real room ID
    },
    {
      id: "conference-left-bottom",
      name: "Corgi",
      type: "conference",
      occupancy: 0,
      capacity: 4,
      temperature: 70.2,
      airQuality: 85,
      noiseLevel: 34.1,
      position: { x: 80, y: 100, width: 60, height: 50 },
      description: "Small meeting room for intimate discussions",
      roomId: "a5f976bc-dba0-43b3-a2e6-2c2b37108977", // Real room ID
    },
    {
      id: "conference-right-bottom",
      name: "Beagle",
      type: "conference",
      occupancy: 0,
      capacity: 6,
      temperature: 70.3,
      airQuality: 89,
      noiseLevel: 33.1,
      position: { x: 160, y: 100, width: 60, height: 50 },
      description: "Medium conference room with smart TV",
      roomId: "bda31081-76d4-460e-9890-4d0a5484e256", // Real room ID
    },
  ];

  return {
    totalWidth,
    totalHeight,
    scale,
    rooms,
  };
}

/**
 * Get room color based on occupancy and type
 */
export function getRoomColor(room: RoomData): string {
  const utilization = room.occupancy / room.capacity;

  // Special colors for different room types
  if (room.type === "elevator") return "#000000"; // Black for elevators
  if (room.type === "cubicles") return "transparent"; // Transparent for cubicles area
  if (room.type === "restroom") return "#9ca3af"; // Gray for restrooms
  if (room.type === "supply") return "#6b7280"; // Dark gray for supply rooms
  if (room.type === "reception") return "#3b82f6"; // Blue for reception

  // Special logic for conference rooms
  if (room.type === "conference") {
    if (room.occupancy === 0) return "#10b981"; // Green - available (empty)
    if (utilization >= 0.7) return "#f97316"; // Orange - at 70%+ capacity
    return "#ef4444"; // Red - occupied (has people in it)
  }

  // Color based on occupancy for offices
  if (utilization >= 1) return "#ef4444"; // Red - full/over capacity
  if (utilization >= 0.7) return "#f59e0b"; // Amber - high utilization
  if (utilization > 0) return "#10b981"; // Green - occupied
  return "#6b7280"; // Gray - empty
}

/**
 * Get room glow effect for active rooms
 */
export function getRoomGlow(room: RoomData): string {
  const utilization = room.occupancy / room.capacity;

  // No glow for utility rooms and conference rooms (using color instead)
  if (
    room.type === "elevator" ||
    room.type === "cubicles" ||
    room.type === "restroom" ||
    room.type === "supply" ||
    room.type === "conference"
  )
    return "none";

  // Glow based on occupancy for other rooms
  if (utilization >= 1) return "0 0 20px rgba(239, 68, 68, 0.8)";
  if (utilization >= 0.7) return "0 0 15px rgba(245, 158, 11, 0.6)";
  if (utilization > 0) return "0 0 10px rgba(16, 185, 129, 0.4)";
  return "none";
}

/**
 * Get room type icon
 */
export function getRoomTypeIcon(room: RoomData): string {
  switch (room.type) {
    case "conference":
      return "🏢";
    case "office":
      return "🏢";
    case "huddle":
      return "💬";
    case "break":
      return "☕";
    case "reception":
      return "🏢";
    case "supply":
      return "📦";
    case "restroom":
      return "🚻";
    case "elevator":
      return "🛗";
    case "cubicles":
      return "";
    default:
      return "🏢";
  }
}

/**
 * Get room type label
 */
export function getRoomTypeLabel(room: RoomData): string {
  switch (room.type) {
    case "conference":
      return "Conference";
    case "office":
      return "Office";
    case "huddle":
      return "Huddle";
    case "break":
      return "Break Room";
    case "reception":
      return "Reception";
    case "supply":
      return "Supply";
    case "restroom":
      return "Restroom";
    case "elevator":
      return "Elevator";
    case "cubicles":
      return "Cubicles";
    default:
      return "Room";
  }
}
