import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive">
            <AlertCircle className="h-6 w-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Couldn&apos;t sign you in</CardTitle>
          <CardDescription>
            SpotFinder hit a problem during sign-in. Try again, or go home and start over.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
