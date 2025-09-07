/**
 * Service Tickets Generator - Creates realistic facility management tickets
 *
 * Generates authentic service tickets using OpenAI API for a law firm's
 * facilities team. Includes various ticket types, priorities, and statuses.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

interface ServiceTicket {
  room_id: string;
  ticket_type: "maintenance" | "environmental" | "capacity_violation";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "queued" | "processing" | "assigned" | "resolved";
  priority: number;
  trigger_reading_id?: string;
  violation_data?: Record<string, any>;
  assigned_to?: string;
  assigned_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  external_ticket_id?: string;
  external_system: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  building: string;
}

// OpenAI-powered ticket generator for realistic facility management tickets
class FacilityTicketGenerator {
  private openaiApiKey: string;
  private supabase: any;

  constructor(apiKey: string, supabase: any) {
    this.openaiApiKey = apiKey;
    this.supabase = supabase;
  }

  /**
   * Generate realistic facility management tickets using OpenAI
   */
  async generateTickets(count: number): Promise<ServiceTicket[]> {
    try {
      const prompt = `Generate ${count} realistic service tickets that would be submitted to a facilities management team at a large law firm office building. These should be authentic, everyday issues that facilities teams handle.

Include a variety of ticket types:
- Maintenance issues (broken equipment, cleaning needs, supplies)
- Environmental issues (temperature, lighting, air quality)
- General facility requests

For each ticket, provide:
1. A concise, professional title (max 60 characters)
2. A detailed description explaining the issue, location, and urgency
3. Appropriate severity level (low, medium, high, critical)
4. Realistic ticket type (maintenance, environmental, capacity_violation)

Examples of realistic tickets:
- "Conference Room 3A - Whiteboard markers dried out"
- "Kitchen Area - Coffee machine needs descaling"
- "Reception - Plants need watering"
- "Floor 4 - Temperature too cold in hallway"
- "Boardroom - Projector screen stuck halfway"
- "Break Room - Refrigerator making loud noise"
- "Lobby - Automatic door sensor not working"
- "Restroom - Paper towel dispenser empty"

Return the tickets as a JSON array with this exact structure:
[
  {
    "title": "Brief descriptive title",
    "description": "Detailed description of the issue, including location and any relevant details",
    "ticket_type": "maintenance|environmental|capacity_violation",
    "severity": "low|medium|high|critical"
  }
]`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // Cheapest model
            messages: [
              {
                role: "system",
                content:
                  "You are a facilities management assistant helping to generate realistic service tickets for a law firm office building. Focus on authentic, everyday issues that facilities teams encounter.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 2000,
            temperature: 0.8, // More creative variety
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Parse the JSON response
      const tickets = JSON.parse(content);
      return tickets;
    } catch (error) {
      console.warn("OpenAI API failed, using fallback tickets:", error);
      return this.getFallbackTickets(count);
    }
  }

  /**
   * Fallback tickets if OpenAI fails
   */
  private getFallbackTickets(count: number): ServiceTicket[] {
    const fallbackTickets: ServiceTicket[] = [
      {
        title: "Conference Room 3A - Whiteboard markers dried out",
        description:
          "All whiteboard markers in Conference Room 3A are dried out and unusable. Meeting scheduled for 2 PM today needs working markers for presentation.",
        ticket_type: "maintenance" as const,
        severity: "low" as const,
        room_id: "",
        status: "queued" as const,
        priority: 4,
        external_system: "ServiceNow",
      },
      {
        title: "Kitchen Area - Coffee machine needs descaling",
        description:
          "Main coffee machine in 4th floor kitchen is producing bitter coffee and needs descaling. Water flow is also slower than usual.",
        ticket_type: "maintenance" as const,
        severity: "medium" as const,
        room_id: "",
        status: "queued" as const,
        priority: 3,
        external_system: "ServiceNow",
      },
      {
        title: "Reception - Plants need watering",
        description:
          "Several plants in the main reception area are wilting and need immediate watering. Some leaves are turning brown.",
        ticket_type: "environmental" as const,
        severity: "low" as const,
        room_id: "",
        status: "queued" as const,
        priority: 4,
        external_system: "ServiceNow",
      },
      {
        title: "Floor 4 - Temperature too cold in hallway",
        description:
          "Hallway on 4th floor near elevators is uncomfortably cold. Staff are complaining about the temperature being too low.",
        ticket_type: "environmental" as const,
        severity: "medium" as const,
        room_id: "",
        status: "queued" as const,
        priority: 3,
        external_system: "ServiceNow",
      },
      {
        title: "Boardroom - Projector screen stuck halfway",
        description:
          "Electric projector screen in main boardroom is stuck in the halfway position and won't retract or extend fully.",
        ticket_type: "maintenance" as const,
        severity: "medium" as const,
        room_id: "",
        status: "queued" as const,
        priority: 3,
        external_system: "ServiceNow",
      },
      {
        title: "Break Room - Refrigerator making loud noise",
        description:
          "Refrigerator in 3rd floor break room is making a loud humming noise that's disturbing nearby offices.",
        ticket_type: "maintenance" as const,
        severity: "medium" as const,
        room_id: "",
        status: "queued" as const,
        priority: 3,
        external_system: "ServiceNow",
      },
      {
        title: "Lobby - Automatic door sensor not working",
        description:
          "Automatic door sensor on main entrance is not detecting people approaching. Door requires manual operation.",
        ticket_type: "maintenance" as const,
        severity: "high" as const,
        room_id: "",
        status: "queued" as const,
        priority: 2,
        external_system: "ServiceNow",
      },
      {
        title: "Restroom - Paper towel dispenser empty",
        description:
          "Paper towel dispenser in men's restroom on 2nd floor is empty and needs refilling.",
        ticket_type: "maintenance" as const,
        severity: "low" as const,
        room_id: "",
        status: "queued" as const,
        priority: 4,
        external_system: "ServiceNow",
      },
      {
        title: "Conference Room B - Air conditioning not working",
        description:
          "Air conditioning unit in Conference Room B is not cooling properly. Room temperature is 78°F and rising.",
        ticket_type: "environmental" as const,
        severity: "high" as const,
        room_id: "",
        status: "queued" as const,
        priority: 2,
        external_system: "ServiceNow",
      },
      {
        title: "Copy Room - Printer jam needs clearing",
        description:
          "Main printer in copy room has a paper jam that needs to be cleared. Multiple users unable to print.",
        ticket_type: "maintenance" as const,
        severity: "medium" as const,
        room_id: "",
        status: "queued" as const,
        priority: 3,
        external_system: "ServiceNow",
      },
    ];

    // Shuffle and return requested count
    const shuffled = fallbackTickets.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Assign realistic status and priority based on severity
   */
  public assignStatusAndPriority(severity: string): {
    status: string;
    priority: number;
  } {
    const statusOptions = ["queued", "processing", "assigned", "resolved"];
    const weights = [0.3, 0.25, 0.25, 0.2]; // 30% queued, 25% processing, 25% assigned, 20% resolved

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;
    let status = "queued";

    for (let i = 0; i < statusOptions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        status = statusOptions[i];
        break;
      }
    }

    // Priority based on severity
    let priority = 4; // Default low priority
    switch (severity) {
      case "critical":
        priority = 1;
        break;
      case "high":
        priority = 2;
        break;
      case "medium":
        priority = 3;
        break;
      case "low":
        priority = 4;
        break;
    }

    return { status, priority };
  }

  /**
   * Generate ServiceNow-style ticket ID
   */
  public generateTicketId(): string {
    return `INC${String(Date.now() + Math.floor(Math.random() * 1000)).slice(
      -7
    )}`;
  }

  /**
   * Get random room for ticket assignment
   */
  public getRandomRoom(rooms: Room[]): Room {
    return rooms[Math.floor(Math.random() * rooms.length)];
  }

  /**
   * Generate realistic assignment and resolution data
   */
  public generateAssignmentData(status: string): any {
    const facilitiesTeam = [
      "Sarah Johnson (Facilities Manager)",
      "Mike Chen (HVAC Technician)",
      "Lisa Rodriguez (Safety Coordinator)",
      "David Kim (Building Operations)",
      "Jennifer Martinez (Cleaning Supervisor)",
      "Robert Wilson (Maintenance Technician)",
    ];

    const data: any = {};

    if (status === "assigned" || status === "resolved") {
      data.assigned_to =
        facilitiesTeam[Math.floor(Math.random() * facilitiesTeam.length)];
      data.assigned_at = new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // Within last week
    }

    if (status === "resolved") {
      data.resolved_at = new Date(
        Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
      ).toISOString(); // Within last 3 days

      const resolutionNotes = [
        "Issue resolved. Equipment serviced and tested. All systems functioning normally.",
        "Maintenance completed. Parts replaced and system calibrated. No further action required.",
        "Cleaning completed. Area sanitized and supplies restocked. Ready for normal use.",
        "Temperature adjusted. HVAC system recalibrated. Comfort levels restored.",
        "Equipment repaired. New parts installed and tested. Full functionality restored.",
        "Issue addressed. Staff notified of resolution. Monitoring for any recurring problems.",
        "Maintenance performed. System updated and optimized. Performance improved.",
        "Cleaning and sanitization completed. Area refreshed and ready for occupancy.",
      ];

      data.resolution_notes =
        resolutionNotes[Math.floor(Math.random() * resolutionNotes.length)];
    }

    return data;
  }
}

// Main execution function
async function generateServiceTickets() {
  console.log("🎫 Starting service tickets generation...");

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey);
    process.exit(1);
  }

  if (!openaiApiKey) {
    console.warn("⚠️  OPENAI_API_KEY not found, will use fallback tickets");
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Get all rooms for ticket assignment
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .order("name");

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`);
    }

    if (!rooms || rooms.length === 0) {
      throw new Error("No rooms found in database");
    }

    console.log(`📊 Found ${rooms.length} rooms for ticket assignment`);

    // Initialize ticket generator
    const generator = new FacilityTicketGenerator(openaiApiKey || "", supabase);

    // Generate tickets (mix of different counts for variety)
    const ticketCounts = [8, 12, 15]; // Different batch sizes
    const totalTickets =
      ticketCounts[Math.floor(Math.random() * ticketCounts.length)];

    console.log(`🎯 Generating ${totalTickets} service tickets...`);

    // Generate ticket data using OpenAI or fallback
    const ticketData = await generator.generateTickets(totalTickets);

    // Convert to full ServiceTicket objects
    const tickets: ServiceTicket[] = ticketData.map((ticket: any) => {
      const room = generator.getRandomRoom(rooms);
      const { status, priority } = generator.assignStatusAndPriority(
        ticket.severity
      );
      const assignmentData = generator.generateAssignmentData(status);

      return {
        room_id: room.id,
        ticket_type: ticket.ticket_type,
        title: ticket.title,
        description: ticket.description,
        severity: ticket.severity,
        status: status,
        priority: priority,
        external_ticket_id: generator.generateTicketId(),
        external_system: "servicenow",
        ...assignmentData,
      };
    });

    // Insert tickets in batches
    const batchSize = 5;
    let totalInserted = 0;

    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from("service_tickets")
        .insert(batch);

      if (insertError) {
        console.error("❌ Error inserting ticket batch:", insertError);
      } else {
        totalInserted += batch.length;
        console.log(
          `✅ Inserted ${batch.length} tickets (${totalInserted} total)`
        );
      }
    }

    // Summary statistics
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.severity] = (acc[ticket.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("🎉 Service tickets generation completed!");
    console.log("");
    console.log("📊 Summary Statistics:");
    console.log(`   • Total tickets created: ${totalInserted}`);
    console.log(
      `   • Rooms with tickets: ${new Set(tickets.map((t) => t.room_id)).size}`
    );
    console.log("");
    console.log("📋 Status Distribution:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} tickets`);
    });
    console.log("");
    console.log("🚨 Severity Distribution:");
    Object.entries(severityCounts).forEach(([severity, count]) => {
      console.log(`   • ${severity}: ${count} tickets`);
    });
    console.log("");
    console.log("💡 Check your /alerts page to see the generated tickets!");
  } catch (error) {
    console.error("❌ Service tickets generation error:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateServiceTickets()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { generateServiceTickets };
