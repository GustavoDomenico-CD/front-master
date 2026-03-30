import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function GET(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const res = await backendFetch('/users', { forwardCookies: cookies })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const cookies = await getCookieHeader(req)
  const body = await req.text()
  const res = await backendFetch('/users', {
    method: 'POST',
    body,
    forwardCookies: cookies,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

