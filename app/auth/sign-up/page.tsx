'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Loader2, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [yearsSkating, setYearsSkating] = useState('')
  const [age, setAge] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!displayName || !location || !yearsSkating || !age) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    // Upload avatar if provided
    let avatarPath = ''
    if (avatarFile) {
      try {
        const formData = new FormData()
        formData.append('file', avatarFile)
        formData.append('folder', 'avatars')
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload profile picture')
        }
        
        const uploadData = await uploadRes.json()
        avatarPath = uploadData.pathname
      } catch {
        toast.error('Failed to upload profile picture')
        setIsLoading(false)
        return
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName,
          location,
          years_skating: parseInt(yearsSkating),
          age: parseInt(age),
          avatar_path: avatarPath,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Join SpotFinder</CardTitle>
          <CardDescription>Create your skater profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-2">
              <Label className="text-sm text-muted-foreground">Profile Picture (optional)</Label>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-muted-foreground">Tap to upload</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="SkaterMike"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Toronto, ON"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="bg-secondary pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Select value={age} onValueChange={setAge} required>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 63 }, (_, i) => i + 13).map((a) => (
                      <SelectItem key={a} value={a.toString()}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsSkating">Years Skating *</Label>
                <Select value={yearsSkating} onValueChange={setYearsSkating} required>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{'< 1 year'}</SelectItem>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y} {y === 1 ? 'year' : 'years'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
