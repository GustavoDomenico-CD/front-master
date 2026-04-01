import { NextResponse } from 'next/server'
import { backendFetch } from '@/app/lib/backend-server'

/**
 * Cadastro de paciente via chatbot → Nest POST /chatbot/cadastro (payload enxuto, persiste em ChatbotCadastro).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    const res = await backendFetch('/chatbot/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        email: typeof body.email === 'string' ? body.email.trim() : '',
        password: typeof body.password === 'string' ? body.password : '',
        name: typeof body.name === 'string' ? body.name.trim() : undefined,
        phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
        consultationType:
          typeof body.consultationType === 'string' ? body.consultationType.trim() : undefined,
        consultationCategory:
          typeof body.consultationCategory === 'string'
            ? body.consultationCategory.trim()
            : undefined,
      }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      status?: string
      success?: boolean
      user?: { id?: number; email?: string; name?: string | null; role?: string }
      message?: string | string[]
    }

    const rawMsg = (data as { message?: string | string[] }).message
    const message =
      typeof rawMsg === 'string'
        ? rawMsg
        : Array.isArray(rawMsg)
          ? rawMsg.join(', ')
          : typeof (data as { error?: string }).error === 'string'
            ? (data as { error: string }).error
            : undefined

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: message ?? 'Falha ao cadastrar.' },
        { status: res.status >= 400 && res.status < 600 ? res.status : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Falha na comunicação com o servidor.' },
      { status: 500 }
    )
  }
}
