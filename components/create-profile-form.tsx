'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CreateProfileForm() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [yearsSkating, setYearsSkating] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          display_name: displayName.trim(),
          location,
          age: ageNum,
          years_skating: yearsNum,
          bio: bio.trim(),
        }),
      })

      if (res.ok) {
        router.push('/')
      } else {
        let message = 'Failed to save profile.'
        try {
          const data = await res.json()
          if (data?.error) message = data.error
          else if (res.status === 409)
            message = 'That username is already taken. Try another.'
        } catch {
          if (res.status === 409)
            message = 'That username is already taken. Try another.'
        }
        toast.error(message)
      }
    } catch (err) {
      toast.error('Failed to save profile.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
        />
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}