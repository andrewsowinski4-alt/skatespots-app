-- Fix RLS policies for skate_spots and admin_users tables
-- Allow public read access to approved spots and admin_users for checking admin status

-- First, ensure RLS is enabled
ALTER TABLE skate_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved spots" ON skate_spots;
DROP POLICY IF EXISTS "Authenticated users can insert spots" ON skate_spots;
DROP POLICY IF EXISTS "Anyone can check admin status" ON admin_users;

-- Skate spots policies
-- Allow anyone (including anonymous) to view approved spots
CREATE POLICY "Anyone can view approved spots" ON skate_spots
  FOR SELECT USING (status = 'approved');

-- Allow authenticated users to view their own submitted spots regardless of status
CREATE POLICY "Users can view own spots" ON skate_spots
  FOR SELECT USING (auth.uid() = submitted_by);

-- Allow authenticated users to insert new spots
CREATE POLICY "Authenticated users can insert spots" ON skate_spots
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Admin users policies
-- Allow anyone to check if an email is an admin (needed for admin dashboard access check)
CREATE POLICY "Anyone can check admin status" ON admin_users
  FOR SELECT USING (true);
