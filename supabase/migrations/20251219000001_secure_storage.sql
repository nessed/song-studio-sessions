-- Drop the insecure public access policy
DROP POLICY "Audio files are publicly accessible" ON storage.objects;

-- Create secure private access policy
-- Assumes file path structure: "{user_id}/{song_id}/{filename}"
CREATE POLICY "Users can only view their own audio files" ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
