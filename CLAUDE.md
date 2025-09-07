# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Smart Office Dashboard** for Dewey, Cheatham & Howe Law Firm - a comprehensive conference room utilization and analytics platform built with Next.js 15 and Supabase. The application demonstrates enterprise-grade IoT sensor data processing, real-time monitoring, and advanced analytics capabilities.

**Key Features:**
- 57 conference rooms with real-time sensor monitoring
- Live booking integration with calendar systems  
- Advanced analytics with historical trend analysis
- Real-time alerts and ServiceNow integration
- Enterprise authentication with role-based access

## Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Data Generation Scripts
```bash
# Generate conference rooms data
npm run generate:rooms

# Generate user profiles
npm run generate:users

# Generate room images from Unsplash
npm run generate:images

# Generate service tickets
npm run generate:tickets
```

### Supabase Edge Functions
```bash
# Deploy sensor data simulator
npm run functions:deploy

# Deploy booking simulator
npm run functions:deploy-booking

# Deploy all functions
npm run functions:deploy-all
```

### Simulation Scripts
```bash
# Simulate sensor data (45 seconds of readings)
npm run simulate:sensors

# Simulate room bookings
npm run simulate:bookings

# Direct sensor API call (legacy)
npm run demo:start-sensors
```

## Architecture

### Application Structure
The app uses Next.js 15 App Router with the following key pages:
- `/` - Landing/redirect page
- `/login` - Authentication  
- `/dashboard` - Executive metrics overview
- `/rooms` - **Main page** - Live room monitoring with real-time updates
- `/bookings` - Booking management and active meeting tracking
- `/analytics` - Historical analysis with Analytics Buckets toggle
- `/alerts` - Real-time facilities management system (Facilities/Admin only)
- `/profile` - User profile settings

### Component Organization
```
src/components/
├── ui/                 # shadcn/ui base components
├── navigation/         # NavigationMenu with role-based access
├── auth/              # DemoAuthGuard authentication wrapper
├── rooms/             # Room monitoring components
├── bookings/          # Booking management components  
├── alerts/            # Facilities management components
└── ErrorBoundary.tsx  # Global error handling
```

### Data Layer
```
src/lib/
├── supabase/          # Database clients and types
├── api/               # API layer (alerts.ts, bookings.ts, rooms.ts)
├── utils/             # Helper functions and formatters
└── contexts/          # AuthContext for user management
```

### Custom Hooks
```
src/hooks/
├── useRooms.ts        # Real-time room data with subscriptions
├── useBookings.ts     # Booking management with filtering
└── useAlerts.ts       # Service tickets and facilities management
```

## Key Technical Details

### Real-time Features
- Uses Supabase real-time subscriptions for live updates
- Cards glow yellow on sensor data updates
- Automatic status calculations based on occupancy vs capacity
- Live booking status updates (upcoming → active → completed)

### Authentication & Roles
- Three user roles: `employee`, `facilities`, `admin`
- Role-based navigation and feature access
- Floor access restrictions based on user permissions
- Demo authentication via `DemoAuthGuard`

### Database Schema
Core tables:
- `rooms` - Conference room details and amenities
- `sensor_readings` - IoT sensor data (occupancy, temperature, noise, air quality)
- `room_bookings` - Calendar integration data
- `user_profiles` - User authentication and roles
- `service_tickets` - Automated facilities management with ServiceNow integration

### Analytics Features
- Analytics Buckets toggle for performance demonstration (17x improvement)
- Historical utilization trends and room ranking
- Environmental correlation analysis
- Capacity violation detection and tracking

### Edge Functions
- `sensor-data-simulator` - Generates realistic IoT sensor data
- `room-booking-simulator` - Creates law firm booking data using OpenAI
- `capacity-violation-detector` - Automated facilities management

## Environment Setup

Required environment variables in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External APIs (optional)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Code Conventions

### TypeScript
- All types defined in `src/types/index.ts` with branded types for safety
- Strict typing throughout with proper interfaces
- Type guards for runtime validation

### Styling
- Tailwind CSS for all styling
- shadcn/ui components for consistent design system
- Professional law firm color scheme with blue/gray palette
- Responsive design for desktop and mobile

### State Management  
- React Context for authentication (`AuthContext`)
- Custom hooks for data fetching with real-time subscriptions
- Local component state for UI interactions

### Error Handling
- `ErrorBoundary` component for global error catching
- Proper error states in all data-fetching components
- Loading spinners and skeleton states

## Development Tips

1. **Real-time Development**: The `/rooms` page is the main demo page with live sensor updates
2. **Role Testing**: Switch user roles in profile to test different permission levels
3. **Data Generation**: Run generation scripts in order: rooms → users → images → tickets
4. **Performance**: Analytics page demonstrates performance improvements with Analytics Buckets
5. **Facilities Demo**: Use `/alerts` page to demonstrate automated service ticket creation

## Testing

- No formal test framework configured
- Manual testing recommended for real-time features
- Test role-based access by switching user profiles
- Verify real-time subscriptions are working properly

## Common Patterns

### Data Fetching with Real-time
```typescript
// Pattern used in hooks like useRooms.ts
const { data, error } = useSWR(key, fetcher)
const subscription = supabase
  .channel('table-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, handleChange)
  .subscribe()
```

### Component Structure
```typescript
// Typical component pattern
export default function ComponentName() {
  const { data, loading, error } = useCustomHook()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage />
  
  return <div>...</div>
}
```

### Role-based Rendering
```typescript
// Check user permissions
const canAccessAlerts = user?.role === 'facilities' || user?.role === 'admin'
```

This is a sophisticated enterprise demo application showcasing modern web technologies, real-time data processing, and advanced analytics capabilities.