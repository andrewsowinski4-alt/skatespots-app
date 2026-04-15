'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const SpotMap = dynamic(
  () => import('@/components/spot-map').then((mod) => ({ default: mod.SpotMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    ),
  }
)
import { SpotCard } from '@/components/spot-card'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { List, X } from 'lucide-react'
import type { SkateSpot } from '@/lib/types'

interface HomeContentProps {
  spots: SkateSpot[]
  isAdmin: boolean
  isAuthenticated: boolean
}

export function HomeContent({ spots, isAdmin, isAuthenticated }: HomeContentProps) {
  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null)
  const [isListOpen, setIsListOpen] = useState(false)

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <SpotMap 
          spots={spots} 
          onSpotSelect={setSelectedSpot}
          selectedSpotId={selectedSpot?.id}
        />
      </div>

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-10 p-4 safe-area-pt">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-card/90 px-4 py-2 backdrop-blur-lg">
            <h1 className="text-lg font-bold text-foreground">SpotFinder</h1>
            <p className="text-xs text-muted-foreground">
              {spots.length} spots nearby
            </p>
          </div>
          
          <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="secondary" className="bg-card/90 backdrop-blur-lg">
                <List className="h-5 w-5" />
                <span className="sr-only">View list</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-border bg-background p-0 sm:max-w-md">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle>All Spots ({spots.length})</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="space-y-3 p-4">
                  {spots.length > 0 ? (
                    spots.map((spot) => (
                      <SpotCard key={spot.id} spot={spot} compact />
                    ))
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      No spots found. Be the first to submit one!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Selected Spot Preview */}
      {selectedSpot && (
        <div className="absolute bottom-20 left-4 right-4 z-10 safe-area-pb">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-2 right-2 z-10 h-8 w-8 rounded-full bg-card"
              onClick={() => setSelectedSpot(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close preview</span>
            </Button>
            <SpotCard spot={selectedSpot} />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </div>
  )
}
