import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Room {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
}

interface RoomBooking {
  id: string
  room_id: string
  start_time: string
  end_time: string
  attendee_count: number
}

interface SensorReading {
  room_id: string
  occupancy: number
  temperature: number
  noise_level: number
  air_quality: number
}

// Realistic sensor data generator with booking awareness
class SmartSensorDataGenerator {
  private normalTemperature = 72.0 // Normal office temperature
  
  constructor() {}

  // Check if a room is currently booked
  isRoomCurrentlyBooked(roomId: string, bookings: RoomBooking[], currentTime: Date): RoomBooking | null {
    const roomBookings = bookings.filter(b => b.room_id === roomId)
    
    for (const booking of roomBookings) {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return booking
      }
    }
    return null
  }

  // Generate realistic occupancy based on bookings, capacity, and consistency
  generateOccupancy(
    room: Room, 
    bookings: RoomBooking[], 
    currentTime: Date,
    previousOccupancy?: number
  ): number {
    const currentBooking = this.isRoomCurrentlyBooked(room.id, bookings, currentTime)
    
    let targetOccupancy = 0
    
    if (currentBooking) {
      // Room is booked - 30% chance it remains unoccupied (forgotten booking)
      const isNoShow = Math.random() < 0.3
      
      if (isNoShow) {
        targetOccupancy = 0
      } else {
        // Use booking attendee count as base, but add some variance
        const bookingAttendees = currentBooking.attendee_count || Math.ceil(room.capacity * 0.5)
        const variance = Math.floor(bookingAttendees * 0.3) // ±30% variance
        const randomVariance = Math.floor((Math.random() - 0.5) * 2 * variance)
        
        targetOccupancy = Math.max(1, Math.min(room.capacity, bookingAttendees + randomVariance))
      }
    } else {
      // Room not booked - random occupancy based on room capacity
      const capacityFactor = Math.random()
      
      if (capacityFactor < 0.7) {
        // 70% chance: empty or very low occupancy
        targetOccupancy = Math.floor(Math.random() * Math.min(3, room.capacity * 0.2))
      } else if (capacityFactor < 0.9) {
        // 20% chance: medium occupancy (someone using it informally)
        targetOccupancy = Math.floor(room.capacity * 0.3 * Math.random())
      } else {
        // 10% chance: high occupancy (informal large group)
        targetOccupancy = Math.floor(room.capacity * 0.8 * Math.random())
      }
    }
    
    // Ensure consistency with previous reading (realistic gradual changes)
    if (previousOccupancy !== undefined) {
      const maxChange = Math.max(1, Math.floor(room.capacity * 0.2)) // Max 20% capacity change
      const change = Math.floor((Math.random() - 0.5) * 2 * maxChange)
      
      // Gradually move toward target occupancy
      const direction = targetOccupancy > previousOccupancy ? 1 : -1
      const consistentChange = Math.min(Math.abs(change), Math.abs(targetOccupancy - previousOccupancy))
      
      targetOccupancy = previousOccupancy + (direction * consistentChange)
    }
    
    return Math.max(0, Math.min(room.capacity, targetOccupancy))
  }

  // Generate temperature based on occupancy (high occupancy = warmer, low = cooler)
  generateTemperature(room: Room, occupancy: number, previousTemp?: number): number {
    const occupancyRatio = occupancy / room.capacity
    let targetTemperature = this.normalTemperature
    
    if (occupancyRatio > 0.7) {
      // High occupancy: 1-2 degrees warmer
      targetTemperature = this.normalTemperature + 1 + (Math.random() * 1)
    } else if (occupancyRatio < 0.3) {
      // Low occupancy: 1-2 degrees cooler  
      targetTemperature = this.normalTemperature - 1 - (Math.random() * 1)
    } else {
      // Normal occupancy: slight variance around normal
      targetTemperature = this.normalTemperature + (Math.random() - 0.5) * 1
    }
    
    // Smooth temperature transitions
    if (previousTemp !== undefined) {
      const maxTempChange = 0.3 // Max 0.3°F change per reading
      const change = Math.max(-maxTempChange, Math.min(maxTempChange, targetTemperature - previousTemp))
      targetTemperature = previousTemp + change
    }
    
    // Add slight random variation for realism
    targetTemperature += (Math.random() - 0.5) * 0.2
    
    // Round to 1 decimal place
    return Math.round(targetTemperature * 10) / 10
  }

  // Generate noise level based on occupancy
  generateNoiseLevel(room: Room, occupancy: number): number {
    const baseNoise = 32 // Quiet office ambient noise
    
    if (occupancy === 0) {
      return baseNoise + (Math.random() * 4) // Very quiet
    }
    
    // Noise increases with occupancy (conversation)
    const occupancyNoise = 40 + (occupancy * 3) + (Math.random() * 6)
    
    // Larger rooms can amplify noise slightly
    const roomFactor = room.capacity > 16 ? 1.1 : 1.0
    
    const totalNoise = occupancyNoise * roomFactor
    
    return Math.round(Math.max(30, Math.min(70, totalNoise)) * 10) / 10
  }

  // Generate air quality (degrades with occupancy)
  generateAirQuality(room: Room, occupancy: number): number {
    const baseQuality = 88 // Good office air quality
    
    // Occupancy degrades air quality
    const occupancyEffect = (occupancy / room.capacity) * 15
    
    // Random variation
    const randomVariation = (Math.random() - 0.5) * 8
    
    const airQuality = baseQuality - occupancyEffect + randomVariation
    
    return Math.round(Math.max(65, Math.min(100, airQuality)))
  }
}

// Main Edge Function handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting sensor data simulation...')
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
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
      .order('building, floor, name')

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
    }

    if (!rooms || rooms.length === 0) {
      throw new Error('No rooms found in database')
    }

    // Get current bookings (active around current time)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('room_bookings')
      .select('*')
      .gte('end_time', oneHourAgo.toISOString())
      .lte('start_time', oneHourFromNow.toISOString())

    if (bookingsError) {
      console.warn('Could not fetch bookings:', bookingsError)
    }

    console.log(`📊 Found ${rooms.length} rooms and ${bookings?.length || 0} relevant bookings`)
    
    // Get the most recent sensor readings for consistency
    const { data: lastReadings } = await supabase
      .from('sensor_readings')
      .select('room_id, occupancy, temperature')
      .in('room_id', rooms.map(r => r.id))
      .order('timestamp', { ascending: false })
      .limit(rooms.length)

    // Create maps of last readings for smooth transitions
    const lastOccupancyMap = new Map<string, number>()
    const lastTemperatureMap = new Map<string, number>()
    
    lastReadings?.forEach(reading => {
      lastOccupancyMap.set(reading.room_id, reading.occupancy)
      lastTemperatureMap.set(reading.room_id, reading.temperature)
    })

    const generator = new SmartSensorDataGenerator()
    let totalReadings = 0
    const startTime = Date.now()
    const simulationDuration = 45 * 1000 // 45 seconds
    
    console.log('⏱️  Running 45-second sensor simulation with 3-second intervals...')

    // Generate sensor readings for 45 seconds (15 readings at 3-second intervals)
    while (Date.now() - startTime < simulationDuration) {
      const currentTime = new Date()
      const readings: SensorReading[] = []
      
      // Generate readings for all rooms
      for (const room of rooms) {
        const previousOccupancy = lastOccupancyMap.get(room.id)
        const previousTemperature = lastTemperatureMap.get(room.id)
        
        const occupancy = generator.generateOccupancy(
          room, 
          bookings || [], 
          currentTime, 
          previousOccupancy
        )
        
        const temperature = generator.generateTemperature(
          room, 
          occupancy, 
          previousTemperature
        )
        
        // Update maps with new values for next iteration
        lastOccupancyMap.set(room.id, occupancy)
        lastTemperatureMap.set(room.id, temperature)
        
        const reading: SensorReading = {
          room_id: room.id,
          occupancy,
          temperature,
          noise_level: generator.generateNoiseLevel(room, occupancy),
          air_quality: generator.generateAirQuality(room, occupancy)
        }
        
        readings.push(reading)
      }

      // Insert all readings in a batch
      const { error: insertError } = await supabase
        .from('sensor_readings')
        .insert(readings)

      if (insertError) {
        console.error('❌ Error inserting sensor readings:', insertError)
      } else {
        totalReadings += readings.length
        console.log(`✅ Inserted ${readings.length} sensor readings (${totalReadings} total)`)
      }

      // Wait 3 seconds before next batch
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    const endTime = Date.now()
    const actualDuration = (endTime - startTime) / 1000

    console.log(`🎉 Simulation completed: ${totalReadings} readings over ${actualDuration.toFixed(1)} seconds`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Intelligent sensor data simulation completed',
        stats: {
          totalReadings,
          roomCount: rooms.length,
          bookingCount: bookings?.length || 0,
          durationSeconds: Math.round(actualDuration),
          readingsPerRoom: Math.round(totalReadings / rooms.length)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Sensor simulation error:', error)
    
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