import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpotDetail } from '@/components/spot-detail'
import type { SkateSpot } from '@/lib/types'

interface SpotPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SpotPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: spot } = await supabase
    .from('skate_spots')
    .select('name, description')
    .eq('id', id)
    .single()

  if (!spot) {
    return { title: 'Spot Not Found' }
  }

  return {
    title: `${spot.name} - SpotFinder`,
    description: spot.description,
  }
}

export default async function SpotPage({ params }: SpotPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: spot } = await supabase
    .from('skate_spots')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!spot) {
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

  return (
    <SpotDetail 
      spot={spot as SkateSpot} 
      isAdmin={isAdmin} 
      isAuthenticated={!!user?.user}
    />
  )
}
