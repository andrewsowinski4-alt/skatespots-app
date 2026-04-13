-- Public handle for profile completion (paired with display_name)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

COMMENT ON COLUMN profiles.username IS 'Unique handle; required together with display_name for app access.';

-- Case-insensitive uniqueness when set (allows multiple NULLs before completion)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON profiles (lower(username))
  WHERE username IS NOT NULL AND btrim(username) <> '';
