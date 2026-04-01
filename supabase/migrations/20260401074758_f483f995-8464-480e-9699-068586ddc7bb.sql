
ALTER TABLE public.plans 
  ADD COLUMN IF NOT EXISTS max_employees integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_storage_mb integer DEFAULT 500,
  ADD COLUMN IF NOT EXISTS max_db_mb integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_file_uploads integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_departments integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS allowed_features text[] DEFAULT '{}';
