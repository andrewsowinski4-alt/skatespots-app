import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile-completion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'
import CreateProfileForm from '@/components/create-profile-form'

export default async function CreateProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (isProfileComplete(profile)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Finish your profile</CardTitle>
          <CardDescription>
            Last step for SpotFinder: add your details so we can show your name on the map and
            profile. Fields marked{' '}
            <span className="font-semibold text-primary">*</span> are required; usernames must be
            unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}