import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Repassa todos os query params recebidos diretamente ao backend
    const params = new URLSearchParams({
      page:         searchParams.get('page')         ?? '1',
      per_page:     searchParams.get('per_page')     ?? '15',
      data_inicio:  searchParams.get('data_inicio')  ?? '',
      data_fim:     searchParams.get('data_fim')     ?? '',
      servico:      searchParams.get('servico')      ?? '',
      profissional: searchParams.get('profissional') ?? '',
      tipo_servico: searchParams.get('tipo_servico') ?? '',
      tipo_ag:      searchParams.get('tipo_ag')      ?? '',
      status:       searchParams.get('status')       ?? '',
      local:        searchParams.get('local')        ?? '',
    })

    // Remove params vazios para não poluir a query string
    params.forEach((value, key) => {
      if (!value) params.delete(key)
    })

    const res = await backendFetch(`/admin/agendamento/lista?${params}`, {
      forwardCookies: await getCookieHeader(request),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { status: 'erro', mensagem: data?.mensagem ?? 'Erro ao buscar agendamentos' },
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