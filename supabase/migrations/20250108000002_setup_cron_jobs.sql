-- Set up cron jobs for edge functions
-- Migration: Create scheduled cron jobs for automated functions

-- Schedule capacity violation detector to run every 3 minutes
SELECT cron.schedule(
  'capacity-violation-detector',
  '*/3 * * * *', -- Every 3 minutes
  $$
  SELECT net.http_post(
    url := 'https://nnipoczsqoylnrwidbgp.supabase.co/functions/v1/capacity-violation-detector',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Schedule sensor data simulator to run every minute (optional)
-- Uncomment if you want automated sensor data generation
SELECT cron.schedule(
  'sensor-data-simulator',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://nnipoczsqoylnrwidbgp.supabase.co/functions/v1/sensor-data-simulator',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Schedule room booking simulator to run every 20 minutes (optional)
-- Uncomment if you want automated booking generation
SELECT cron.schedule(
  'room-booking-simulator',
  '*/90 * * * *', -- Every 90 minutes
  $$
  SELECT net.http_post(
    url := 'https://nnipoczsqoylnrwidbgp.supabase.co/functions/v1/room-booking-simulator',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
