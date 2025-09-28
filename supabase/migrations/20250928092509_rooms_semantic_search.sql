create or replace function rooms_semantic_search(
    query_embedding vector (384),
    match_threshold float,
    match_count int
)
returns setof rooms
language sql
security invoker
as $$
  select
    r.*
  from rooms r
  inner join room_embeddings re on re.room_id = r.id
  where re.embedding <#> query_embedding < -match_threshold
  order by re.embedding <#> query_embedding asc
  limit least(match_count, 200);
$$;

create or replace function rooms_hybrid_search(
    query_embedding vector (384),
    building_location text default null,
    desired_amenities text[] default '{}',
    min_capacity int default null,
    match_threshold float default 0.7,
    match_count int default 10,
    full_text_weight float = 0.3,
    semantic_weight float = 1,
    rrf_k int = 50
)
returns setof rooms
language sql
security invoker
as $$
  with
  filtered_rooms as (
    select r.*
    from rooms r
    where (min_capacity is null or r.capacity >= min_capacity)
     and (building_location is null or r.building ilike building_location)
  ),
  full_text as (
    select 
      r.id,
      (
        select sum(similarity(amenity, desired))
        from unnest(r.amenities) amenity
        cross join unnest(desired_amenities) desired
      ) as score
    from filtered_rooms r
    order by score desc
    limit least(match_count, 50) * 2
  ),
  semantic as (
    select 
      r.id,
      re.embedding <#> query_embedding as score
    from filtered_rooms r
    inner join room_embeddings re on re.room_id = r.id
    order by score asc
    limit least(match_count, 50) * 2
  )
  select r.*
  from semantic
  full outer join full_text on full_text.id = semantic.id
  join filtered_rooms r on r.id = coalesce(semantic.id, full_text.id)
  order by 
    (coalesce(1.0/ (rrf_k + semantic.score), 0.0) * semantic_weight) +
    (coalesce(1.0 / (rrf_k + full_text.score), 0.0) * full_text_weight)
  limit least(match_count, 50);
$$;
