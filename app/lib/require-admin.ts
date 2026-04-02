import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

type ProfileBody = {
  id?: number
  email?: string
  name?: string | null
  role?: string
}

export type AdminProfile = {
  id: number
  email: string
  name: string | null
  role: string
}

export async function requireAdmin(request: Request): Promise<
  | { ok: true; profile: AdminProfile }
  | { ok: false; response: NextResponse }
> {
  try {
    const cookies = await getCookieHeader(request)
    const profRes = await backendFetch('/auth/profile', {
      method: 'GET',
      forwardCookies: cookies,
    })
    const profile = (await profRes.json().catch(() => ({}))) as ProfileBody

    if (!profRes.ok || profile.id == null) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }),
      }
    }

    const role = (profile.role ?? '').toLowerCase()
    if (role !== 'admin' && role !== 'superadmin') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Acesso restrito a administradores.' },
          { status: 403 },
        ),
      }
    }

    return {
      ok: true,
      profile: {
        id: profile.id,
        email: profile.email ?? '',
        name: profile.name ?? null,
        role: profile.role ?? role,
      },
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Falha ao validar sessão.' }, { status: 500 }),
    }
  }
}
