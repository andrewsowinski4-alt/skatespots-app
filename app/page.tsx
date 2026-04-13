import { createClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/home-content'
import type { SkateSpot } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()

  const { data: spots } = await supabase
    .from('skate_spots')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

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
      spots={(spots as SkateSpot[]) || []} 
      isAdmin={isAdmin} 
      isAuthenticated={!!user?.user}
    />
  )
}
