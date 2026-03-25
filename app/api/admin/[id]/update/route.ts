import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const body = await request.json()

    const res = await backendFetch(`/admin/agendamento/${id}/atualizar`, {
      method: 'PUT',
      body: JSON.stringify(body),
      forwardCookies: await getCookieHeader(request),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', message: data?.message ?? 'Erro ao atualizar' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'erro', message: 'Falha na comunicação com o servidor.' },
      { status: 500 }
    )
  }
}