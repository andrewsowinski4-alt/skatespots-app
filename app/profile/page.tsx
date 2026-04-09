import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileContent } from '@/components/profile-content'

export const metadata = {
  title: 'Profile - SpotFinder',
  description: 'Your SpotFinder profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  let isAdmin = false
  if (user.email) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single()
    isAdmin = !!adminUser
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's submitted spots count
  const { count: submittedCount } = await supabase
    .from('skate_spots')
    .select('*', { count: 'exact', head: true })
    .eq('submitted_by', user.id)

  const { count: approvedCount } = await supabase
    .from('skate_spots')
    .select('*', { count: 'exact', head: true })
    .eq('submitted_by', user.id)
    .eq('status', 'approved')

  return (
    <ProfileContent 
      user={{
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at || '',
        user_metadata: user.user_metadata as {
          location?: string
          years_skating?: number
          age?: number
          avatar_path?: string
        },
      }}
      profile={profile}
      stats={{
        submitted: submittedCount || 0,
        approved: approvedCount || 0,
      }}
      isAdmin={isAdmin}
    />
  )
}
