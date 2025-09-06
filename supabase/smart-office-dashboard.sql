-- ============================================================================
-- SMART OFFICE DASHBOARD - MASTER DATABASE SCHEMA
-- ============================================================================
-- Company: Dewey, Cheatham & Howe (Law Firm)
-- Purpose: Conference room utilization and analytics for enterprise demos
-- 
-- This file contains the complete database schema including:
-- - All table definitions
-- - Indexes and constraints
-- - Sample data for demonstrations
-- - Row Level Security (RLS) policies
-- - Helper functions
--
-- Last Updated: 2025-09-06
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgvector;

-- ============================================================================
-- TABLE DEFINITIONS
-- ============================================================================

-- Conference Rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  floor INTEGER NOT NULL,
  building VARCHAR(50) DEFAULT 'Main Office',
  amenities TEXT[], -- projector, whiteboard, etc.
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Sensor Data
CREATE TABLE sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  occupancy INTEGER NOT NULL CHECK (occupancy >= 0),
  temperature DECIMAL(5,2),
  noise_level DECIMAL(5,2), -- decibels
  air_quality INTEGER CHECK (air_quality BETWEEN 0 AND 100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Bookings (simulated from calendar system)
CREATE TABLE room_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  title VARCHAR(200) NOT NULL,
  organizer_email VARCHAR(100),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attendee_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (for auth demo)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  full_name VARCHAR(100),
  department VARCHAR(50),
  role VARCHAR(20) CHECK (role IN ('employee', 'facilities', 'admin')),
  floor_access INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical Analytics (ETL destination)
CREATE TABLE daily_room_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  date DATE NOT NULL,
  total_occupancy_hours DECIMAL(10,2),
  peak_occupancy INTEGER,
  avg_temperature DECIMAL(5,2),
  booking_count INTEGER,
  utilization_rate DECIMAL(5,4), -- percentage as decimal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, date)
);

-- Facility Alerts
CREATE TABLE facility_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embeddings for natural language queries
CREATE TABLE room_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  content TEXT, -- room description + amenities
  embedding vector(1536), -- OpenAI ada-002 dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core performance indexes
CREATE INDEX idx_sensor_readings_room_time ON sensor_readings(room_id, timestamp DESC);
CREATE INDEX idx_room_bookings_room_time ON room_bookings(room_id, start_time);
CREATE INDEX idx_daily_analytics_room_date ON daily_room_analytics(room_id, date);
CREATE INDEX idx_facility_alerts_room_resolved ON facility_alerts(room_id, resolved);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, floor_access)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee',
    ARRAY[3, 5, 7, 8, 10, 12, 15] -- Default floor access
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check floor access
CREATE OR REPLACE FUNCTION public.has_floor_access(floor_number INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT floor_number = ANY(floor_access) 
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_room_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_alerts ENABLE ROW LEVEL SECURITY;

-- Read-only access for public, write access for service role only
-- This ensures security while allowing demo functionality

-- Public read access for all users
CREATE POLICY "public_read_rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "public_read_sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "public_read_user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "public_read_bookings" ON room_bookings FOR SELECT USING (true);
CREATE POLICY "public_read_analytics" ON daily_room_analytics FOR SELECT USING (true);
CREATE POLICY "public_read_alerts" ON facility_alerts FOR SELECT USING (true);

-- Service role write access for scripts and Edge Functions
CREATE POLICY "service_insert_rooms" ON rooms FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_update_rooms" ON rooms FOR UPDATE 
USING (auth.role() = 'service_role');

CREATE POLICY "service_insert_sensor_readings" ON sensor_readings FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_insert_user_profiles" ON user_profiles FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_update_user_profiles" ON user_profiles FOR UPDATE 
USING (auth.role() = 'service_role');

CREATE POLICY "service_insert_bookings" ON room_bookings FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_insert_analytics" ON daily_room_analytics FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_insert_alerts" ON facility_alerts FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_update_alerts" ON facility_alerts FOR UPDATE 
USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE rooms IS 'Conference rooms and meeting spaces';
COMMENT ON TABLE sensor_readings IS 'Real-time IoT sensor data from rooms';
COMMENT ON TABLE room_bookings IS 'Calendar bookings and reservations';
COMMENT ON TABLE user_profiles IS 'User profiles linked to Supabase auth';
COMMENT ON TABLE daily_room_analytics IS 'Aggregated daily analytics for reporting';
COMMENT ON TABLE facility_alerts IS 'System alerts and notifications';
COMMENT ON TABLE room_embeddings IS 'Vector embeddings for semantic search';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Note: Vector embeddings for room_embeddings.embedding would be populated
-- via application code using OpenAI API or similar embedding service.