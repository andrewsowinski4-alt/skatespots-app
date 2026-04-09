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

export function SpotDetail({ spot, isAdmin, isAuthenticated }: SpotDetailProps) {
  const difficultyColor = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    expert: 'bg-red-500/20 text-red-400 border-red-500/30',
  }[spot.difficulty] || 'bg-muted text-muted-foreground'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: spot.name,
          text: spot.description,
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
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image */}
      <div className="relative aspect-[4/3] w-full">
        {spot.photo_url ? (
          <img
            src={`/api/file?pathname=${encodeURIComponent(spot.photo_url)}`}
            alt={spot.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <MapPin className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Back button */}
        <div className="absolute left-4 top-4 safe-area-pt">
          <Button asChild size="icon" variant="secondary" className="bg-card/80 backdrop-blur-sm">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
        </div>

        {/* Share button */}
        <div className="absolute right-4 top-4 safe-area-pt">
          <Button size="icon" variant="secondary" className="bg-card/80 backdrop-blur-sm" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share spot</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-8 rounded-t-3xl bg-background px-4 pt-6">
        <div className="mx-auto max-w-2xl">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
              {spot.spot_type}
            </Badge>
            <Badge variant="outline" className={difficultyColor}>
              {spot.difficulty}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">{spot.name}</h1>
          
          {/* Address */}
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {spot.address}
          </p>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About this spot
            </h2>
            <p className="mt-2 leading-relaxed text-foreground">
              {spot.description}
            </p>
          </div>

          {/* Coordinates */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Coordinates
            </h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button className="flex-1" onClick={handleDirections}>
              <Navigation className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
          </div>

          {/* Metadata */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Added {new Date(spot.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </div>
  )
}
