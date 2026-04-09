-- Drop all existing policies and create simple ones
-- skate_spots policies
DROP POLICY IF EXISTS "Admins can view all spots" ON skate_spots;
DROP POLICY IF EXISTS "Anyone can view approved spots" ON skate_spots;
DROP POLICY IF EXISTS "Authenticated users can insert spots" ON skate_spots;
DROP POLICY IF EXISTS "Authenticated users can submit spots" ON skate_spots;
DROP POLICY IF EXISTS "Public can view approved spots" ON skate_spots;
DROP POLICY IF EXISTS "Users can view own spots" ON skate_spots;
DROP POLICY IF EXISTS "Users can view own submissions" ON skate_spots;
DROP POLICY IF EXISTS "Admins can update spots" ON skate_spots;
DROP POLICY IF EXISTS "Admins can delete spots" ON skate_spots;

-- Create simple policies for skate_spots
CREATE POLICY "skate_spots_select" ON skate_spots 
  FOR SELECT USING (true);

CREATE POLICY "skate_spots_insert" ON skate_spots 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "skate_spots_update" ON skate_spots 
  FOR UPDATE USING (
    auth.uid() IN (SELECT au.id FROM auth.users au JOIN admin_users a ON au.email = a.email)
  );

CREATE POLICY "skate_spots_delete" ON skate_spots 
  FOR DELETE USING (
    auth.uid() IN (SELECT au.id FROM auth.users au JOIN admin_users a ON au.email = a.email)
  );

-- admin_users policies
DROP POLICY IF EXISTS "Anyone can check admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can read admin list" ON admin_users;

CREATE POLICY "admin_users_select" ON admin_users 
  FOR SELECT USING (true);
