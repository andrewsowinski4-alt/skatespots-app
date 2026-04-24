import { Loader2 } from 'lucide-react'

/** Shown while a route segment resolves (e.g. first paint of `/` before RSC data). */
export default function RootLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}
