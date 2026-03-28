import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function POST(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const body = await req.text()
  const res = await backendFetch('/admin/whatsapp/messages/send-template', {
    method: 'POST',
    body,
    forwardCookies: cookies,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
