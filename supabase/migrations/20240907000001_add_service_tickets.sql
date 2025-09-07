-- ============================================================================
-- SERVICE TICKETS MIGRATION
-- ============================================================================
-- Purpose: Add service tickets table for automated facilities management
-- Date: 2024-09-07
-- ============================================================================

-- Service Tickets (Automated Facilities Management)
CREATE TABLE service_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  ticket_type VARCHAR(50) NOT NULL, -- 'capacity_violation', 'maintenance', 'environmental'
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('queued', 'processing', 'assigned', 'resolved')) DEFAULT 'queued',
  priority INTEGER DEFAULT 3, -- 1=highest, 5=lowest
  
  -- Violation details
  trigger_reading_id UUID REFERENCES sensor_readings(id),
  violation_data JSONB, -- Store specific violation details
  
  -- Assignment and resolution
  assigned_to VARCHAR(100),
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- ServiceNow integration fields (for demo)
  external_ticket_id VARCHAR(50),
  external_system VARCHAR(20) DEFAULT 'servicenow',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_service_tickets_status_created ON service_tickets(status, created_at DESC);
CREATE INDEX idx_service_tickets_room_status ON service_tickets(room_id, status);
CREATE INDEX idx_service_tickets_priority_created ON service_tickets(priority, created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Add updated_at trigger for service tickets
CREATE TRIGGER update_service_tickets_updated_at
    BEFORE UPDATE ON service_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on service tickets table
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "public_read_service_tickets" ON service_tickets 
FOR SELECT USING (true);

-- Service role write access for Edge Functions and scripts
CREATE POLICY "service_insert_service_tickets" ON service_tickets 
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_update_service_tickets" ON service_tickets 
FOR UPDATE USING (auth.role() = 'service_role');

-- Facilities and admin users can update tickets (for manual resolution)
CREATE POLICY "facilities_update_service_tickets" ON service_tickets 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('facilities', 'admin')
  )
);

-- ============================================================================
-- REAL-TIME CONFIGURATION
-- ============================================================================

-- Enable real-time updates for service tickets
ALTER PUBLICATION supabase_realtime ADD TABLE service_tickets;

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE service_tickets IS 'Automated service tickets for facilities management and capacity violation tracking';
COMMENT ON COLUMN service_tickets.violation_data IS 'JSON data containing specific violation details like occupancy levels, thresholds, etc.';
COMMENT ON COLUMN service_tickets.external_ticket_id IS 'Reference to external systems like ServiceNow for integration demos';

-- ============================================================================
-- SAMPLE DATA (Optional - for demo purposes)
-- ============================================================================

-- Insert some sample resolved tickets to demonstrate the system
INSERT INTO service_tickets (
  room_id, 
  ticket_type, 
  title, 
  description, 
  severity, 
  status, 
  priority,
  violation_data,
  assigned_to,
  assigned_at,
  resolved_at,
  resolution_notes,
  external_ticket_id,
  created_at,
  updated_at
) 
SELECT 
  r.id,
  'capacity_violation',
  'Over-capacity detected in ' || r.name,
  'Room exceeded capacity limit during meeting. Automatic detection triggered service ticket.',
  CASE 
    WHEN random() < 0.3 THEN 'high'
    WHEN random() < 0.7 THEN 'medium' 
    ELSE 'low'
  END,
  'resolved',
  CASE 
    WHEN random() < 0.3 THEN 1
    WHEN random() < 0.6 THEN 2
    ELSE 3
  END,
  jsonb_build_object(
    'occupancy', (r.capacity + floor(random() * 5) + 1),
    'capacity', r.capacity,
    'violation_percentage', round((((r.capacity + floor(random() * 5) + 1) - r.capacity) * 100.0 / r.capacity)::numeric, 1)
  ),
  CASE 
    WHEN random() < 0.5 THEN 'John Smith (Facilities)'
    ELSE 'Sarah Johnson (Facilities)'
  END,
  NOW() - interval '2 hours' - (random() * interval '24 hours'),
  NOW() - (random() * interval '2 hours'),
  CASE 
    WHEN random() < 0.5 THEN 'Contacted meeting organizer. Moved overflow attendees to adjacent room. Updated room booking guidelines.'
    ELSE 'Installed additional chairs temporarily. Scheduled facilities review for room capacity optimization.'
  END,
  'SNOW-' || lpad((10000 + floor(random() * 90000))::text, 5, '0'),
  NOW() - interval '1 day' - (random() * interval '7 days'),
  NOW() - (random() * interval '2 hours')
FROM rooms r 
WHERE r.name IN ('Conference Room A', 'Conference Room B', 'Executive Boardroom', 'The Crystal Palace')
LIMIT 8;

-- Insert some active tickets to show current queue status
INSERT INTO service_tickets (
  room_id, 
  ticket_type, 
  title, 
  description, 
  severity, 
  status, 
  priority,
  violation_data,
  external_ticket_id,
  created_at
) 
SELECT 
  r.id,
  'capacity_violation',
  'Capacity monitoring alert for ' || r.name,
  'Automated detection of potential over-capacity situation requiring facilities review.',
  CASE 
    WHEN random() < 0.4 THEN 'medium'
    ELSE 'high'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'queued'
    WHEN random() < 0.6 THEN 'processing'
    ELSE 'assigned'
  END,
  CASE 
    WHEN random() < 0.4 THEN 2
    ELSE 3
  END,
  jsonb_build_object(
    'occupancy', (r.capacity + floor(random() * 3) + 1),
    'capacity', r.capacity,
    'violation_percentage', round((((r.capacity + floor(random() * 3) + 1) - r.capacity) * 100.0 / r.capacity)::numeric, 1)
  ),
  'SNOW-' || lpad((10000 + floor(random() * 90000))::text, 5, '0'),
  NOW() - (random() * interval '4 hours')
FROM rooms r 
WHERE r.capacity >= 6
ORDER BY random()
LIMIT 3;