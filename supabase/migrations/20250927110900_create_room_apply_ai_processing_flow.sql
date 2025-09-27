create schema if not exists private;

-- Create the pgflow pipeline
SELECT pgflow.create_flow('room_apply_ai_processing');
SELECT pgflow.add_step('room_apply_ai_processing', 'generate_description');
SELECT pgflow.add_step('room_apply_ai_processing', 'embed', ARRAY['generate_description']);

-- Handle a new room and push it to the queue
create or replace function private.handle_new_rooms_and_apply_ai_process_batch()
returns trigger
language plpgsql
security definer
as $$
  declare
    result bigint;
begin
  with value as (
    select jsonb_build_object('id', n.id) as id
    from new_table n
  ),
  send as (
    select pgflow.start_flow('room_apply_ai_processing', id)
    from value
  )
  select count(*) from send into result;

  return null;
end;
$$;

create or replace trigger on_handle_new_rooms_and_apply_ai_process_batch
after insert on rooms
referencing new table as new_table
  for each row
  execute function private.handle_new_rooms_and_apply_ai_process_batch();

-- Keep edge worker ON
-- https://www.pgflow.dev/how-to/keep-workers-up/#smart-safety-net-solution
SELECT cron.schedule(
  'pgflow-watchdog--flow-rooms-apply-ai-processing',
  '10 seconds',
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
    url := (select supabase_url from settings) || '/functions/v1/' || 'flow-rooms-apply-ai-processing',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select supabase_anon_key from secret))
  ) AS request_id
  WHERE (
    SELECT COUNT(DISTINCT worker_id) FROM pgflow.workers
    WHERE function_name = 'flow-rooms-apply-ai-processing'
      AND last_heartbeat_at > NOW() - make_interval(secs => 6)
  ) < 2;
  $$
);
