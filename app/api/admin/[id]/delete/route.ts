import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const res = await backendFetch(`/admin/agendamento/${id}/deletar`, {
      method: 'DELETE',
      forwardCookies: await getCookieHeader(request),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao excluir' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'erro', mensagem: 'Falha na comunicação com o servidor.' },
      { status: 500 }
    )
  }
}