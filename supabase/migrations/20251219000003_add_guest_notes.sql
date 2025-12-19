-- Add guest_name and make user_id nullable
ALTER TABLE song_notes ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE song_notes ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS for public notes
-- Note: 'song_notes' already has RLS enabled.

-- Allow public to INSERT notes if the song is public
CREATE POLICY "Public can add notes to shared songs"
ON song_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_notes.song_id
    AND songs.is_public = true
  )
);

-- Allow public to VIEW notes if the song is public
CREATE POLICY "Public can view notes on shared songs"
ON song_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_notes.song_id
    AND songs.is_public = true
  )
);
