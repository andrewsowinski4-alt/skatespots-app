import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function SpotNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 pb-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Spot not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This spot doesn&apos;t exist or isn&apos;t available. Only approved spots are shown.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to map</Link>
      </Button>
    </div>
  )
}
