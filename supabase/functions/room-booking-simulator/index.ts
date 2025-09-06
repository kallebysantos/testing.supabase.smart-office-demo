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

// Smart booking scheduler for realistic conference room bookings
class BookingScheduler {
  private users: UserProfile[]
  
  constructor(users: UserProfile[]) {
    this.users = users
  }

  // Check if a specific room is available for a time slot
  async isRoomAvailable(
    supabase: any, 
    roomId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<boolean> {
    // Check for any overlapping bookings for this specific room
    const { data: conflictingBookings, error } = await supabase
      .from('room_bookings')
      .select('id')
      .eq('room_id', roomId)
      .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`)

    if (error) {
      console.warn('Error checking room availability:', error)
      return true // If we can't check, assume available
    }

    return (conflictingBookings?.length || 0) === 0
  }

  // Generate realistic booking time slots for next 3 weeks
  generateBookingSlots(): { start: Date; end: Date; duration: number }[] {
    const slots: { start: Date; end: Date; duration: number }[] = []
    const now = new Date()
    const threeWeeksFromNow = new Date(now.getTime() + (21 * 24 * 60 * 60 * 1000)) // 3 weeks
    
    // Start from today and go 3 weeks into the future
    let currentDate = new Date(now)
    currentDate.setHours(0, 0, 0, 0) // Start at midnight
    
    while (currentDate <= threeWeeksFromNow) {
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      // Skip weekends for most bookings (only 10% chance of weekend meetings)
      if (isWeekend && Math.random() > 0.1) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      
      // Generate time slots for this day
      // Business hours: 8 AM to 6 PM on weekdays, 10 AM to 4 PM on weekends
      const startHour = isWeekend ? 10 : 8
      const endHour = isWeekend ? 16 : 18
      
      // Generate slots in 30-minute intervals, starting on the half-hour
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of [0, 30]) { // On the hour and half-hour
          const slotStart = new Date(currentDate)
          slotStart.setHours(hour, minute, 0, 0)
          
          // Skip past time slots (but keep some recent past for completed bookings)
          const hoursFromNow = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)
          if (hoursFromNow < -24) continue // Only keep last 24 hours of past bookings
          
          // Determine meeting duration based on time of day and patterns
          let possibleDurations: number[]
          
          if (hour === 8 || hour === 17) {
            // Early morning or late afternoon - shorter meetings
            possibleDurations = [30, 60]
          } else if (hour >= 12 && hour <= 14) {
            // Lunch time - mix of short and long meetings
            possibleDurations = [30, 60, 90]
          } else if (isWeekend) {
            // Weekend meetings are typically shorter
            possibleDurations = [30, 60]
          } else {
            // Regular business hours - full range
            possibleDurations = [30, 60, 90, 120]
          }
          
          const duration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)]
          const slotEnd = new Date(slotStart.getTime() + (duration * 60 * 1000))
          
          // Don't create meetings that go beyond business hours
          if (slotEnd.getHours() > endHour) continue
          
          // Probabilistic booking - not every slot should be booked
          // Higher probability during peak hours (10 AM - 4 PM)
          let bookingProbability = 0.3 // Base 30% chance
          
          if (hour >= 10 && hour <= 16) {
            bookingProbability = 0.5 // 50% chance during peak hours
          } else if (hour === 9 || hour === 17) {
            bookingProbability = 0.4 // 40% chance during shoulder hours
          }
          
          // Reduce probability for past slots (completed meetings)
          if (hoursFromNow < 0) {
            bookingProbability *= 0.7 // 70% of normal probability
          }
          
          // Only add slot if random chance succeeds
          if (Math.random() < bookingProbability) {
            slots.push({
              start: slotStart,
              end: slotEnd,
              duration
            })
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
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

    // Generate booking time slots for next 3 weeks
    const timeSlots = scheduler.generateBookingSlots()
    console.log(`⏰ Generated ${timeSlots.length} potential booking slots over 3 weeks`)

    let totalBookings = 0
    const createdBookings: RoomBooking[] = []
    
    // Generate meeting titles in advance for efficiency
    const meetingTitles = await meetingGenerator.generateMeetingTitles(Math.min(100, timeSlots.length * 2))
    let titleIndex = 0

    // Process each time slot and try to book rooms
    for (const slot of timeSlots) {
      // Randomly select 1-3 rooms to try booking for this time slot
      const roomsToTry = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1))
      
      // Shuffle rooms for random selection
      const shuffledRooms = [...rooms].sort(() => 0.5 - Math.random())
      let bookingsCreatedForSlot = 0
      
      // Try to book random rooms for this slot
      for (let i = 0; i < roomsToTry && i < shuffledRooms.length; i++) {
        const room = shuffledRooms[i]
        
        // Check if this room is available for this time slot
        const isAvailable = await scheduler.isRoomAvailable(
          supabase,
          room.id,
          slot.start,
          slot.end
        )
        
        if (!isAvailable) {
          continue // Try next room
        }
        
        // Create a booking for this room
        const meetingTitle = meetingTitles[titleIndex % meetingTitles.length] || 'Legal Strategy Meeting'
        titleIndex++
        
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
        bookingsCreatedForSlot++
        
        // Limit bookings per slot to avoid overwhelming the system
        if (bookingsCreatedForSlot >= 2) break
      }
      
      if (bookingsCreatedForSlot > 0) {
        console.log(`✅ Created ${bookingsCreatedForSlot} booking(s) for ${slot.start.toLocaleDateString()} ${slot.start.toLocaleTimeString()}`)
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

    const now = new Date()
    const threeWeeksFromNow = new Date(now.getTime() + (21 * 24 * 60 * 60 * 1000))
    
    console.log(`🎉 Realistic booking simulation completed!`)
    console.log(`📅 Booking window: ${now.toLocaleDateString()} to ${threeWeeksFromNow.toLocaleDateString()}`)
    console.log(`📊 Results: ${totalBookings} new bookings created across ${timeSlots.length} time slots`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Realistic conference room booking simulation completed',
        stats: {
          totalBookings,
          roomCount: rooms.length,
          userCount: users.length,
          timeSlotsProcessed: timeSlots.length,
          bookingsCreated: createdBookings.length,
          dateRange: {
            startDate: now.toISOString(),
            endDate: threeWeeksFromNow.toISOString(),
            daysGenerated: 21
          },
          features: [
            'Half-hour time slots on the hour and half-hour',
            'Conflict detection and avoidance',
            '3-week booking window',
            'Business hours scheduling (8 AM - 6 PM weekdays)',
            'Realistic meeting durations (30min, 1hr, 1.5hr, 2hr)',
            'Past bookings included for demo (last 24 hours)'
          ]
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