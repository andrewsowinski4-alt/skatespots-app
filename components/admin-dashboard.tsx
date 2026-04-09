'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BottomNav } from '@/components/bottom-nav'
import { ArrowLeft, Check, X, MapPin, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { SkateSpot } from '@/lib/types'
import { toast } from 'sonner'

interface AdminDashboardProps {
  pendingSpots: SkateSpot[]
  allSpots: SkateSpot[]
}

export function AdminDashboard({ pendingSpots: initialPending, allSpots: initialAll }: AdminDashboardProps) {
  const router = useRouter()
  const [pendingSpots, setPendingSpots] = useState(initialPending)
  const [allSpots, setAllSpots] = useState(initialAll)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (spotId: string, action: 'approved' | 'rejected') => {
    setLoadingId(spotId)
    try {
      const res = await fetch(`/api/admin/spots/${spotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (!res.ok) {
        throw new Error('Failed to update spot')
      }

      // Update local state
      setPendingSpots((prev) => prev.filter((s) => s.id !== spotId))
      setAllSpots((prev) => 
        prev.map((s) => (s.id === spotId ? { ...s, status: action } : s))
      )

      toast.success(`Spot ${action}`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update spot')
    } finally {
      setLoadingId(null)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
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
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">{pendingSpots.length} pending review</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="pending" className="flex-1">
              Pending ({pendingSpots.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All Spots ({allSpots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSpots.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-3 h-12 w-12 text-primary/50" />
                  <p className="text-muted-foreground">No spots pending review</p>
                </CardContent>
              </Card>
            ) : (
              pendingSpots.map((spot) => (
                <Card key={spot.id} className="overflow-hidden border-border bg-card">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative aspect-video w-full shrink-0 sm:aspect-square sm:w-40">
                      {spot.photo_url ? (
                        <img
                          src={`/api/file?pathname=${encodeURIComponent(spot.photo_url)}`}
                          alt={spot.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {spot.spot_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {spot.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{spot.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {spot.description}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {spot.address}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Submitted {new Date(spot.created_at).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAction(spot.id, 'approved')}
                          disabled={loadingId === spot.id}
                        >
                          {loadingId === spot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleAction(spot.id, 'rejected')}
                          disabled={loadingId === spot.id}
                        >
                          {loadingId === spot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {allSpots.map((spot) => (
              <Card key={spot.id} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    {spot.photo_url ? (
                      <img
                        src={`/api/file?pathname=${encodeURIComponent(spot.photo_url)}`}
                        alt={spot.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {statusIcon(spot.status)}
                      <h3 className="truncate font-medium text-foreground">{spot.name}</h3>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{spot.address}</p>
                  </div>

                  {/* Status Badge */}
                  <Badge variant="outline" className={statusColor(spot.status)}>
                    {spot.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav isAdmin={true} isAuthenticated={true} />
    </div>
  )
}
