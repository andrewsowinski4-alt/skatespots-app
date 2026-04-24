import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmitSpotForm } from '@/components/submit-spot-form'

export const metadata = {
  title: 'Submit a spot',
  description: 'Share a new skate spot with the community',
}

export default async function SubmitPage() {
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

  return <SubmitSpotForm isAdmin={isAdmin} isAuthenticated={true} />
}
