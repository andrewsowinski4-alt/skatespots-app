-- Restrict skate_spots SELECT so pending/rejected rows are not readable anonymously.
-- Replaces permissive `skate_spots_select` from scripts/008_simplify_rls.sql (USING (true)).
--
-- Allowed:
--   - Anyone (including anon): rows with status = 'approved' (public map, GET /api/spots, /spots/[id])
--   - Authenticated submitter: own rows (any status) — profile counts, future "my submissions"
--   - Admin (email in admin_users): all rows — admin dashboard moderation
--
-- Apply in Supabase SQL editor after 008 (and other skate_spots migrations).

DROP POLICY IF EXISTS "skate_spots_select" ON skate_spots;

CREATE POLICY "skate_spots_select" ON skate_spots
  FOR SELECT USING (
    status = 'approved'
    OR (auth.uid() IS NOT NULL AND submitted_by = auth.uid())
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (auth.jwt() ->> 'email')
    )
  );
