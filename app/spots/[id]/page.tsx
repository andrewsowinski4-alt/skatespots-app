import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpotDetail } from '@/components/spot-detail'
import { PUBLIC_SPOT_STATUS } from '@/lib/queries/approved-spots'
import type { SkateSpot } from '@/lib/types'

interface SpotPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SpotPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: spot, error } = await supabase
    .from('skate_spots')
    .select('name, description')
    .eq('id', id)
    .eq('status', PUBLIC_SPOT_STATUS)
    .maybeSingle()

  if (error || !spot) {
    return { title: 'Spot' }
  }

  const name = typeof spot.name === 'string' && spot.name.trim() ? spot.name.trim() : 'Skate spot'
  const desc =
    typeof spot.description === 'string' && spot.description.trim()
      ? spot.description.trim().slice(0, 160)
      : 'Skate spot on SpotFinder'

  return {
    title: name,
    description: desc,
  }
}

export default async function SpotPage({ params }: SpotPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: spot, error: spotError } = await supabase
    .from('skate_spots')
    .select('*')
    .eq('id', id)
    .eq('status', PUBLIC_SPOT_STATUS)
    .maybeSingle()

  if (spotError) {
    console.error('Spot detail query failed:', spotError.message)
    notFound()
  }

  if (!spot) {
    notFound()
  }

  const lat = Number(spot.latitude)
  const lng = Number(spot.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('Spot detail: invalid coordinates for id', spot.id)
    notFound()
  }

  const { data: user } = await supabase.auth.getUser()
  
  let isAdmin = false
  if (user?.user?.email) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.user.email)
      .single()
    isAdmin = !!adminUser
  }

  const spotForUi: SkateSpot = {
    ...(spot as SkateSpot),
    latitude: lat,
    longitude: lng,
  }

  return (
    <SpotDetail spot={spotForUi} isAdmin={isAdmin} isAuthenticated={!!user?.user} />
  )
}
