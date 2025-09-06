#!/usr/bin/env tsx

/**
 * Conference Rooms Generator
 * 
 * Generates conference rooms directly in Supabase with dog breed names
 * and realistic capacity/amenities for law firm demo
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Dog breeds for conference room names with appropriate capacities (57 total)
const CONFERENCE_ROOMS = [
  // Large boardrooms (16+ capacity) - 10 rooms
  { name: 'Great Dane Grand Hall', capacity: 30, amenities: ['Stage', 'Premium AV', 'Catering', 'Executive Seating'] },
  { name: 'Saint Bernard Boardroom', capacity: 24, amenities: ['Large Display', 'Phone Conference', 'Executive Seating', 'Catering Setup'] },
  { name: 'Newfoundland Executive Suite', capacity: 20, amenities: ['Premium AV', 'Executive Seating', 'Catering', 'Private Entrance'] },
  { name: 'Mastiff Conference Hall', capacity: 18, amenities: ['Dual Displays', 'Premium Audio', 'Executive Seating'] },
  { name: 'German Shepherd Strategy Room', capacity: 16, amenities: ['Interactive Whiteboard', 'Video Conference', 'Executive Seating'] },
  { name: 'Irish Wolfhound Assembly', capacity: 22, amenities: ['Premium AV', 'Stage Setup', 'Executive Seating'] },
  { name: 'Great Pyrenees Chamber', capacity: 18, amenities: ['Large Display', 'Catering Setup', 'Executive Seating'] },
  { name: 'Leonberger Leadership Room', capacity: 20, amenities: ['Premium Audio', 'Executive Setup', 'Privacy Glass'] },
  { name: 'Anatolian Shepherd Forum', capacity: 16, amenities: ['Video Conference', 'Executive Seating', 'Whiteboard'] },
  { name: 'Tibetan Mastiff Summit', capacity: 18, amenities: ['Premium AV', 'Executive Seating', 'Sound System'] },

  // Medium meeting rooms (8-15 capacity) - 25 rooms
  { name: 'Golden Retriever Meeting Room', capacity: 14, amenities: ['Large Display', 'Phone Conference', 'Whiteboard'] },
  { name: 'Labrador Collaboration Space', capacity: 12, amenities: ['Interactive Whiteboard', 'Video Conference', 'Moveable Furniture'] },
  { name: 'Husky Team Room', capacity: 12, amenities: ['Dual Monitors', 'Video Conference', 'Coffee Station'] },
  { name: 'Boxer Discussion Room', capacity: 10, amenities: ['Smart TV', 'Whiteboard', 'Phone Conference'] },
  { name: 'Border Collie Creative Room', capacity: 10, amenities: ['Design Boards', 'Creative Tools', 'Moveable Furniture'] },
  { name: 'Rottweiler Planning Room', capacity: 8, amenities: ['Whiteboard', 'Video Conference', 'Privacy Glass'] },
  { name: 'Doberman Focus Suite', capacity: 8, amenities: ['Premium Privacy', 'Executive Setup', 'Quiet Zone'] },
  { name: 'Australian Shepherd Workshop', capacity: 14, amenities: ['Interactive Tools', 'Moveable Furniture', 'Whiteboard'] },
  { name: 'Belgian Malinois Tactical', capacity: 12, amenities: ['Secure Setup', 'Premium AV', 'Privacy Glass'] },
  { name: 'Rhodesian Ridgeback Retreat', capacity: 10, amenities: ['Comfortable Seating', 'Natural Lighting', 'Coffee Station'] },
  { name: 'Weimaraner Mediation Room', capacity: 8, amenities: ['Neutral Decor', 'Sound Dampening', 'Comfortable Seating'] },
  { name: 'Vizsla Venture Room', capacity: 10, amenities: ['Modern Setup', 'Wireless Presentation', 'Standing Options'] },
  { name: 'Pointer Presentation Hall', capacity: 12, amenities: ['Projection Setup', 'Tiered Seating', 'Audio System'] },
  { name: 'Setter Strategy Space', capacity: 14, amenities: ['Strategic Planning Setup', 'Whiteboards', 'Video Conference'] },
  { name: 'Spaniel Sync Room', capacity: 8, amenities: ['Team Sync Setup', 'Multiple Monitors', 'Phone Conference'] },
  { name: 'Brittany Brainstorm', capacity: 10, amenities: ['Creative Setup', 'Idea Boards', 'Comfortable Seating'] },
  { name: 'Whippet Workshop', capacity: 12, amenities: ['Workshop Setup', 'Tools Storage', 'Flexible Seating'] },
  { name: 'Greyhound Gallery', capacity: 14, amenities: ['Display Walls', 'Presentation Setup', 'Modern Design'] },
  { name: 'Saluki Seminar Room', capacity: 10, amenities: ['Seminar Setup', 'Audio Visual', 'Note Taking Setup'] },
  { name: 'Afghan Hound Atrium', capacity: 8, amenities: ['Natural Light', 'Elegant Design', 'Quiet Space'] },
  { name: 'Borzoi Business Center', capacity: 12, amenities: ['Business Setup', 'Phone Conference', 'Professional Decor'] },
  { name: 'Bloodhound Investigation', capacity: 8, amenities: ['Investigation Setup', 'Privacy Features', 'Secure Storage'] },
  { name: 'Basset Hound Huddle', capacity: 10, amenities: ['Cozy Setup', 'Round Table', 'Warm Lighting'] },
  { name: 'Coonhound Conference', capacity: 12, amenities: ['Conference Setup', 'Large Table', 'Video Equipment'] },
  { name: 'Foxhound Forum', capacity: 14, amenities: ['Forum Setup', 'Multiple Screens', 'Comfortable Chairs'] },

  // Small meeting rooms (4-7 capacity) - 22 rooms
  { name: 'Beagle Conference Room', capacity: 6, amenities: ['Smart TV', 'Whiteboard', 'Phone Conference'] },
  { name: 'Poodle Discussion Room', capacity: 6, amenities: ['Smart TV', 'Wireless Presentation', 'Coffee Station'] },
  { name: 'Bulldog Focus Room', capacity: 4, amenities: ['Privacy Glass', 'Standing Desk', 'Quiet Space'] },
  { name: 'Corgi Small Meeting', capacity: 4, amenities: ['Smart TV', 'Whiteboard', 'Cozy Seating'] },
  { name: 'French Bulldog Huddle', capacity: 4, amenities: ['Monitor', 'Whiteboard', 'Standing Table'] },
  { name: 'Boston Terrier Booth', capacity: 4, amenities: ['Booth Seating', 'Monitor', 'Privacy'] },
  { name: 'Pug Private Room', capacity: 4, amenities: ['Private Setup', 'Comfortable Chairs', 'Quiet Zone'] },
  { name: 'Dachshund Den', capacity: 6, amenities: ['Cozy Den Setup', 'Soft Lighting', 'Comfortable Seating'] },
  { name: 'Chihuahua Chamber', capacity: 4, amenities: ['Intimate Setup', 'Small Table', 'Quiet Environment'] },
  { name: 'Shih Tzu Studio', capacity: 6, amenities: ['Studio Setup', 'Good Lighting', 'Creative Space'] },
  { name: 'Maltese Mini Room', capacity: 4, amenities: ['Minimal Design', 'Essential Setup', 'Clean Space'] },
  { name: 'Yorkshire Terrier Nook', capacity: 4, amenities: ['Cozy Nook', 'Window View', 'Comfortable Setup'] },
  { name: 'Papillon Pod', capacity: 6, amenities: ['Pod Seating', 'Modern Design', 'Tech Setup'] },
  { name: 'Havanese Haven', capacity: 6, amenities: ['Comfortable Haven', 'Relaxed Setup', 'Soft Seating'] },
  { name: 'Cavalier King Charles Cabin', capacity: 6, amenities: ['Cabin Style', 'Warm Design', 'Intimate Setting'] },
  { name: 'Bichon Frise Booth', capacity: 4, amenities: ['Booth Setup', 'Clean Design', 'Efficient Space'] },
  { name: 'Jack Russell Junction', capacity: 6, amenities: ['Junction Setup', 'Multiple Entrances', 'Flexible Space'] },
  { name: 'Rat Terrier Retreat', capacity: 4, amenities: ['Quiet Retreat', 'Minimal Distractions', 'Focus Setup'] },
  { name: 'Wire Fox Terrier Workspace', capacity: 6, amenities: ['Work Focus', 'Ergonomic Setup', 'Task Lighting'] },
  { name: 'Smooth Fox Terrier Suite', capacity: 6, amenities: ['Smooth Operations', 'Efficient Layout', 'Professional Setup'] },
  { name: 'Scottish Terrier Sanctuary', capacity: 4, amenities: ['Sanctuary Feel', 'Peaceful Setup', 'Privacy Features'] },
  { name: 'West Highland White Terrier Workshop', capacity: 6, amenities: ['Workshop Tools', 'Creative Setup', 'Bright Space'] }
]

const BUILDINGS = ['Main Office', 'Annex Office']

/**
 * Generate and insert conference rooms
 */
async function generateConferenceRooms() {
  console.log('🏢 Generating conference rooms directly in Supabase...\n')
  
  try {
    // Clear existing rooms first
    const { error: deleteError } = await supabase
      .from('rooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.log('⚠️  Note: Could not clear existing rooms:', deleteError.message)
    } else {
      console.log('🧹 Cleared existing rooms')
    }

    // Generate rooms with floor assignments
    const roomsToInsert = CONFERENCE_ROOMS.map((room, index) => {
      const building = BUILDINGS[index % BUILDINGS.length]
      const floor = building === 'Main Office' 
        ? Math.floor(Math.random() * 6) + 1  // Floors 1-6
        : Math.floor(Math.random() * 6) + 7  // Floors 7-12
      
      return {
        name: room.name,
        capacity: room.capacity,
        floor,
        building,
        amenities: room.amenities
      }
    })

    // Insert rooms in batches
    const batchSize = 5
    let insertedCount = 0
    
    for (let i = 0; i < roomsToInsert.length; i += batchSize) {
      const batch = roomsToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('rooms')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message)
        continue
      }

      insertedCount += batch.length
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} rooms`)
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n🎉 Successfully generated ${insertedCount} conference rooms!`)
    
    // Show summary
    const { data: summary } = await supabase
      .from('rooms')
      .select('building')

    if (summary) {
      const byBuilding = summary.reduce((acc: any, room) => {
        acc[room.building] = (acc[room.building] || 0) + 1
        return acc
      }, {})

      console.log('\n📊 Summary:')
      Object.entries(byBuilding).forEach(([building, count]) => {
        console.log(`   ${building}: ${count} rooms`)
      })
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  generateConferenceRooms()
}

export { generateConferenceRooms }