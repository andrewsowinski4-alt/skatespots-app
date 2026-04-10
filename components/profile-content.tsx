'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowLeft, LogOut, MapPin, CheckCircle, Shield, Camera, Pencil, X, Save, Calendar, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  display_name: string | null
  location: string | null
  years_skating: number | null
  age: number | null
  bio: string | null
  avatar_url: string | null
}

interface ProfileContentProps {
  user: {
    id: string
    email: string
    createdAt: string
    user_metadata?: {
      display_name?: string
      location?: string
      years_skating?: number
      age?: number
      avatar_path?: string
      bio?: string
 
    }
  }
  profile: Profile | null
  stats: {
    submitted: number
    approved: number
  }
  isAdmin: boolean
}

// Prefer fields from profile table, with fallback as last resort
export function ProfileContent({ user, profile, stats, isAdmin }: ProfileContentProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Prefer profile as single source of truth, fall back to user_metadata only for *display* if profile is completely missing, and finally to email
  const displayName = profile?.display_name 
    ?? user.user_metadata?.display_name 
    ?? user.email.split('@')[0]
  const displayLocation = profile?.location 
    ?? user.user_metadata?.location 
    ?? ''
  const displayYearsSkating = profile?.years_skating 
    ?? user.user_metadata?.years_skating 
    ?? null
  const displayAge = profile?.age
    ?? user.user_metadata?.age 
    ?? null
  const displayBio = profile?.bio 
    ?? user.user_metadata?.bio 
    ?? ''
  // avatar_url from profile is authoritative; only fallback to null (ignore user_metadata.avatar_path)
  const displayAvatar = profile?.avatar_url || null

  // Edit form state (should always use profile as source of truth here)
  const [editName, setEditName] = useState(profile?.display_name ?? user.email.split('@')[0])
  const [location, setLocation] = useState(profile?.location ?? '')
  const [yearsSkating, setYearsSkating] = useState(
    profile?.years_skating !== null && profile?.years_skating !== undefined
      ? profile.years_skating.toString()
      : ''
  )
  const [age, setAge] = useState(
    profile?.age !== null && profile?.age !== undefined
      ? profile.age.toString()
      : ''
  )
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  const handleSave = async () => {
    // Validation for required fields
    if (
      !editName ||
      editName.trim() === '' ||
      !location ||
      location.trim() === '' ||
      age === '' ||
      yearsSkating === ''
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      let avatarUrl = displayAvatar

      // Upload new avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        formData.append('folder', 'avatars')
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.pathname
        } else {
          toast.error('Failed to upload profile picture')
          setIsSaving(false)
          return
        }
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: editName,
          location,
          years_skating: yearsSkating ? parseInt(yearsSkating) : null,
          age: age ? parseInt(age) : null,
          bio: bio || null,
          avatar_url: avatarUrl,
        }),
      })

      if (res.ok) {
        toast.success('Profile updated')
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
        router.refresh()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset edit fields to profile (not user_metadata!)
    setEditName(profile?.display_name ?? user.email.split('@')[0])
    setLocation(profile?.location ?? '')
    setYearsSkating(
      profile?.years_skating !== null && profile?.years_skating !== undefined
        ? profile.years_skating.toString()
        : ''
    )
    setAge(
      profile?.age !== null && profile?.age !== undefined
        ? profile.age.toString()
        : ''
    )
    setBio(profile?.bio ?? '')
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview
    if (displayAvatar) return `/api/file?pathname=${encodeURIComponent(displayAvatar)}`
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-lg safe-area-pt">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild size="icon" variant="ghost">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-lg p-4">
        {/* User Info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary overflow-hidden">
                  {getAvatarSrc() ? (
                    <img src={getAvatarSrc()!} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary-foreground">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                      <Camera className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg">{displayName}</CardTitle>
                {displayLocation && !isEditing && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {displayLocation}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                {isAdmin && (
                  <div className="mt-1 flex items-center gap-1 text-primary">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs font-medium">Admin</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Form or Stats Display */}
        {isEditing ? (
          <Card className="mt-4 border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name or username"
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Toronto, ON"
                    className="bg-secondary pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Select value={age} onValueChange={setAge}>
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
                  <Label htmlFor="yearsSkating">Years Skating</Label>
                  <Select value={yearsSkating} onValueChange={setYearsSkating}>
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

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="bg-secondary min-h-[80px]"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Details */}
            <Card className="mt-4 border-border bg-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-semibold">{displayAge ?? 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Years Skating</p>
                      <p className="font-semibold">
                        {displayYearsSkating !== null 
                          ? displayYearsSkating === 0 
                            ? '< 1 year' 
                            : `${displayYearsSkating} ${displayYearsSkating === 1 ? 'year' : 'years'}`
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                {displayBio && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{displayBio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
                  <p className="text-xs text-muted-foreground">Spots Submitted</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">Spots Approved</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <Link href="/submit">Submit a New Spot</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>

      <BottomNav isAdmin={isAdmin} isAuthenticated={true} />
    </div>
  )
}
