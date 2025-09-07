-- Enable extensions for cron jobs and HTTP requests
-- Migration: Enable pg_cron and pg_net extensions

-- Enable pg_cron for scheduling cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for making HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;
