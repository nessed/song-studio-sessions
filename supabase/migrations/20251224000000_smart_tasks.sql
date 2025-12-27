-- Add smart task columns for priority, due dates, and ordering
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(song_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(song_id, due_date);
