import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookies = await getCookieHeader(req)
  const res = await backendFetch(`/admin/whatsapp/contacts/${id}`, {
    method: 'DELETE',
    forwardCookies: cookies,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
