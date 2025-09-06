-- Smart Office Dashboard Row Level Security (RLS) Policies
-- Migration: Set up security policies for enterprise demo

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

-- Create function to automatically create user profile on signup
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

-- Create trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check floor access
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