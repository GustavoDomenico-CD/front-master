import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function POST(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const res = await backendFetch('/admin/whatsapp/reset-session', {
    method: 'POST',
    forwardCookies: cookies,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

