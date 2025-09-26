-- Set up cron jobs for edge functions
-- Migration: Create scheduled cron jobs for automated functions

-- Schedule capacity violation detector to run every 3 minutes
SELECT cron.schedule(
  'capacity-violation-detector',
  '*/3 * * * *', -- Every 3 minutes
  $$
  WITH secret as (
      select decrypted_secret AS supabase_anon_key
      from vault.decrypted_secrets
      where name = 'supabase_anon_key'
  ),
  settings AS (
      select decrypted_secret AS supabase_url
      from vault.decrypted_secrets
      where name = 'supabase_url'
  )
  SELECT net.http_post(
      url := (select supabase_url from settings) || '/functions/v1/' || 'capacity-violation-detector',
      headers := jsonb_build_object(
          'Authorization', 'Bearer ' || (select supabase_anon_key from secret),
          'Content-Type', 'application/json'
      ),
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
  WITH secret as (
      select decrypted_secret AS supabase_anon_key
      from vault.decrypted_secrets
      where name = 'supabase_anon_key'
  ),
  settings AS (
      select decrypted_secret AS supabase_url
      from vault.decrypted_secrets
      where name = 'supabase_url'
  )
  SELECT net.http_post(
      url := (select supabase_url from settings) || '/functions/v1/' || 'sensor-data-simulator',
      headers := jsonb_build_object(
          'Authorization', 'Bearer ' || (select supabase_anon_key from secret),
          'Content-Type', 'application/json'
      ),
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
  WITH secret as (
      select decrypted_secret AS supabase_anon_key
      from vault.decrypted_secrets
      where name = 'supabase_anon_key'
  ),
  settings AS (
      select decrypted_secret AS supabase_url
      from vault.decrypted_secrets
      where name = 'supabase_url'
  )
  SELECT net.http_post(
      url := (select supabase_url from settings) || '/functions/v1/' || 'room-booking-simulator',
      headers := jsonb_build_object(
          'Authorization', 'Bearer ' || (select supabase_anon_key from secret),
          'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
  );
  $$
);
