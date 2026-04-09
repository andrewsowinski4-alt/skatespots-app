-- Create profile for existing user andrewsowinski4@gmail.com
-- User ID: 0d5288c7-e2c9-47b9-b363-ed81fc43b232

INSERT INTO profiles (id, location, years_skating, age, bio, avatar_url)
VALUES (
  '0d5288c7-e2c9-47b9-b363-ed81fc43b232',
  'Toronto',
  0,
  0,
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;
