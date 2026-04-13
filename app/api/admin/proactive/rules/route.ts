import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'
import { requirePermission } from '@/app/lib/require-permission'

export async function GET(request: Request) {
  const allowed = await requirePermission(request, ['chatbot:manage'])
  if (!allowed.ok) return allowed.response
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') ?? ''

    const res = await backendFetch(`/admin/agendamento/proactive/rules?userId=${userId}`, {
      forwardCookies: await getCookieHeader(request),
    })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao buscar regras proativas' },
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

export async function POST(request: Request) {
  const allowed = await requirePermission(request, ['chatbot:manage'])
  if (!allowed.ok) return allowed.response
  try {
    const body = await request.json()
    const cookies = await getCookieHeader(request)

    // Route _action toggle/delete to the correct backend endpoints
    if (body._action === 'toggle' && body.ruleId) {
      const res = await backendFetch(`/admin/agendamento/proactive/rules/${body.ruleId}/toggle`, {
        method: 'PATCH',
        forwardCookies: cookies,
      })
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json(
          { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao alternar regra proativa' },
          { status: res.status },
        )
      }
      return NextResponse.json(data)
    }

    if (body._action === 'delete' && body.ruleId) {
      const res = await backendFetch(`/admin/agendamento/proactive/rules/${body.ruleId}`, {
        method: 'DELETE',
        forwardCookies: cookies,
      })
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json(
          { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao remover regra proativa' },
          { status: res.status },
        )
      }
      return NextResponse.json(data)
    }

    // Default: create new rule
    const res = await backendFetch('/admin/agendamento/proactive/rules', {
      method: 'POST',
      body: JSON.stringify(body),
      forwardCookies: cookies,
    })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao criar regra proativa' },
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
