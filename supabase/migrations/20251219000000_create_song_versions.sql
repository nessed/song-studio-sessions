-- Create song_versions table
CREATE TABLE public.song_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.song_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view versions of their own songs" ON public.song_versions 
  FOR SELECT USING (
    auth.uid() = user_id -- Simplest check: owner of version
    -- OR EXISTS (SELECT 1 FROM public.songs s WHERE s.id = song_versions.song_id AND s.user_id = auth.uid()) -- More robust: owner of song
  );

CREATE POLICY "Users can insert versions for their own songs" ON public.song_versions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update versions of their own songs" ON public.song_versions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete versions of their own songs" ON public.song_versions 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_song_versions_updated_at 
  BEFORE UPDATE ON public.song_versions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
