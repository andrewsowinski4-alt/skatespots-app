import type { SkateSpot } from '@/lib/types'

/**
 * Keep only spots with valid WGS84 coordinates for Mapbox markers.
 * Drops rows with null/NaN/out-of-range lat/lng (bad legacy data or import errors).
 */
export function normalizeSkateSpotsForMap(spots: SkateSpot[]): SkateSpot[] {
  const out: SkateSpot[] = []
  for (const s of spots) {
    const lat = Number(s.latitude)
    const lng = Number(s.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue
    out.push({ ...s, latitude: lat, longitude: lng })
  }
  return out
}
