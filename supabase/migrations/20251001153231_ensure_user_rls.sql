-- Ensure non admin users only see their own profiles
drop policy if exists "public_read_user_profiles" on user_profiles;
create policy "public_read_user_profiles"
on user_profiles
for select using (
  (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  or (select auth.uid()) = id
);

-- Ensure users can only see allowed rooms
create or replace function public.has_floor_access(floor_number integer)
returns boolean as $$
begin
  return (
    select floor_number=any(floor_access) as has_floor_access
    from user_profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

drop policy if exists "public_read_rooms" on rooms;
create policy "public_read_rooms"
on rooms
for select using (
  (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  or public.has_floor_access(floor)
);

-- Ensure non admin users only see their own bookings
drop policy if exists "public_read_bookings" on room_bookings;
create policy "public_read_bookings"
on room_bookings
for select using (
  (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  or (select auth.jwt()->>'email') = organizer_email
);
