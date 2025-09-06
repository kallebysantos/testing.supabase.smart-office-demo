# Smart Office Dashboard - Scripts Documentation

This directory contains utility scripts for generating demo data and managing the smart office dashboard system.

## 🏢 Conference Rooms Generator

**File:** `generate-conference-rooms.ts`  
**Command:** `npm run generate:rooms`

Generates 57 conference rooms directly in Supabase with dog breed names and realistic law firm amenities.

### What it does:
- Creates rooms with capacities ranging from 4-30 people
- Assigns realistic amenities (AV equipment, catering, privacy glass, etc.)
- Distributes rooms across Main Office (floors 1-6) and Annex Office (floors 7-12)
- Clears existing rooms before generating new ones

### Room types generated:
- **Large Boardrooms:** Great Dane Grand Hall (30), Saint Bernard Boardroom (24)
- **Medium Meeting Rooms:** Golden Retriever (14), Labrador (12), Husky (12)
- **Small Conference Rooms:** Beagle (6), Poodle (6), Bulldog (4)
- **Specialty Rooms:** Client rooms, interview rooms, mediation spaces

### Prerequisites:
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

---

## 👥 Users Generator

**File:** `generate-users.ts`  
**Command:** `npm run generate:users`

Generates 25 user profiles directly in Supabase with fantasy names from popular universes.

### What it does:
- Creates users with names from Harry Potter, Star Wars, and Lord of the Rings
- Assigns realistic law firm roles and departments
- Sets appropriate floor access permissions based on role
- Maintains proper role distribution for a law firm

### Role distribution:
- **Admin (8%):** Full system access, all floors (1-12)
- **Facilities (12%):** Most floors (1-10), analytics access  
- **Employee (80%):** Limited floors (2-4 floors each), basic access

### Departments include:
Corporate Law, Litigation, Real Estate, Employment Law, Intellectual Property, Tax Law, Family Law, Criminal Defense, Immigration, Environmental Law, Healthcare Law, Securities, M&A, Banking & Finance, Insurance Defense, Personal Injury, Estate Planning, Compliance

### Prerequisites:
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

---

## 📸 Room Images Generator

**File:** `generate-room-images.ts`  
**Command:** `npm run generate:images`

Fetches conference room images from Unsplash API and uploads them to Supabase Storage.

### What it does:
- Searches Unsplash for "empty conference rooms" using multiple queries
- Downloads high-quality landscape images
- Uploads images to Supabase Storage in organized folders
- Updates room records with public image URLs
- Creates `room-images` storage bucket if needed

### Search queries used:
- "empty conference room modern"
- "empty meeting room office" 
- "empty boardroom contemporary"
- "empty conference room glass"
- "empty meeting room corporate"

### File organization:
```
room-images/
├── room-uuid-1/
│   └── room-image-unsplash-id.jpg
├── room-uuid-2/
│   └── room-image-unsplash-id.jpg
└── ...
```

### Prerequisites:
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` in `.env.local`
- Existing rooms in database (run `npm run generate:rooms` first)

### Rate limiting:
- 1 second delay between search requests
- 500ms delay between image uploads
- Respects Unsplash API hourly limits

---


## 📡 Sensor Data Simulator (Cron Job Simulator)

**File:** `simulate-sensors.sh`  
**Command:** `npm run simulate:sensors`

Simulates the production cron job that generates sensor data every minute.

### What it does:
- Calls the deployed sensor-data-simulator Edge Function
- Generates 45 seconds of realistic IoT sensor data
- Considers current room bookings for intelligent occupancy
- Updates temperature based on occupancy levels
- Provides detailed statistics and progress feedback

### Sensor Data Features:
- **Booking awareness**: Uses actual room bookings to determine occupancy
- **30% no-show rate**: Booked rooms sometimes stay empty (realistic!)
- **Consistency**: Gradual changes between runs (no sudden jumps)
- **Temperature logic**: Higher occupancy = warmer, lower = cooler from 72°F baseline
- **3-second intervals**: 15 readings per room over 45 seconds

### Prerequisites:
- sensor-data-simulator Edge Function deployed to Supabase
- Rooms generated (`npm run generate:rooms`)
- Users generated (`npm run generate:users`)

---

## 🏛️ Room Booking Simulator (Cron Job Simulator)

**File:** `simulate-bookings.sh`  
**Command:** `npm run simulate:bookings`

Simulates the production cron job that creates law firm bookings every 20 minutes.

### What it does:
- Calls the deployed room-booking-simulator Edge Function
- Finds available rooms and creates realistic law firm meetings
- Uses OpenAI API to generate authentic legal meeting titles
- Considers business hours, weekends, and night patterns
- Assigns appropriate organizers and attendee counts

### Booking Features:
- **OpenAI-generated titles**: Realistic law firm meeting names via GPT-3.5-turbo
- **Smart scheduling**: Respects business hours, weekends (15% chance), nights (5% chance)
- **Conflict detection**: Won't double-book rooms
- **Realistic attendee counts**: Based on room capacity and meeting type
- **25-50% occupancy**: Books realistic portion of available rooms

### Time Patterns:
- **Weekdays**: Full business hours (8 AM - 6 PM)
- **Weekends**: Very limited meetings (15% chance)
- **Night hours** (10 PM - 6 AM): Minimal meetings (5% chance)
- **Duration variety**: 30-120min based on meeting type and time

### Prerequisites:
- room-booking-simulator Edge Function deployed to Supabase
- `OPENAI_API_KEY` environment variable set in Edge Function
- Rooms and users generated

---

## 🚀 Deployment & Demo Commands

### Deploy Edge Functions
**Deploy Sensor Simulator:** `npm run functions:deploy`
```bash
supabase functions deploy sensor-data-simulator
```

**Deploy Booking Simulator:** `npm run functions:deploy-booking`
```bash
supabase functions deploy room-booking-simulator
```

**Deploy Both Functions:** `npm run functions:deploy-all`
```bash
supabase functions deploy sensor-data-simulator && supabase functions deploy room-booking-simulator
```

### Simulation Commands (Local Cron Job Testing)
**Simulate Sensor Data:** `npm run simulate:sensors`
- Generates 45 seconds of sensor readings
- Run every minute to simulate production

**Simulate Room Bookings:** `npm run simulate:bookings`
- Creates realistic law firm meetings
- Run every 20 minutes to simulate production

### Direct API Calls (Legacy)
**Start Sensor Simulator:** `npm run demo:start-sensors`
```bash
curl -X POST "http://localhost:54321/functions/v1/sensor-data-simulator" \
  -H "Authorization: Bearer $(supabase status | grep 'anon key' | awk '{print $3}')" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📋 Recommended Setup Sequence

For a fresh demo environment, run scripts in this order:

1. **Fix Database Policies** (run in Supabase SQL Editor first)
2. **Generate Rooms:** `npm run generate:rooms`
3. **Generate Users:** `npm run generate:users`  
4. **Generate Images:** `npm run generate:images`
5. **Deploy Functions:** `npm run functions:deploy`
6. **Start Sensor Demo:** `npm run demo:start-sensors`

## ⚠️ Environment Variables Required

Create `.env.local` file in project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Unsplash API (for image generation)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

## 🔧 Troubleshooting

**"SUPABASE_SERVICE_ROLE_KEY environment variable is required"**
- Set your service role key in `.env.local`
- Get key from Supabase Dashboard > Settings > API

**"No rooms found in database"** (for image generator)
- Run `npm run generate:rooms` first
- Verify RLS policies are fixed

**"Rate limit exceeded"** (for image generator)
- Wait an hour and try again
- Unsplash has hourly API limits

**Edge function errors**
- Ensure local Supabase is running: `supabase start`
- Deploy function first: `npm run functions:deploy`
- Check function logs in Supabase dashboard

## 📈 Script Output

All scripts provide detailed progress information:
- ✅ Success indicators with counts
- ❌ Error messages with details  
- 📊 Summary statistics
- 🧹 Cleanup operations
- ⚠️ Warnings and notes

Each script is designed to be idempotent - safe to run multiple times.