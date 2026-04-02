import { NextResponse } from 'next/server'
import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

function normalizeWhatsAppPhone(input: string | undefined): string | null {
  if (!input?.trim()) return null
  const d = input.replace(/\D/g, '')
  if (d.length < 10) return null
  if (d.startsWith('55') && d.length >= 12) return d
  return `55${d}`
}

/**
 * Cria/atualiza contato na lista do WhatsApp (mesmo endpoint do painel).
 * Cadastro no chatbot costuma ser anônimo: use `WHATSAPP_CONTACT_SYNC_BEARER_TOKEN` (JWT admin no Nest)
 * ou realize o cadastro com uma sessão admin já autenticada (cookie access_token).
 */
async function upsertWhatsAppContactAfterCadastro(
  request: Request,
  name: string | undefined,
  phone: string | undefined,
): Promise<void> {
  const phoneNumber = normalizeWhatsAppPhone(phone)
  if (!phoneNumber) return

  const displayName = (name ?? 'Paciente').trim() || 'Paciente'
  const serviceToken = process.env.WHATSAPP_CONTACT_SYNC_BEARER_TOKEN?.trim()
  const cookies = await getCookieHeader(request)

  const headers = new Headers()
  if (serviceToken) headers.set('Authorization', `Bearer ${serviceToken}`)

  const forwardCookies = serviceToken ? undefined : cookies ?? undefined

  try {
    const syncRes = await backendFetch('/admin/whatsapp/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phoneNumber,
        name: displayName,
      }),
      forwardCookies: forwardCookies ?? undefined,
    })
    if (!syncRes.ok) {
      const errText = await syncRes.text().catch(() => '')
      console.warn(
        '[chatbot/cadastro] Sync WhatsApp contatos HTTP',
        syncRes.status,
        errText.slice(0, 240),
      )
    }
  } catch (e) {
    console.warn('[chatbot/cadastro] Sync WhatsApp contatos:', e)
  }
}

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

    await upsertWhatsAppContactAfterCadastro(
      request,
      typeof body.name === 'string' ? body.name : undefined,
      typeof body.phone === 'string' ? body.phone : undefined,
    )

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
