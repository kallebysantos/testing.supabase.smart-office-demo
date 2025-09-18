-- ============================================================================
-- ADD NOTES TO SERVICE TICKETS MIGRATION
-- ============================================================================
-- Purpose: Add notes column to service tickets for MCP demo
-- Date: 2025-01-18
-- ============================================================================

-- Add notes column to service_tickets table
ALTER TABLE service_tickets
ADD COLUMN notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN service_tickets.notes IS 'Free-form text notes for tracking additional information about the service ticket';

-- ============================================================================
-- SAMPLE DATA UPDATE (Optional - for demo purposes)
-- ============================================================================

-- Add some sample notes to existing tickets to demonstrate the feature
UPDATE service_tickets
SET notes = 'Initial assessment completed. Awaiting facilities team response.'
WHERE status = 'processing'
AND notes IS NULL
LIMIT 2;

UPDATE service_tickets
SET notes = 'Room capacity limit increased from 8 to 10 people. Monitoring for future violations.'
WHERE status = 'resolved'
AND notes IS NULL
LIMIT 2;

UPDATE service_tickets
SET notes = 'High priority - Executive meeting affected. Temporary solution implemented with additional seating from Conference Room B.'
WHERE severity = 'high'
AND notes IS NULL
LIMIT 1;