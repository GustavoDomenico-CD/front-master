import { NextResponse } from 'next/server'
import { backendFetch } from '@/app/lib/backend-server'

const ACCESS_COOKIE = 'access_token'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      username?: string
      email?: string
      password?: string
    }
    const email = body.email ?? body.username
    if (!email?.trim() || !body.password) {
      return NextResponse.json(
        { success: false, message: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const res = await backendFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password: body.password }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      access_token?: string
      user?: { id?: number; email?: string; name?: string | null }
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
        { success: false, message: message ?? 'Falha ao autenticar.' },
        { status: res.status >= 400 && res.status < 600 ? res.status : 401 }
      )
    }

    const u = data.user
    const out = NextResponse.json({
      success: true,
      user: {
        name: u?.name?.trim() || email.split('@')[0] || email,
        email: u?.email ?? email,
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
