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
