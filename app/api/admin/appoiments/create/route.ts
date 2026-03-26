import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const cookieHeader = await getCookieHeader(request)

    // Compatibilidade com diferentes contratos no backend.
    const candidates = ['/admin/agendamento/criar', '/admin/agendamento/novo', '/admin/agendamento']

    let lastStatus = 500
    let lastMessage = 'Falha ao criar agendamento.'

    for (const endpoint of candidates) {
      const res = await backendFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        forwardCookies: cookieHeader,
      })

      const data = (await res.json().catch(() => ({}))) as {
        status?: string
        success?: boolean
        mensagem?: string
        message?: string
      }

      if (res.ok) {
        return NextResponse.json({
          status: data.status ?? 'sucesso',
          success: data.success ?? true,
          data,
        })
      }

      lastStatus = res.status
      lastMessage = data.mensagem ?? data.message ?? lastMessage
    }

    return NextResponse.json(
      { status: 'erro', success: false, mensagem: lastMessage },
      { status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 500 },
    )
  } catch {
    return NextResponse.json(
      { status: 'erro', success: false, mensagem: 'Falha na comunicação com o servidor.' },
      { status: 500 },
    )
  }
}

