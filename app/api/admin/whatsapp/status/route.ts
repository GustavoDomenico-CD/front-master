import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function GET(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const res = await backendFetch('/admin/whatsapp/status', { forwardCookies: cookies })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
