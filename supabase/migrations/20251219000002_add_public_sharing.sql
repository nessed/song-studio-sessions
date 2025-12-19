-- Add public sharing columns to songs
ALTER TABLE songs ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE songs ADD COLUMN share_hash TEXT UNIQUE DEFAULT NULL;

-- Enable public read access for shared songs
CREATE POLICY "Public Read Access"
ON songs
FOR SELECT
USING (is_public = true);

-- Enable public read access for versions of shared songs
CREATE POLICY "Public Read Access Versions"
ON song_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_versions.song_id
    AND songs.is_public = true
  )
);

-- Note: Storage buckets for 'audio' and 'covers' might need public policies too if not already public.
-- Usually, we use signed URLs or make the bucket public. 
-- For this MVP, we rely on the `getPublicUrl` returning a valid URL, 
-- but RLS on the table is the gatekeeper for the *app* seeing it.
