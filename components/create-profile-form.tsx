'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Camera, User } from 'lucide-react'

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export default function CreateProfileForm() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [yearsSkating, setYearsSkating] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarPathname, setAvatarPathname] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const fallbackInitial = useMemo(() => {
    const s = (displayName.trim() || username.trim() || '?').charAt(0)
    return s.toUpperCase()
  }, [displayName, username])

  const USERNAME_TAKEN =
    'That username is already taken. Pick a different username and try again.'

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) {
      toast.error('Please choose a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image is too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; pathname?: string }

      if (!res.ok) {
        setAvatarPreview(null)
        setAvatarPathname(null)
        toast.error(data.error || `Could not upload photo (${res.status}). Try again.`)
        return
      }

      if (!data.pathname) {
        setAvatarPreview(null)
        setAvatarPathname(null)
        toast.error('Upload did not return a file path. Try again.')
        return
      }

      setAvatarPathname(data.pathname)
      toast.success('Photo uploaded')
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setAvatarPreview(null)
      setAvatarPathname(null)
      toast.error('Network error while uploading. Check your connection and try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const clearAvatar = () => {
    setAvatarPreview(null)
    setAvatarPathname(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate required fields
    if (
      !username.trim() ||
      !displayName.trim() ||
      !location.trim() ||
      !age.toString().trim() ||
      !yearsSkating.toString().trim()
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate age and yearsSkating are numbers
    const ageNum = parseInt(age, 10)
    const yearsNum = parseInt(yearsSkating, 10)
    if (
      isNaN(ageNum) || ageNum <= 0 ||
      isNaN(yearsNum) || yearsNum < 0
    ) {
      toast.error('Please enter valid numbers for Age and Years Skating')
      return
    }

    setIsLoading(true)
    try {
      const body: Record<string, unknown> = {
        username: username.trim(),
        display_name: displayName.trim(),
        location: location.trim(),
        age: ageNum,
        years_skating: yearsNum,
        bio: bio.trim(),
      }
      if (avatarPathname) {
        body.avatar_url = avatarPathname
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const bodyText = await res.text()

      if (res.ok) {
        toast.success('Profile saved!')
        router.replace('/')
        router.refresh()
      } else {
        let message = `Could not save profile (${res.status}).`
        try {
          const data = bodyText ? JSON.parse(bodyText) : null
          if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
            message = (data as { error: string }).error
          } else if (res.status === 409) {
            message = USERNAME_TAKEN
          }
        } catch {
          if (res.status === 409) {
            message = USERNAME_TAKEN
          } else if (bodyText) {
            message = bodyText.slice(0, 200)
          }
        }
        toast.error(message)
        if (res.status === 409) {
          document.getElementById('username')?.focus()
        }
      }
    } catch (err) {
      console.error("Create profile submit failed:", err)
      toast.error("Network error. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {/* Avatar (optional) */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-foreground">Profile photo</span>
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                {fallbackInitial === '?' ? (
                  <User className="h-10 w-10 opacity-60" aria-hidden />
                ) : (
                  fallbackInitial
                )}
              </span>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose profile photo"
            onChange={handleAvatarPick}
            disabled={isUploadingAvatar || isLoading}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploadingAvatar || isLoading}
            onClick={() => avatarInputRef.current?.click()}
          >
            <Camera className="mr-1.5 h-4 w-4" aria-hidden />
            {isUploadingAvatar
              ? 'Uploading…'
              : avatarPathname
                ? 'Change photo'
                : 'Add photo'}
          </Button>
          {avatarPathname && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploadingAvatar || isLoading}
              onClick={clearAvatar}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Optional. JPEG, PNG, or WebP, up to 5MB.
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          type="text"
          placeholder="your_handle"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="bg-secondary"
          autoFocus
          autoComplete="username"
          aria-describedby="username-hint"
        />
        <p id="username-hint" className="text-xs text-muted-foreground">
          Must be unique. Letters, numbers, and underscores work well.
        </p>
      </div>
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your Name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          className="bg-secondary"
        />
      </div>
      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          type="text"
          placeholder="City, State"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          className="bg-secondary"
        />
      </div>
      {/* Age and Years Skating Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            placeholder="e.g. 18"
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
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="e.g. 2"
            value={yearsSkating}
            onChange={e => setYearsSkating(e.target.value)}
            required
            className="bg-secondary"
          />
        </div>
      </div>
      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Input
          id="bio"
          type="text"
          placeholder="A little about you (optional)"
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="bg-secondary"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || isUploadingAvatar}
      >
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}