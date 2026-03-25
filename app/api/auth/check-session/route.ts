import { NextResponse } from 'next/server'
import { backendFetch } from '@/app/lib/backend-server'

function bearerFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (header?.startsWith('Bearer ')) return header.slice(7).trim()
  const raw = request.headers.get('cookie') ?? ''
  const match = raw.match(/(?:^|;\s*)access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Valida JWT com o backend (GET /auth/profile). Cookie httpOnly access_token é definido em /api/auth/login. */
export async function GET(request: Request) {
  try {
    const token = bearerFromRequest(request)
    if (!token) {
      return NextResponse.json({ status: 'nao_autenticado' }, { status: 401 })
    }

    const res = await backendFetch('/auth/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = (await res.json().catch(() => ({}))) as {
      id?: number
      email?: string
      name?: string | null
    }

    if (!res.ok || data.id == null) {
      return NextResponse.json({ status: 'nao_autenticado' }, { status: 401 })
    }

    return NextResponse.json({
      status: 'autenticado',
      user: {
        id: data.id,
        username: data.name?.trim() || data.email || '',
        email: data.email ?? '',
        role: 'user',
      },
    })
  } catch {
    return NextResponse.json(
      { status: 'erro', message: 'Não foi possível verificar a sessão.' },
      { status: 500 }
    )
  }
}
