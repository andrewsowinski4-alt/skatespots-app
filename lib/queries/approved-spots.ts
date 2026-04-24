import type { SupabaseClient } from '@supabase/supabase-js'
import type { SkateSpot } from '@/lib/types'

/** Only rows with this status are exposed on the map and public spot pages. */
export const PUBLIC_SPOT_STATUS = 'approved' as const

/**
 * Approved spots for the home map and public consumers.
 * Pending and rejected rows are never included in query results here; RLS (`scripts/011_skate_spots_select_approved_owner_admin.sql`) also limits raw SELECT to approved, owner, or admin.
 *
 * Home flow: `fetchApprovedSkateSpots` → `normalizeSkateSpotsForMap` (`lib/map-spots.ts`)
 * → `HomeContent` / `SpotMap`. No mock data; optional `GET /api/spots` uses the same fetch.
 */
export async function fetchApprovedSkateSpots(supabase: SupabaseClient): Promise<{
  spots: SkateSpot[]
  error: { message: string } | null
}> {
  const { data, error } = await supabase
    .from('skate_spots')
    .select('*')
    .eq('status', PUBLIC_SPOT_STATUS)
    .order('created_at', { ascending: false })

  if (error) {
    return { spots: [], error: { message: error.message } }
  }

  return { spots: (data as SkateSpot[]) ?? [], error: null }
}
