import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

function parseBackendBody(text: string): {
  mensagem?: string
  raw: Record<string, unknown> | null
} {
  if (!text.trim()) return { raw: null }
  try {
    const data = JSON.parse(text) as Record<string, unknown>
    const mensagem =
      typeof data.mensagem === 'string'
        ? data.mensagem
        : typeof data.message === 'string'
          ? data.message
          : undefined
    return { mensagem, raw: data }
  } catch {
    return { mensagem: 'Resposta do backend não é JSON válido.', raw: null }
  }
}

export async function GET(request: Request) {
  try {
    const res = await backendFetch('/admin/agendamento/status', {
      cache: 'no-store',
      forwardCookies: await getCookieHeader(request),
    })

    const text = await res.text()
    const { mensagem, raw } = parseBackendBody(text)

    if (!res.ok) {
      return NextResponse.json(
        {
          status: 'erro',
          mensagem: mensagem ?? `Backend retornou HTTP ${res.status} ao verificar status.`,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      )
    }

    if (!raw) {
      return NextResponse.json(
        { status: 'erro', mensagem: 'Resposta vazia do backend.' },
        { status: 502 }
      )
    }

    return NextResponse.json(raw)
  } catch (e) {
    const hint =
      e instanceof Error && e.message.includes('fetch')
        ? ' Verifique se BACKEND_URL está correto e o servidor está no ar.'
        : ''
    return NextResponse.json(
      { status: 'erro', mensagem: `Falha na comunicação com o servidor.${hint}` },
      { status: 500 }
    )
  }
}