-- Create song_stems table for storing stems per version
CREATE TABLE IF NOT EXISTS song_stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES song_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stem_type TEXT NOT NULL CHECK (stem_type IN ('drums', 'bass', 'vocals', 'synths', 'guitars', 'other')),
  file_url TEXT NOT NULL,
  label TEXT,
  is_muted BOOLEAN DEFAULT FALSE,
  volume REAL DEFAULT 1.0 CHECK (volume >= 0 AND volume <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE song_stems ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own stems
CREATE POLICY "Users can manage their own stems"
  ON song_stems FOR ALL
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_song_stems_version_id ON song_stems(version_id);
