import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Room {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  department: string
}

interface RoomBooking {
  room_id: string
  title: string
  organizer_email: string
  start_time: string
  end_time: string
  attendee_count: number
}

// Law firm meeting generator using OpenAI
class LawFirmMeetingGenerator {
  private openaiApiKey: string
  
  constructor(apiKey: string) {
    this.openaiApiKey = apiKey
  }

  // Generate law firm meeting titles using OpenAI
  async generateMeetingTitles(count: number): Promise<string[]> {
    try {
      const prompt = `Generate ${count} realistic meeting titles that would occur at a law firm. These should be professional, specific, and varied across different legal practice areas. Examples might include client consultations, case strategy meetings, contract reviews, depositions, etc. Return only the meeting titles, one per line, without numbers or bullets.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Cheapest model
          messages: [
            {
              role: 'system',
              content: 'You are a legal assistant helping to generate realistic meeting titles for a law firm office management system.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8, // More creative variety
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      // Split by lines and clean up
      const titles = content
        .split('\n')
        .map((title: string) => title.trim())
        .filter((title: string) => title.length > 0 && !title.match(/^\d+\./))
        .slice(0, count)

      return titles.length > 0 ? titles : this.getFallbackTitles(count)

    } catch (error) {
      console.warn('OpenAI API failed, using fallback titles:', error)
      return this.getFallbackTitles(count)
    }
  }

  // Fallback meeting titles if OpenAI fails
  private getFallbackTitles(count: number): string[] {
    const fallbackTitles = [
      'Client Strategy Session - M&A Transaction',
      'Contract Review Meeting - Employment Agreement',
      'Case Preparation - Personal Injury Litigation',
      'Deposition Planning - Insurance Defense',
      'Settlement Conference - Real Estate Dispute',
      'Due Diligence Meeting - Corporate Acquisition',
      'Patent Application Review Session',
      'Estate Planning Consultation',
      'Immigration Case Strategy Meeting',
      'Securities Compliance Review',
      'Environmental Law Regulatory Discussion',
      'Healthcare Privacy Compliance Meeting',
      'Tax Strategy Planning Session',
      'Family Law Mediation Preparation',
      'Criminal Defense Case Review',
      'Intellectual Property Licensing Discussion',
      'Employment Discrimination Case Meeting',
      'Real Estate Closing Preparation',
      'Corporate Governance Planning Session',
      'Bankruptcy Filing Strategy Meeting',
      'Insurance Coverage Analysis Meeting',
      'Product Liability Case Preparation',
      'Contract Negotiation Strategy Session',
      'Regulatory Compliance Training',
      'Client Intake and Assessment Meeting'
    ]

    // Shuffle and return requested count
    const shuffled = fallbackTitles.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
}

// Smart booking scheduler
class BookingScheduler {
  private users: UserProfile[]
  
  constructor(users: UserProfile[]) {
    this.users = users
  }

  // Find rooms that are currently available for booking
  async findAvailableRooms(
    supabase: any, 
    rooms: Room[], 
    startTime: Date, 
    endTime: Date
  ): Promise<Room[]> {
    // Get existing bookings that overlap with our proposed time
    const { data: conflictingBookings, error } = await supabase
      .from('room_bookings')
      .select('room_id')
      .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`)

    if (error) {
      console.warn('Error checking existing bookings:', error)
      return rooms // If we can't check, assume all rooms are available
    }

    const bookedRoomIds = new Set(conflictingBookings?.map((b: any) => b.room_id) || [])
    return rooms.filter(room => !bookedRoomIds.has(room.id))
  }

  // Generate realistic booking time slots
  generateBookingSlots(): { start: Date; end: Date; duration: number }[] {
    const now = new Date()
    const slots: { start: Date; end: Date; duration: number }[] = []
    
    // Generate bookings: 2 hours in the past, current, and 4 hours in the future
    // This creates a mix of completed, active, and upcoming bookings
    for (let i = -4; i < 8; i++) { // -4 to +7 = 12 slots total (6 hours range)
      const slotStart = new Date(now.getTime() + (i * 30 * 60 * 1000)) // Every 30 minutes
      
      const hour = slotStart.getHours()
      const dayOfWeek = slotStart.getDay() // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      // More lenient filtering for demo purposes
      // Reduced restrictions for night hours (50% chance to skip instead of 95%)
      if ((hour >= 22 || hour < 6) && Math.random() > 0.5) {
        continue // 50% chance to skip night hours for demos
      }
      
      // More meetings on weekends for demo (50% chance instead of 15%)
      if (isWeekend && Math.random() > 0.5) {
        continue // 50% chance to skip weekend slots for demos
      }
      
      // More lenient weekday hours for demos (6 AM to 10 PM)
      if (!isWeekend && (hour < 6 || hour > 22)) continue
      
      // Weekend meetings have different duration patterns (shorter, more casual)
      let possibleDurations: number[]
      if (isWeekend) {
        possibleDurations = [30, 60] // Shorter weekend meetings
      } else if (hour >= 22 || hour < 6) {
        possibleDurations = [30, 45] // Very short late-night meetings
      } else {
        possibleDurations = [30, 60, 90, 120] // Normal business hour meetings
      }
      
      const duration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)]
      const slotEnd = new Date(slotStart.getTime() + (duration * 60 * 1000))
      
      // Don't book meetings that end after 6 PM on weekdays (unless it's a night meeting)
      if (!isWeekend && !(hour >= 22 || hour < 6) && slotEnd.getHours() > 18) continue
      
      slots.push({
        start: slotStart,
        end: slotEnd,
        duration
      })
    }
    
    return slots
  }

  // Calculate appropriate attendee count based on room capacity and meeting type
  calculateAttendeeCount(room: Room, meetingTitle: string): number {
    let baseAttendees = 2 // Minimum 2 people
    
    // Adjust based on meeting type
    if (meetingTitle.toLowerCase().includes('strategy') || 
        meetingTitle.toLowerCase().includes('planning') ||
        meetingTitle.toLowerCase().includes('review')) {
      baseAttendees = Math.max(3, Math.floor(room.capacity * 0.4))
    } else if (meetingTitle.toLowerCase().includes('consultation') ||
               meetingTitle.toLowerCase().includes('intake')) {
      baseAttendees = Math.max(2, Math.floor(room.capacity * 0.2))
    } else if (meetingTitle.toLowerCase().includes('preparation') ||
               meetingTitle.toLowerCase().includes('discussion')) {
      baseAttendees = Math.max(2, Math.floor(room.capacity * 0.3))
    }
    
    // Add some randomness (±25%)
    const variance = Math.floor(baseAttendees * 0.25)
    const randomVariance = Math.floor((Math.random() - 0.5) * 2 * variance)
    
    const finalCount = baseAttendees + randomVariance
    
    // Ensure it's within room capacity and reasonable bounds
    return Math.max(2, Math.min(room.capacity, finalCount))
  }

  // Select random organizer
  selectRandomOrganizer(): UserProfile {
    return this.users[Math.floor(Math.random() * this.users.length)]
  }
}

// Main Edge Function handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🏛️ Starting room booking simulation for law firm...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get all rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('capacity', { ascending: false }) // Prioritize larger rooms for better demo

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
    }

    if (!rooms || rooms.length === 0) {
      throw new Error('No rooms found in database')
    }

    // Get user profiles for organizers
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')

    if (usersError || !users || users.length === 0) {
      throw new Error('No users found for booking organizers')
    }

    console.log(`📊 Found ${rooms.length} rooms and ${users.length} potential organizers`)

    // Initialize generators
    const meetingGenerator = new LawFirmMeetingGenerator(openaiApiKey)
    const scheduler = new BookingScheduler(users)

    // Generate booking time slots
    const timeSlots = scheduler.generateBookingSlots()
    console.log(`⏰ Generated ${timeSlots.length} potential booking slots`)

    let totalBookings = 0
    const createdBookings: RoomBooking[] = []

    // Process each time slot
    for (const slot of timeSlots) {
      // Find available rooms for this time slot
      const availableRooms = await scheduler.findAvailableRooms(
        supabase, 
        rooms, 
        slot.start, 
        slot.end
      )

      if (availableRooms.length === 0) {
        console.log(`❌ No available rooms for ${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()}`)
        continue
      }

      // Decide how many rooms to book for this slot (25-50% of available rooms)
      const minBookings = Math.max(1, Math.floor(availableRooms.length * 0.25))
      const maxBookings = Math.max(1, Math.floor(availableRooms.length * 0.5))
      const bookingsToCreate = Math.floor(Math.random() * (maxBookings - minBookings + 1)) + minBookings

      // Randomly select rooms to book
      const shuffledRooms = availableRooms.sort(() => 0.5 - Math.random())
      const roomsToBook = shuffledRooms.slice(0, bookingsToCreate)

      // Generate meeting titles
      const meetingTitles = await meetingGenerator.generateMeetingTitles(roomsToBook.length)

      // Create bookings
      for (let i = 0; i < roomsToBook.length; i++) {
        const room = roomsToBook[i]
        const meetingTitle = meetingTitles[i] || 'Legal Strategy Meeting'
        const organizer = scheduler.selectRandomOrganizer()
        const attendeeCount = scheduler.calculateAttendeeCount(room, meetingTitle)

        const booking: RoomBooking = {
          room_id: room.id,
          title: meetingTitle,
          organizer_email: organizer.email,
          start_time: slot.start.toISOString(),
          end_time: slot.end.toISOString(),
          attendee_count: attendeeCount
        }

        createdBookings.push(booking)
      }
    }

    // Insert all bookings in batches
    if (createdBookings.length > 0) {
      const batchSize = 10
      for (let i = 0; i < createdBookings.length; i += batchSize) {
        const batch = createdBookings.slice(i, i + batchSize)
        
        const { error: insertError } = await supabase
          .from('room_bookings')
          .insert(batch)

        if (insertError) {
          console.error('❌ Error inserting booking batch:', insertError)
        } else {
          totalBookings += batch.length
          console.log(`✅ Created ${batch.length} bookings (${totalBookings} total)`)
        }
      }
    }

    console.log(`🎉 Booking simulation completed: ${totalBookings} new bookings created`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Law firm booking simulation completed',
        stats: {
          totalBookings,
          roomCount: rooms.length,
          userCount: users.length,
          timeSlotsProcessed: timeSlots.length,
          bookingsCreated: createdBookings.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Booking simulation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})