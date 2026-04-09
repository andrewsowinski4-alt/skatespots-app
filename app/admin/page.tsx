import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin-dashboard'
import type { SkateSpot } from '@/lib/types'

export const metadata = {
  title: 'Admin Dashboard - SpotFinder',
  description: 'Manage submitted skate spots',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .single()

  if (!adminUser) {
    redirect('/')
  }

  // Fetch all spots for admin
  const { data: pendingSpots } = await supabase
    .from('skate_spots')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: allSpots } = await supabase
    .from('skate_spots')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminDashboard 
      pendingSpots={(pendingSpots as SkateSpot[]) || []} 
      allSpots={(allSpots as SkateSpot[]) || []}
    />
  )
}
