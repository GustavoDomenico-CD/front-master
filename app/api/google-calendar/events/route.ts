import { readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

import { backendFetch, getCookieHeader } from '@/app/lib/backend-server'

export const runtime = 'nodejs'

type ServiceAccountJson = {
  type?: string
  client_email?: string
  private_key?: string
}

async function requireSession(request: Request): Promise<NextResponse | null> {
  const forwardCookies = await getCookieHeader(request)
  const res = await backendFetch('/auth/profile', { method: 'GET', forwardCookies })
  if (!res.ok) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }
  return null
}

function resolveCredentialsPath(raw: string): string {
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
}

export async function GET(request: Request) {
  const authError = await requireSession(request)
  if (authError) return authError

  const rawPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH
  if (!rawPath?.trim()) {
    return NextResponse.json(
      {
        error:
          'Configure GOOGLE_SERVICE_ACCOUNT_JSON_PATH no .env.local apontando para o JSON da service account (não use NEXT_PUBLIC_GOOGLE_CLIENT_ID com esse arquivo).',
      },
      { status: 503 }
    )
  }

  let parsed: ServiceAccountJson
  try {
    const fullPath = resolveCredentialsPath(rawPath.trim())
    parsed = JSON.parse(readFileSync(fullPath, 'utf8')) as ServiceAccountJson
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível ler GOOGLE_SERVICE_ACCOUNT_JSON_PATH.' },
      { status: 500 }
    )
  }

  if (parsed.type !== 'service_account' || !parsed.client_email || !parsed.private_key) {
    return NextResponse.json({ error: 'Arquivo não é uma service account JSON válida.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const timeMin = searchParams.get('timeMin') ?? new Date().toISOString()
  const timeMax =
    searchParams.get('timeMax') ?? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'

  try {
    const auth = new google.auth.JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })
    const list = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500,
    })

    const items = list.data.items ?? []
    const events = items
      .map((item) => {
        const id = item.id
        if (!id) return null
        const summary = item.summary?.trim() || '(Sem título)'
        const start = item.start
        const end = item.end
        let startIso: string
        let endIso: string
        let allDay = false

        if (start?.dateTime) {
          startIso = new Date(start.dateTime).toISOString()
          endIso = end?.dateTime ? new Date(end.dateTime).toISOString() : startIso
        } else if (start?.date) {
          allDay = true
          const endDate = end?.date ?? start.date
          // Sem sufixo Z: o JS no browser interpreta como horário local (melhor para o grid mensal).
          startIso = `${start.date}T00:00:00`
          endIso = `${endDate}T00:00:00`
        } else {
          return null
        }

        return {
          id,
          summary,
          description: item.description ?? undefined,
          location: item.location ?? undefined,
          htmlLink: item.htmlLink ?? undefined,
          start: startIso,
          end: endIso,
          allDay,
        }
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))

    return NextResponse.json({
      calendarId,
      events,
      eventsCount: events.length,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao consultar o Google Calendar.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
