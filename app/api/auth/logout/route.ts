import { NextResponse } from 'next/server'

const cookiePath = { path: '/' as const }

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Must match path/flags used when setting cookies (login/callback/middleware) or browsers may keep the old cookie.
  response.cookies.delete('sb-access-token', cookiePath)
  response.cookies.delete('sb-refresh-token', cookiePath)

  return response
}
