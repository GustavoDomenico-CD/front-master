import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

/** Proxy para POST /admin/agendamento/chatbot/search (backend-edge-main). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const res = await backendFetch('/admin/agendamento/chatbot/search', {
      method: 'POST',
      body: JSON.stringify(body),
      forwardCookies: await getCookieHeader(request),
    })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro na busca do chatbot' },
        { status: res.status },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'erro', mensagem: 'Falha na comunicação com o servidor.' },
      { status: 500 },
    )
  }
}
