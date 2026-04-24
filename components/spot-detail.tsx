'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowLeft, MapPin, Navigation, Share2 } from 'lucide-react'
import type { SkateSpot } from '@/lib/types'
import { toast } from 'sonner'

interface SpotDetailProps {
  spot: SkateSpot
  isAdmin: boolean
  isAuthenticated: boolean
}

function formatLabel(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function SpotDetail({ spot, isAdmin, isAuthenticated }: SpotDetailProps) {
  const displayName =
    typeof spot.name === 'string' && spot.name.trim() ? spot.name.trim() : 'Unnamed spot'
  const descriptionText =
    typeof spot.description === 'string' && spot.description.trim() ? spot.description.trim() : ''
  const addressText =
    typeof spot.address === 'string' && spot.address.trim() ? spot.address.trim() : ''
  const spotTypeRaw =
    typeof spot.spot_type === 'string' && spot.spot_type.trim() ? spot.spot_type.trim() : 'Spot'
  const spotTypeLabel = formatLabel(spotTypeRaw)
  const difficultyRaw = typeof spot.difficulty === 'string' ? spot.difficulty.trim() : ''
  const difficultyLabel = difficultyRaw ? formatLabel(difficultyRaw) : ''
  const hasPhoto = Boolean(spot.photo_url && String(spot.photo_url).trim())

  const lat = Number(spot.latitude)
  const lng = Number(spot.longitude)
  const coordsOk = Number.isFinite(lat) && Number.isFinite(lng)

  const difficultyColor = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    expert: 'bg-red-500/20 text-red-400 border-red-500/30',
  }[difficultyRaw.toLowerCase()] || 'bg-muted text-muted-foreground'

  const createdAt = spot.created_at ? new Date(spot.created_at) : null
  const createdLabel =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: descriptionText || displayName,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handleDirections = () => {
    if (!coordsOk) {
      toast.error('Directions unavailable for this spot.')
      return
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero / media */}
      <div className="relative aspect-[4/3] w-full sm:aspect-[21/9] sm:max-h-[min(40vh,320px)]">
        {hasPhoto ? (
          <img
            src={`/api/file?pathname=${encodeURIComponent(String(spot.photo_url))}`}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/60">
            <MapPin className="h-14 w-14 text-muted-foreground/80" aria-hidden />
            <span className="text-sm font-medium text-muted-foreground">No photo</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute left-3 top-3 safe-area-pt sm:left-4 sm:top-4">
          <Button
            asChild
            size="icon"
            variant="secondary"
            className="h-11 w-11 touch-manipulation bg-card/90 shadow-sm backdrop-blur-sm"
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to map</span>
            </Link>
          </Button>
        </div>

        <div className="absolute right-3 top-3 safe-area-pt sm:right-4 sm:top-4">
          <Button
            size="icon"
            variant="secondary"
            className="h-11 w-11 touch-manipulation bg-card/90 shadow-sm backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share this spot</span>
          </Button>
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-2xl border-x border-t border-border/60 bg-background px-4 pt-7 shadow-sm sm:-mt-8 sm:rounded-t-3xl sm:pt-10">
        <div className="mx-auto max-w-2xl space-y-7 pb-4 sm:space-y-8 sm:pb-2">
          <header className="space-y-3">
            <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-start gap-x-2 gap-y-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 font-medium text-primary">
                {spotTypeLabel}
              </Badge>
              {difficultyLabel ? (
                <Badge variant="outline" className={`font-medium capitalize ${difficultyColor}`}>
                  {difficultyLabel}
                </Badge>
              ) : (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  Difficulty not set
                </Badge>
              )}
            </div>

            <div className="flex gap-2 text-base leading-snug text-muted-foreground">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary/70" aria-hidden />
              <div>
                <span className="sr-only">Location: </span>
                {addressText ? (
                  <span className="text-foreground/90">{addressText}</span>
                ) : (
                  <span className="italic text-muted-foreground">Location not specified</span>
                )}
              </div>
            </div>
          </header>

          <div>
            <Button
              className="h-12 w-full touch-manipulation text-base shadow-sm"
              onClick={handleDirections}
              disabled={!coordsOk}
            >
              <Navigation className="mr-2 h-5 w-5" />
              Open in Maps
            </Button>
            {!coordsOk ? (
              <p className="mt-2 text-center text-xs text-muted-foreground">Directions need valid map coordinates.</p>
            ) : null}
          </div>

          <section className="border-t border-border pt-8" aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              About
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {descriptionText || (
                <span className="text-muted-foreground italic">
                  No one has added a description yet—check the pin on the map or visit in person.
                </span>
              )}
            </p>
          </section>

          {coordsOk ? (
            <section aria-labelledby="coords-heading">
              <h2
                id="coords-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Coordinates
              </h2>
              <p className="sr-only">Latitude and longitude in decimal degrees</p>
              <div className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-3 font-mono text-sm text-muted-foreground">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </section>
          ) : null}

          {createdLabel ? (
            <footer className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                Listed on SpotFinder{' '}
                <time dateTime={spot.created_at}>{createdLabel}</time>
              </p>
            </footer>
          ) : null}
        </div>
      </div>

      <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </div>
  )
}
