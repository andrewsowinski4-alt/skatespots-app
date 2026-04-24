import { createClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/home-content'
import { normalizeSkateSpotsForMap } from '@/lib/map-spots'
import { fetchApprovedSkateSpots } from '@/lib/queries/approved-spots'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()

  const { spots: rawSpots, error: spotsError } = await fetchApprovedSkateSpots(supabase)
  if (spotsError) {
    console.error('Approved spots query failed:', spotsError.message)
  }

  const spotsLoadError = spotsError
    ? 'Spots could not be loaded. Check your connection and try again.'
    : null

  const spots = spotsError ? [] : normalizeSkateSpotsForMap(rawSpots)
  if (!spotsError && rawSpots.length > 0 && spots.length < rawSpots.length) {
    console.warn(
      `[map] Dropped ${rawSpots.length - spots.length} approved spot(s) with invalid coordinates`
    )
  }

  let isAdmin = false
  if (user?.user?.email) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.user.email)
      .single()
    isAdmin = !!adminUser
  }

  return (
    <HomeContent
      spots={spots}
      spotsLoadError={spotsLoadError}
      isAdmin={isAdmin}
      isAuthenticated={!!user?.user}
    />
  )
}
