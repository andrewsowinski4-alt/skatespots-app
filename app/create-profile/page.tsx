'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'

export default function CreateProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [yearsSkating, setYearsSkating] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Require logged in user, redirect if not
  // We do this on client because 'use client'
  // but we can only check on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login')
      }
    })
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Required fields validation
    if (!displayName.trim() || !location.trim() || !age || !yearsSkating) {
      toast.error('Please fill all required fields.')
      return
    }
    const ageValue = Number(age)
    const yearsValue = Number(yearsSkating)
    if (
      isNaN(ageValue) ||
      isNaN(yearsValue) ||
      ageValue <= 0 ||
      yearsValue < 0
    ) {
      toast.error('Age and years skating must be valid numbers.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          location: location.trim(),
          age: ageValue,
          years_skating: yearsValue,
          bio: bio.trim(),
        }),
      })

      if (res.ok) {
        router.replace('/')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.message || 'Failed to save profile.')
      }
    } catch {
      toast.error('Failed to save profile.')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Profile</CardTitle>
          <CardDescription>
            Complete your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsSkating">Years Skating *</Label>
                <Input
                  id="yearsSkating"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={yearsSkating}
                  onChange={e => setYearsSkating(e.target.value)}
                  required
                  className="bg-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself (optional)"
                className="bg-secondary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}