-- Smart Office Dashboard Database Schema
-- Migration: Create all tables for conference room utilization tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS vector;

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

-- Create index for performance
CREATE INDEX idx_sensor_readings_room_time ON sensor_readings(room_id, timestamp DESC);

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

-- Create additional indexes for performance
CREATE INDEX idx_room_bookings_room_time ON room_bookings(room_id, start_time);
CREATE INDEX idx_daily_analytics_room_date ON daily_room_analytics(room_id, date);
CREATE INDEX idx_facility_alerts_room_resolved ON facility_alerts(room_id, resolved);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Comments for documentation
COMMENT ON TABLE rooms IS 'Conference rooms and meeting spaces';
COMMENT ON TABLE sensor_readings IS 'Real-time IoT sensor data from rooms';
COMMENT ON TABLE room_bookings IS 'Calendar bookings and reservations';
COMMENT ON TABLE user_profiles IS 'User profiles linked to Supabase auth';
COMMENT ON TABLE daily_room_analytics IS 'Aggregated daily analytics for reporting';
COMMENT ON TABLE facility_alerts IS 'System alerts and notifications';
COMMENT ON TABLE room_embeddings IS 'Vector embeddings for semantic search';