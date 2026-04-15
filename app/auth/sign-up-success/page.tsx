import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Account created</CardTitle>
          <CardDescription>
            If SpotFinder sent a confirmation email, open the link first. Then sign in to finish
            your profile and start exploring.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Sign in to SpotFinder</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
