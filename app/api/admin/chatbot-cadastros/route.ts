import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

/** Lista cadastros feitos pelo chatbot (admin). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ?? '100'
    const res = await backendFetch(`/admin/chatbot-cadastros?limit=${encodeURIComponent(limit)}`, {
      forwardCookies: await getCookieHeader(request),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao listar cadastros' },
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
