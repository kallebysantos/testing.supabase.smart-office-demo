#!/usr/bin/env tsx

/**
 * Unsplash Room Images Fetcher
 * 
 * This utility script fetches conference room images from Unsplash API
 * and uploads them to Supabase Storage for use in the smart office dashboard.
 * 
 * Usage:
 * - Set UNSPLASH_ACCESS_KEY environment variable
 * - Run: npm run images:fetch
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY
const STORAGE_BUCKET = 'room-images'

interface Room {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
}

interface UnsplashImage {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
  }
  description: string | null
  alt_description: string | null
  width: number
  height: number
}

interface UnsplashSearchResponse {
  results: UnsplashImage[]
  total: number
  total_pages: number
}

// Initialize Supabase client with service role key
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY environment variable is required')
  console.log('📝 Get your access key from: https://unsplash.com/developers')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Fetch conference room images from Unsplash
 */
async function fetchUnsplashImages(query: string, count: number = 30): Promise<UnsplashImage[]> {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', Math.min(count, 30).toString())
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')
  
  console.log(`🔍 Searching Unsplash for: "${query}"`)
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Unsplash API error (${response.status}): ${errorText}`)
    }

    const data = await response.json() as UnsplashSearchResponse
    console.log(`📸 Found ${data.results.length} images`)
    
    return data.results
  } catch (error) {
    console.error('❌ Error fetching from Unsplash:', error)
    throw error
  }
}

/**
 * Download image from URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    console.error('❌ Error downloading image:', error)
    throw error
  }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImageToSupabase(
  roomId: string, 
  imageBuffer: Buffer, 
  imageName: string
): Promise<string | null> {
  const fileName = `${roomId}/${imageName}.jpg`
  
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year
        upsert: true
      })

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message)
      return null
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    console.log(`✅ Uploaded: ${fileName}`)
    return publicUrlData.publicUrl
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error)
    return null
  }
}

/**
 * Update room record with image URL
 */
async function updateRoomImage(roomId: string, imageUrl: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ image_url: imageUrl })
      .eq('id', roomId)

    if (error) {
      console.error(`❌ Error updating room ${roomId}:`, error.message)
      return false
    }

    return true
  } catch (error) {
    console.error(`❌ Error updating room ${roomId}:`, error)
    return false
  }
}

/**
 * Create storage bucket if it doesn't exist
 */
async function ensureStorageBucket(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return false
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET)
    
    if (bucketExists) {
      console.log(`✅ Storage bucket "${STORAGE_BUCKET}" already exists`)
      return true
    }

    // Create bucket
    console.log(`📁 Creating storage bucket "${STORAGE_BUCKET}"...`)
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 10 * 1024 * 1024 // 10MB
    })

    if (createError) {
      console.error('❌ Error creating bucket:', createError.message)
      return false
    }

    console.log(`✅ Created storage bucket "${STORAGE_BUCKET}"`)
    return true
  } catch (error) {
    console.error('❌ Error ensuring storage bucket:', error)
    return false
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🏢 Smart Office Dashboard - Room Images Fetcher')
  console.log('=' .repeat(50))

  try {
    // Ensure storage bucket exists
    const bucketReady = await ensureStorageBucket()
    if (!bucketReady) {
      console.error('❌ Failed to ensure storage bucket exists')
      process.exit(1)
    }

    // Fetch rooms from database
    console.log('📋 Fetching conference rooms from database...')
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, capacity, floor, building')
      .order('building', { ascending: true })
      .order('floor', { ascending: true })
      .order('name', { ascending: true })

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
    }

    if (!rooms || rooms.length === 0) {
      console.log('⚠️  No rooms found in database. Run seed data generation first.')
      process.exit(0)
    }

    console.log(`✅ Found ${rooms.length} conference rooms`)

    // Fetch images from Unsplash
    const searchQueries = [
      'empty conference room modern',
      'empty meeting room office',
      'empty boardroom contemporary',
      'empty conference room glass',
      'empty meeting room corporate'
    ]

    let allImages: UnsplashImage[] = []
    
    for (const query of searchQueries) {
      const images = await fetchUnsplashImages(query, 6)
      allImages = [...allImages, ...images]
      
      // Add delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Remove duplicates by ID
    const uniqueImages = allImages.filter((img, index, self) => 
      index === self.findIndex(t => t.id === img.id)
    )

    console.log(`📸 Total unique images found: ${uniqueImages.length}`)

    if (uniqueImages.length === 0) {
      console.error('❌ No images found from Unsplash')
      process.exit(1)
    }

    // Process each room
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i] as Room
      const imageIndex = i % uniqueImages.length // Cycle through available images
      const selectedImage = uniqueImages[imageIndex]

      console.log(`\n🏢 Processing room: ${room.name}`)
      console.log(`   📸 Using image by ${selectedImage.user.name} (@${selectedImage.user.username})`)

      try {
        // Download image
        const imageBuffer = await downloadImage(selectedImage.urls.regular)
        
        // Upload to Supabase Storage
        const publicUrl = await uploadImageToSupabase(
          room.id, 
          imageBuffer, 
          `room-image-${selectedImage.id}`
        )

        if (!publicUrl) {
          console.error(`❌ Failed to upload image for room: ${room.name}`)
          errorCount++
          continue
        }

        // Update room record
        const updateSuccess = await updateRoomImage(room.id, publicUrl)
        
        if (updateSuccess) {
          console.log(`✅ Successfully updated room: ${room.name}`)
          successCount++
        } else {
          console.error(`❌ Failed to update room record: ${room.name}`)
          errorCount++
        }

        // Add delay between uploads to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`❌ Error processing room ${room.name}:`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`✅ Successfully processed: ${successCount} rooms`)
    console.log(`❌ Errors: ${errorCount} rooms`)
    console.log(`📸 Total images used: ${Math.min(uniqueImages.length, rooms.length)}`)
    
    if (successCount > 0) {
      console.log('\n🎉 Room images have been successfully fetched and uploaded!')
      console.log(`🔗 Images are stored in Supabase Storage bucket: "${STORAGE_BUCKET}"`)
      console.log('🏢 Room records have been updated with image URLs')
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted. Cleaning up...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Process terminated. Cleaning up...')
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }