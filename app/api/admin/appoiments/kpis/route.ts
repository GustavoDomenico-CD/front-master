import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function GET(request: Request) {
  try {
    const res = await backendFetch('/admin/agendamento/kpis', {
      forwardCookies: await getCookieHeader(request),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao buscar KPIs' },
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