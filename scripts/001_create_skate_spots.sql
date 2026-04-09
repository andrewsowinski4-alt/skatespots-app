-- Create skate_spots table
CREATE TABLE IF NOT EXISTS skate_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  spot_type TEXT NOT NULL CHECK (spot_type IN ('street', 'park', 'diy', 'plaza')),
  features TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table for email whitelist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE skate_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skate_spots

-- Anyone can view approved spots
CREATE POLICY "Public can view approved spots" ON skate_spots
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can view their own submissions (any status)
CREATE POLICY "Users can view own submissions" ON skate_spots
  FOR SELECT
  USING (auth.uid() = submitted_by);

-- Authenticated users can submit new spots
CREATE POLICY "Authenticated users can submit spots" ON skate_spots
  FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Admins can view all spots (for approval workflow)
CREATE POLICY "Admins can view all spots" ON skate_spots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Admins can update spots (approve/reject)
CREATE POLICY "Admins can update spots" ON skate_spots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Admins can delete spots
CREATE POLICY "Admins can delete spots" ON skate_spots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for admin_users

-- Only admins can read the admin list
CREATE POLICY "Admins can read admin list" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to skate_spots
DROP TRIGGER IF EXISTS update_skate_spots_updated_at ON skate_spots;
CREATE TRIGGER update_skate_spots_updated_at
  BEFORE UPDATE ON skate_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skate_spots_status ON skate_spots(status);
CREATE INDEX IF NOT EXISTS idx_skate_spots_submitted_by ON skate_spots(submitted_by);
CREATE INDEX IF NOT EXISTS idx_skate_spots_location ON skate_spots(latitude, longitude);
