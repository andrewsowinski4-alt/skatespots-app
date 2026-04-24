'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SpotCard } from '@/components/spot-card'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, List, Loader2, MapPin, X } from 'lucide-react'
import type { SkateSpot } from '@/lib/types'

const SpotMap = dynamic(
  () => import('@/components/spot-map').then((mod) => ({ default: mod.SpotMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    ),
  }
)

/** Spots from `app/page.tsx` (Supabase + normalization). `spotsLoadError` set when the query fails. */
interface HomeContentProps {
  spots: SkateSpot[]
  spotsLoadError: string | null
  isAdmin: boolean
  isAuthenticated: boolean
}

export function HomeContent({
  spots,
  spotsLoadError,
  isAdmin,
  isAuthenticated,
}: HomeContentProps) {
  const router = useRouter()
  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null)
  const [isListOpen, setIsListOpen] = useState(false)

  const hasError = Boolean(spotsLoadError)
  const isEmpty = !hasError && spots.length === 0

  const headerSubtitle = hasError
    ? 'Spots unavailable'
    : `${spots.length} spot${spots.length === 1 ? '' : 's'} nearby`

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map stack: error replaces map; otherwise map + optional empty overlay */}
      <div className="absolute inset-0">
        {hasError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background p-6">
            <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
                <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-foreground">Couldn&apos;t load spots</p>
                <p className="mt-2 text-sm text-muted-foreground">{spotsLoadError}</p>
              </div>
              <Button type="button" onClick={() => router.refresh()} className="w-full max-w-xs">
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <SpotMap
              spots={spots}
              onSpotSelect={setSelectedSpot}
              selectedSpotId={selectedSpot?.id}
            />
            {isEmpty && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-24 top-28 z-[5] flex items-center justify-center p-4"
                role="status"
                aria-live="polite"
              >
                <div className="pointer-events-auto max-w-sm rounded-xl border border-border bg-card/95 px-5 py-4 text-center shadow-lg backdrop-blur-md">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="font-medium text-foreground">No spots yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Approved spots will appear here. Be the first to add one from Submit.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-10 p-4 safe-area-pt">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-card/90 px-4 py-2 backdrop-blur-lg">
            <h1 className="text-lg font-bold text-foreground">SpotFinder</h1>
            <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
          </div>

          <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-11 w-11 min-h-11 min-w-11 touch-manipulation bg-card/90 backdrop-blur-lg"
                disabled={hasError}
                aria-disabled={hasError}
              >
                <List className="h-5 w-5" />
                <span className="sr-only">View list</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-border bg-background p-0 sm:max-w-md">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle>
                  {hasError ? 'Spots unavailable' : `All Spots (${spots.length})`}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="space-y-3 p-4">
                  {hasError ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {spotsLoadError}
                    </p>
                  ) : spots.length > 0 ? (
                    spots.map((spot) => <SpotCard key={spot.id} spot={spot} compact />)
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

      {selectedSpot && !hasError && (
        <div className="absolute bottom-20 left-4 right-4 z-10 safe-area-pb">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-2 right-2 z-10 h-10 w-10 min-h-10 min-w-10 touch-manipulation rounded-full bg-card shadow-sm"
              onClick={() => setSelectedSpot(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close preview</span>
            </Button>
            <SpotCard spot={selectedSpot} />
          </div>
        </div>
      )}

      <BottomNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </div>
  )
}
