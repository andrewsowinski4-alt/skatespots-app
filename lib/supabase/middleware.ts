import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { isProfileComplete } from '@/lib/profile-completion'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Get auth tokens from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  let user = null

  if (accessToken && refreshToken) {
    const { data } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    user = data?.user

    // If session was refreshed, update cookies
    if (data?.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }
  }

  // Protected routes check (must be logged in)
  if (
    (request.nextUrl.pathname.startsWith('/protected') ||
      request.nextUrl.pathname.startsWith('/submit') ||
      request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/profile')) &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  const pathname = request.nextUrl.pathname

  // Profile completion gate — see lib/profile-completion.ts and docs/profile-completion.md
  if (
    user &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth') &&
    pathname !== '/create-profile' &&
    !pathname.startsWith('/create-profile/')
  ) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile gate query failed:', profileError.message)
      return response
    }

    if (!isProfileComplete(profile)) {
      const url = request.nextUrl.clone()
      url.pathname = '/create-profile'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}
