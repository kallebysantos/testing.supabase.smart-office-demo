-- Manual setup for pg_net and cron jobs
-- Run this in your Supabase SQL Editor

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;

-- Step 3: Schedule capacity violation detector (every 3 minutes)
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

-- Step 4: Schedule sensor data simulator (every minute)
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

-- Step 5: Schedule room booking simulator (every 90 minutes)
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

-- Step 6: Verify the cron jobs are scheduled
SELECT * FROM cron.job;
