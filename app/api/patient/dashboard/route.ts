import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'
import { buildPatientDashboardFromAppointments } from '@/app/lib/patient-dashboard-map'

type ProfileBody = {
  id?: number
  email?: string
  name?: string | null
  phone?: string | null
  role?: string
  isActive?: boolean
}

type ListaBody = {
  status?: string
  agendamentos?: Array<{
    id: string
    date: string
    username: string
    email: string
    telephone: string
    service: string
    professional: string
    typeOfService: string
    type_appointment: string
    status?: string
    hour: number
    duration: number
    observations?: string
  }>
  mensagem?: string
}

/**
 * Monta o dashboard de paciente autenticado.
 * Regras:
 * - exige sessão válida;
 * - permite apenas role `paciente`;
 * - busca agendamentos no backend e filtra por e-mail do perfil logado.
 */
export async function GET(request: Request) {
  try {
    const cookies = await getCookieHeader(request)
    const profRes = await backendFetch('/auth/profile', {
      method: 'GET',
      forwardCookies: cookies,
    })
    const profile = (await profRes.json().catch(() => ({}))) as ProfileBody

    if (!profRes.ok || profile.id == null || !profile.email) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const role = (profile.role ?? '').toLowerCase()
    if (role !== 'paciente') {
      return NextResponse.json({ error: 'Esta área é exclusiva para pacientes.' }, { status: 403 })
    }

    const listRes = await backendFetch('/admin/agendamento/lista?page=1&per_page=500', {
      forwardCookies: cookies,
    })
    const listData = (await listRes.json().catch(() => ({}))) as ListaBody

    const st = (listData.status ?? '').toLowerCase()
    if (!listRes.ok || (st !== 'sucesso' && st !== 'success') || !Array.isArray(listData.agendamentos)) {
      return NextResponse.json(
        {
          error:
            listData.mensagem ??
            'Não foi possível carregar seus agendamentos. Tente novamente mais tarde.',
        },
        { status: 502 },
      )
    }

    const emailNorm = profile.email.trim().toLowerCase()
    const mine = listData.agendamentos.filter(
      (a) => (a.email ?? '').trim().toLowerCase() === emailNorm,
    )

    const dashboard = buildPatientDashboardFromAppointments(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        isActive: profile.isActive,
      },
      mine,
    )

    return NextResponse.json(dashboard)
  } catch {
    return NextResponse.json({ error: 'Falha ao montar o painel.' }, { status: 500 })
  }
}
