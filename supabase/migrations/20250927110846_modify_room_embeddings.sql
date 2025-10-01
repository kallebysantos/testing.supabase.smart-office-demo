
-- Use 1:1 relation with rooms
ALTER TABLE room_embeddings DROP COLUMN id;
ALTER TABLE room_embeddings ADD PRIMARY KEY (room_id); -- Use room_id as PK

-- Modidy vector size to be Supabase's gte-small compatible
ALTER table room_embeddings
  DROP COLUMN embedding; -- Drop OpenAI ada-002 dimensions

ALTER table room_embeddings
  ADD COLUMN embedding extensions.halfvec(384); -- Supabase gte-small dimensions with f16 quantinization

-- f16 quantinization vector index
create index on room_embeddings using hnsw (embedding extensions.halfvec_l2_ops);
