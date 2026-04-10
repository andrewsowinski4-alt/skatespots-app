'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/create-profile')
    }, 1700)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <MapPin className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to SpotFinder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is ready. Let&apos;s set up your profile.
        </p>
      </div>
    </main>
  )
}
