import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function POST(request: Request) {
  try {
    await backendFetch('/auth/logout', {
      method: 'POST',
      forwardCookies: await getCookieHeader(request),
    })
  } catch {
    // Mesmo que o backend falhe, limpamos o cookie no browser
  }

  const response = NextResponse.json({ status: 'ok' })
  response.cookies.set('session', '', { maxAge: 0, path: '/' })
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
  return response
}