-- Add display_name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profile with a default display name from email
UPDATE profiles 
SET display_name = split_part(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.id), 
  '@', 
  1
)
WHERE display_name IS NULL;
