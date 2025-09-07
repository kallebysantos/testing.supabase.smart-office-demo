# Smart Office Dashboard 🏢

A comprehensive conference room utilization and analytics platform built for **Dewey, Cheatham & Howe Law Firm**. This Next.js application demonstrates enterprise-grade IoT sensor data processing, real-time monitoring, and advanced analytics capabilities using Supabase as the backend.

## 🎯 Overview

This smart office dashboard provides real-time insights into conference room utilization, environmental conditions, and booking patterns. Built as a sophisticated demo application, it showcases modern web technologies, real-time data processing, and advanced analytics features including **Supabase Analytics Buckets** for large-scale historical analysis.

**Key Highlights:**
- **57 Conference Rooms** across multiple floors and buildings
- **Real-time IoT sensor data** (occupancy, temperature, noise, air quality)
- **Live booking integration** with calendar systems
- **Advanced analytics** with historical trend analysis
- **Enterprise-grade security** with role-based access control

## 🚀 Features

### 🏢 Real-time Room Monitoring
- Live occupancy tracking with sensor data
- Environmental monitoring (temperature, noise level, air quality)
- Booking status and capacity management
- Visual indicators for room availability
- Real-time updates via Supabase subscriptions

### 📊 Advanced Analytics Dashboard
- **Historical utilization analysis** (30+ days of data)
- **Room performance ranking** - identify underutilized spaces
- **Capacity problem detection** - rooms frequently over capacity
- **Environmental trend analysis** - air quality and temperature patterns
- **Peak usage identification** - hourly and daily patterns
- **Analytics Buckets integration** - 17x faster query performance with Apache Iceberg

### 📅 Booking Management
- Real-time booking status (Upcoming, Active Now, Completed)
- Live room status for active meetings
- Booking filters and search functionality
- Integration with calendar systems
- Attendee count tracking

### 🚨 Real-time Alerts & Facilities Management
- **Automated capacity violation detection** - AI-powered monitoring system
- **ServiceNow integration** - Seamless ticket creation and management
- **Real-time service ticket queue** - Live monitoring of facility issues
- **Automated workflow processing** - From detection to resolution
- **Facilities team dashboard** - Priority-based ticket assignment
- **SLA tracking and monitoring** - Performance metrics and compliance

### 🔐 Enterprise Authentication
- Role-based access control (Employee, Facilities, Admin)
- Secure Supabase authentication
- Department-based permissions
- Floor access restrictions
- Professional branding and UI

### 🎨 Modern UI/UX
- Responsive design for desktop and mobile
- Beautiful charts and data visualizations
- Real-time visual feedback (glowing cards on updates)
- Professional law firm theming
- Accessibility-compliant interface

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - App Router with TypeScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Modern styling framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Recharts](https://recharts.org/)** - Data visualization library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time subscriptions
- **[Supabase Edge Functions](https://supabase.com/docs/guides/functions)** - Serverless data simulators (Deno runtime)
- **[Supabase Auth](https://supabase.com/docs/guides/auth)** - Authentication and user management
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Database-level security

### Analytics & Performance
- **Analytics Buckets** - Large-scale data analysis with Apache Iceberg
- **Real-time subscriptions** - Live data updates via WebSocket
- **Edge Function simulators** - Realistic IoT sensor data generation
- **Time-series analysis** - Historical trends and patterns

## 📋 Prerequisites

- **Node.js 18+** 
- **npm/yarn/pnpm**
- **Supabase account** with project setup
- **Environment variables** (see configuration below)

## ⚙️ Environment Setup

Create a `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required Supabase Setup

1. **Database Schema**: Run the master SQL file
   ```bash
   # Apply the complete schema
   psql -h your-db-host -U postgres -d postgres < supabase/smart-office-dashboard.sql
   ```

2. **Real-time Configuration**: Enable table subscriptions
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
   ALTER PUBLICATION supabase_realtime ADD TABLE room_bookings;  
   ALTER PUBLICATION supabase_realtime ADD TABLE facility_alerts;
   ALTER PUBLICATION supabase_realtime ADD TABLE service_tickets;
   ```

3. **Edge Functions**: Deploy data simulators and facilities management
   ```bash
   supabase functions deploy sensor-data-simulator
   supabase functions deploy room-booking-simulator
   supabase functions deploy capacity-violation-detector
   ```

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd smart-office-dashboard
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Configure your Supabase project details
   ```

3. **Database Setup**
   ```bash
   # Import the complete schema
   supabase db reset
   # Run the master SQL file in your Supabase dashboard
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Access Application**
   Open [http://localhost:3000](http://localhost:3000)

## 📱 Application Architecture

### Page Structure
```
📁 src/app/
├── 📄 page.tsx           # Landing/redirect page
├── 🔐 login/             # Authentication
├── 📊 dashboard/         # Executive metrics overview  
├── 🏢 rooms/             # Live room monitoring (main page)
├── 📅 bookings/          # Booking management
├── 📈 analytics/         # Historical analysis & Analytics Buckets
├── 🚨 alerts/            # Real-time facilities management system
└── 👤 profile/           # User profile settings
```

### Component Architecture
```
📁 src/components/
├── 🎨 ui/                # shadcn/ui base components
├── 🧭 navigation/        # Navigation menu with role-based access
├── 🏢 dashboard/         # Dashboard-specific widgets
├── 📊 charts/            # Custom chart components
└── 🔧 common/            # Shared utility components
```

### Data Layer
```
📁 src/lib/
├── 🔌 supabase/          # Database client and configuration
├── 🎯 types/             # TypeScript definitions
└── 🛠️ utils/             # Helper functions and utilities
```

## 🏗️ Database Schema

### Core Tables
- **`rooms`** - Conference room details (57 rooms across multiple floors)
- **`sensor_readings`** - IoT sensor data (occupancy, temperature, noise, air quality)
- **`room_bookings`** - Calendar integration and booking data
- **`user_profiles`** - User authentication and role management
- **`service_tickets`** - Automated facilities management tickets with ServiceNow integration
- **`facility_alerts`** - Legacy system notifications and maintenance alerts

### Real-time Features
- **Live sensor updates** via Supabase real-time subscriptions
- **Booking status changes** with immediate UI updates
- **Automated capacity violation detection** with service ticket creation
- **Real-time ticket queue processing** and assignment workflows
- **ServiceNow integration** for enterprise facilities management
- **Environmental monitoring** with threshold notifications

### Analytics Buckets Integration
- **Large-scale historical analysis** using Apache Iceberg
- **Time travel queries** for data versioning
- **Schema evolution support** for changing data requirements
- **Open table format** for data portability

## 📊 Key Features Deep Dive

### Dashboard Pages

#### 🏢 Rooms (`/rooms`) - Main Monitoring
- **Live room cards** showing current occupancy, temperature, and environmental data
- **Real-time visual feedback** with yellow glow effects on data updates
- **Capacity indicators** with color-coded status (Available/Occupied/Full)
- **Environmental metrics** including air quality and noise levels
- **Automatic updates** via Supabase real-time subscriptions

#### 📈 Analytics (`/analytics`) - Historical Analysis
- **Room utilization ranking** - identify most/least used spaces
- **Usage trend analysis** with 14-day historical charts
- **Capacity problem detection** over time
- **Environmental correlation analysis** 
- **Peak usage patterns** by hour of day
- **Analytics Buckets toggle** demonstrating 17x performance improvement
- **Detailed room performance matrix** with radar charts

#### 📅 Bookings (`/bookings`) - Meeting Management
- **Active meeting monitoring** with live room status
- **Booking filters** (Upcoming, Active Now, Completed) 
- **Real-time occupancy data** for active meetings only
- **Calendar integration** showing meeting details
- **Environmental monitoring** for active rooms

#### 📊 Dashboard (`/dashboard`) - Executive Overview
- **Key metrics overview** (available rooms, utilization, violations)
- **Environmental averages** (temperature, air quality, noise)
- **Recent activity feed** with booking updates
- **High-utilization alerts** for capacity management
- **User access permissions** display

#### 🚨 Alerts (`/alerts`) - Facilities Management System
- **Real-time service ticket queue** monitoring (Queued, Processing, Assigned, Resolved)
- **Automated capacity violation detection** with instant ticket creation
- **ServiceNow integration** with external ticket ID tracking and branding
- **Priority-based ticket assignment** with SLA monitoring
- **Resolution tracking** with detailed notes and performance metrics
- **Manual ticket resolution** tools for facilities team
- **Live queue processing** with automated workflow management
- **High-priority violation** dashboard with critical alerts

## 🎯 Demo Scenarios

### Real-time Monitoring Demo
1. Start sensor data simulator: `supabase functions invoke sensor-data-simulator`
2. Navigate to `/rooms` to see live updates
3. Watch cards glow yellow as new sensor data arrives
4. Observe occupancy, temperature, and environmental changes

### Analytics Buckets Performance Demo
1. Navigate to `/analytics` 
2. Click "Turn on Analytics Buckets" toggle
3. Observe query performance improvement (3500ms → 200ms)
4. Explore historical utilization trends and insights

### Booking Management Demo  
1. Run booking simulator: `supabase functions invoke room-booking-simulator`
2. Navigate to `/bookings`
3. Filter by "Active Now" to see live room status
4. Watch real-time sensor data for active meetings

### Automated Facilities Management Demo
1. Navigate to `/alerts` (Facilities/Admin role required)
2. Click "Trigger Detection" to simulate capacity violations
3. Watch automated service ticket creation with ServiceNow integration
4. Observe real-time queue processing and ticket assignment
5. Use manual resolution tools to complete tickets
6. Monitor SLA tracking and performance metrics

## 🔒 Security & Permissions

### Role-Based Access Control
- **Employee**: Dashboard, Rooms, My Bookings, Profile
- **Facilities**: All employee features + All Bookings, Analytics, **Alerts System**
- **Admin**: All features + Raw Data, System Administration, **Full Alerts Management**

### Database Security
- **Row Level Security (RLS)** policies for all tables
- **Service role access** for Edge Functions and scripts
- **Public read access** for demonstration purposes
- **Secure API endpoints** with proper authentication

## 📈 Performance Optimization

- **Server-side rendering** with Next.js App Router
- **Real-time subscriptions** instead of polling
- **Individual state updates** to prevent unnecessary re-renders
- **Code splitting** and lazy loading for optimal bundle sizes
- **Analytics Buckets** for large-scale query performance
- **Image optimization** with Next.js Image component

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Build and deploy
npm run build
# Configure environment variables in Vercel dashboard
# Connect GitHub repository for automatic deployments
```

### Manual Production Deployment
```bash
npm run build
npm run start
```

### Environment Variables for Production
Ensure all environment variables are configured in your deployment platform with production Supabase credentials.

## 📊 Data Simulation

The application includes sophisticated Edge Functions for realistic data generation:

### Sensor Data Simulator (`sensor-data-simulator`)
- **Realistic occupancy patterns** based on booking data
- **Environmental correlations** (temperature rises with occupancy)
- **Consistent data transitions** (gradual changes, not random jumps)
- **Booking-aware logic** (higher occupancy during scheduled meetings)

### Booking Simulator (`room-booking-simulator`) 
- **Realistic meeting patterns** following business hours
- **Variable attendee counts** based on room capacity
- **Professional meeting titles** and organizer emails
- **Realistic duration patterns** (30min, 1hr, 2hr meetings)

## 🤝 Contributing

1. Fork the repository
2. Create feature branches (`feature/analytics-enhancement`)
3. Follow TypeScript best practices
4. Add tests for new features
5. Submit pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details

## 🏢 About Dewey, Cheatham & Howe

This application is built for the fictional law firm "Dewey, Cheatham & Howe," serving as a sophisticated demonstration of modern office technology solutions. The firm's 57 conference rooms across multiple floors provide an ideal scenario for showcasing enterprise-scale IoT monitoring and analytics capabilities.

---

**Built with ❤️ for enterprise IoT demonstrations**
**Showcasing: Next.js 14, Supabase, Analytics Buckets, Real-time Data Processing**