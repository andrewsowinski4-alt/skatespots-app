'use client'

import Link from 'next/link'
import type { SkateSpot } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowUpRight, Navigation } from 'lucide-react'

interface SpotCardProps {
  spot: SkateSpot
  compact?: boolean
  isOSM?: boolean
}

// Get directions URL that works on both iOS and Android
function getDirectionsUrl(spot: SkateSpot): string {
  // Use address if available, otherwise use coordinates
  const destination = spot.address 
    ? encodeURIComponent(spot.address)
    : `${spot.latitude},${spot.longitude}`
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
}

// Get the image URL if available
function getImageUrl(spot: SkateSpot): string | null {
  if (spot.photo_url) {
    if (spot.photo_url.startsWith('http')) {
      return spot.photo_url
    }
    return `/api/file?pathname=${encodeURIComponent(spot.photo_url)}`
  }
  
  if (spot.photo_urls && spot.photo_urls.length > 0) {
    const firstPhoto = spot.photo_urls[0]
    if (firstPhoto.startsWith('http')) {
      return firstPhoto
    }
    return `/api/file?pathname=${encodeURIComponent(firstPhoto)}`
  }
  
  return null
}

export function SpotCard({ spot, compact = false, isOSM = false }: SpotCardProps) {
  const difficultyColor = {
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-yellow-500/20 text-yellow-400',
    advanced: 'bg-orange-500/20 text-orange-400',
    expert: 'bg-red-500/20 text-red-400',
    all: 'bg-blue-500/20 text-blue-400',
  }[spot.difficulty] || 'bg-muted text-muted-foreground'

  const imageUrl = getImageUrl(spot)
  const directionsUrl = getDirectionsUrl(spot)

  if (compact) {
    return (
      <Card className="group border-border bg-card/80 backdrop-blur-sm transition-colors hover:bg-card">
        <CardContent className="flex items-center gap-3 p-3">
          <Link
            href={`/spots/${spot.id}`}
            className="flex min-w-0 flex-1 touch-manipulation items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:opacity-90"
          >
            {imageUrl ? (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium text-foreground">{spot.name}</h3>
                {isOSM && (
                  <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
                    OSM
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {spot.address || spot.spot_type}
              </p>
            </div>
          </Link>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 touch-manipulation active:scale-95"
            aria-label="Get directions"
          >
            <Navigation className="h-5 w-5" />
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
      <div className="relative aspect-video overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={spot.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPin className="h-16 w-16 text-primary/50" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {spot.spot_type}
          </Badge>
          {!isOSM && spot.difficulty && (
            <Badge className={`${difficultyColor} backdrop-blur-sm`}>
              {spot.difficulty}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{spot.name}</h3>
            {spot.address && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{spot.address}</span>
              </p>
            )}
          </div>
          {!isOSM && (
            <Link href={`/spots/${spot.id}`}>
              <Button size="sm" variant="ghost" className="min-h-10 shrink-0 touch-manipulation">
                Details
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {spot.description}
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block"
        >
          <Button className="w-full min-h-11 touch-manipulation" size="sm">
            <Navigation className="mr-2 h-4 w-4" />
            Get Directions
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}
