'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowLeft, Upload, X, MapPin, Loader2, CheckCircle, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface SubmitSpotFormProps {
  isAdmin: boolean
  isAuthenticated: boolean
}

export function SubmitSpotForm({ isAdmin, isAuthenticated }: SubmitSpotFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoPathname, setPhotoPathname] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [manualCoordsOpen, setManualCoordsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    spot_type: '',
    difficulty: '',
  })

  const latParsed = parseFloat(formData.latitude)
  const lngParsed = parseFloat(formData.longitude)
  const hasValidCoords = !Number.isNaN(latParsed) && !Number.isNaN(lngParsed)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(
          typeof data.error === 'string' ? data.error : `Upload failed (${res.status})`
        )
      }

      const { pathname } = await res.json()
      setPhotoPathname(pathname)
      toast.success('Photo uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo')
      setPhotoPreview(null)
      setPhotoPathname(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoPathname(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }))
        setIsGettingLocation(false)
        toast.success('Location captured')
      },
      (error) => {
        setIsGettingLocation(false)
        toast.error(
          'Unable to get your location. Open “Enter coordinates manually” below if you need to type them.'
        )
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.spot_type) {
      toast.error('Select a spot type')
      return
    }
    if (!formData.difficulty) {
      toast.error('Select a difficulty')
      return
    }

    const lat = latParsed
    const lng = lngParsed
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Set a location using the button below or enter coordinates manually.')
      return
    }

    if (!photoPathname?.trim()) {
      toast.error('Add a photo of the spot before submitting.')
      return
    }
    if (isUploading) {
      toast.error('Wait for the photo to finish uploading.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          latitude: lat,
          longitude: lng,
          address: formData.address.trim(),
          spot_type: formData.spot_type,
          difficulty: formData.difficulty,
          photo_url: photoPathname,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        details?: { path: string; message: string }[]
      }

      if (!res.ok) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : data.details?.[0]?.message ?? `Could not submit (${res.status})`
        throw new Error(msg)
      }

      setSubmitted(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit spot')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 pb-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Spot Submitted!</h1>
          <p className="mt-2 text-muted-foreground">
            Your spot has been submitted for review. Once approved, it will appear on the map.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="min-h-11 touch-manipulation">
              <Link href="/">Back to Map</Link>
            </Button>
            <Button variant="outline" className="min-h-11 touch-manipulation" onClick={() => {
              setSubmitted(false)
              setManualCoordsOpen(false)
              setFormData({
                name: '',
                description: '',
                latitude: '',
                longitude: '',
                address: '',
                spot_type: '',
                difficulty: '',
              })
              setPhotoPreview(null)
              setPhotoPathname(null)
            }}>
              Submit Another
            </Button>
          </div>
        </div>
        <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-lg safe-area-pt">
        <div className="flex items-center gap-3">
          <Button asChild size="icon" variant="ghost">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Submit a Spot</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg p-4">
        {/* Photo Upload (required) */}
        <div className="mb-6">
          <Label className="mb-2 block">Photo (required)</Label>
          {photoPreview ? (
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-10 w-10 touch-manipulation"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
              {isUploading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                  <span className="text-sm font-medium text-foreground">Uploading…</span>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video w-full touch-manipulation flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 transition-colors hover:border-primary/50 hover:bg-secondary active:bg-secondary/80"
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to upload a photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Spot Name */}
        <div className="mb-4">
          <Label htmlFor="name">Spot Name</Label>
          <Input
            id="name"
            placeholder="e.g., Downtown Ledges"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mt-1 bg-secondary"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the spot, features, best times to skate..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="mt-1 bg-secondary"
          />
        </div>

        {/* Location — primary: geolocation; manual coords in Advanced */}
        <div className="mb-4">
          <Label>Location</Label>
          <Button
            type="button"
            className="mt-1 min-h-11 w-full touch-manipulation"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            Use current location
          </Button>

          {hasValidCoords && !manualCoordsOpen ? (
            <div
              className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3"
              role="status"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Location set</p>
                <p className="text-xs text-muted-foreground">
                  Your spot will be pinned at this GPS position. Use the button above to update it, or enter
                  coordinates manually if needed.
                </p>
              </div>
            </div>
          ) : null}

          <Collapsible open={manualCoordsOpen} onOpenChange={setManualCoordsOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex min-h-11 w-full touch-manipulation items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary/50"
              >
                Enter coordinates manually
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${manualCoordsOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 data-[state=closed]:animate-none">
              <p className="text-xs text-muted-foreground">
                Use decimal degrees (e.g. from maps). Required if location access is blocked.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="latitude" className="text-xs">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    type="number"
                    step="any"
                    className="mt-1 bg-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-xs">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    type="number"
                    step="any"
                    className="mt-1 bg-secondary"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Address */}
        <div className="mb-4">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street address or landmark"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            className="mt-1 bg-secondary"
          />
        </div>

        {/* Spot Type */}
        <div className="mb-4">
          <Label>Spot Type</Label>
          <Select value={formData.spot_type} onValueChange={(v) => setFormData({ ...formData, spot_type: v })}>
            <SelectTrigger className="mt-1 bg-secondary">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="park">Park</SelectItem>
              <SelectItem value="plaza">Plaza</SelectItem>
              <SelectItem value="diy">DIY</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <Label>Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
            <SelectTrigger className="mt-1 bg-secondary">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="min-h-12 w-full touch-manipulation"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Spot'
          )}
        </Button>
      </form>

      <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </div>
  )
}
