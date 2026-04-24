-- Align DB with app submit flow (form + POST /api/spots + lib/schemas/submit-spot.ts)
-- Run on Supabase SQL editor if your project was created from older 001_* scripts.

-- Single photo pathname (Vercel Blob path) used by the app; legacy table may only have photo_urls[]
ALTER TABLE skate_spots ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Widen CHECK constraints to match enums in code (other, expert)
ALTER TABLE skate_spots DROP CONSTRAINT IF EXISTS skate_spots_spot_type_check;
ALTER TABLE skate_spots ADD CONSTRAINT skate_spots_spot_type_check
  CHECK (spot_type IN ('street', 'park', 'plaza', 'diy', 'other'));

ALTER TABLE skate_spots DROP CONSTRAINT IF EXISTS skate_spots_difficulty_check;
ALTER TABLE skate_spots ADD CONSTRAINT skate_spots_difficulty_check
  CHECK (
    difficulty IS NULL
    OR difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')
  );