import { NextResponse } from 'next/server'
import { backendFetch } from '@/app/lib/backend-server'

const ACCESS_COOKIE = 'access_token'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string
      password?: string
      name?: string
      avatarUrl?: string
      phone?: string
      consultationType?: string
      consultationCategory?: string
      role?: string
      roles?: string[]
      permissions?: string[]
    }

    if (!body.email?.trim() || !body.password) {
      return NextResponse.json(
        { success: false, message: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const res = await backendFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email.trim(),
        password: body.password,
        name: body.name?.trim() || undefined,
        avatarUrl: body.avatarUrl?.trim() || undefined,
        phone: body.phone?.trim() || undefined,
        consultationType: body.consultationType?.trim() || undefined,
        consultationCategory: body.consultationCategory?.trim() || undefined,
        role: body.role?.trim() || undefined,
        roles: Array.isArray(body.roles) && body.roles.length > 0 ? body.roles : undefined,
        permissions:
          Array.isArray(body.permissions) && body.permissions.length > 0 ? body.permissions : undefined,
      }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      access_token?: string
      user?: { id?: number; email?: string; name?: string | null; role?: string; phone?: string | null }
      message?: string | string[]
    }

    const message =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(', ')
          : undefined

    if (!res.ok || !data.access_token) {
      return NextResponse.json(
        { success: false, message: message ?? 'Falha ao criar conta.' },
        { status: res.status >= 400 && res.status < 600 ? res.status : 401 }
      )
    }

    const u = data.user
    const out = NextResponse.json({
      success: true,
      user: {
        name: u?.name?.trim() || body.email.split('@')[0] || body.email,
        email: u?.email ?? body.email,
        role: u?.role ?? body.role ?? 'user',
        phone: u?.phone ?? null,
      },
    })

    out.cookies.set(ACCESS_COOKIE, data.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    return out
  } catch {
    return NextResponse.json(
      { success: false, message: 'Falha na comunicação com o servidor.' },
      { status: 500 }
    )
  }
}

