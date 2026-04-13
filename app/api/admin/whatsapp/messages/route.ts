import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'
import { requirePermission } from '@/app/lib/require-permission'

export async function GET(req: NextRequest) {
  const allowed = await requirePermission(req, ['whatsapp:manage'])
  if (!allowed.ok) return allowed.response
  const cookies = await getCookieHeader(req)
  const qs = req.nextUrl.searchParams.toString()
  const res = await backendFetch(`/admin/whatsapp/messages?${qs}`, { forwardCookies: cookies })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
