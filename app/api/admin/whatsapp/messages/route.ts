import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function GET(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const qs = req.nextUrl.searchParams.toString()
  const res = await backendFetch(`/admin/whatsapp/messages?${qs}`, { forwardCookies: cookies })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
