'use client'

export type GoogleCalendarEvent = {
  id: string
  summary: string
  description?: string
  location?: string
  htmlLink?: string
  start: Date
  end: Date
  allDay: boolean
}

type GoogleCalendarEventRow = {
  id: string
  summary: string
  description?: string
  location?: string
  htmlLink?: string
  start: string
  end: string
  allDay: boolean
}

type GoogleCalendarApiResponse = {
  error?: string
  calendarId?: string
  events?: GoogleCalendarEventRow[]
}

/** Eventos via rota Next (service account no servidor — ver GOOGLE_SERVICE_ACCOUNT_JSON_PATH). */
export async function fetchGoogleCalendarViaServerApi(
  timeMin: Date,
  timeMax: Date
): Promise<{ events: GoogleCalendarEvent[]; calendarId: string }> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  })
  const res = await fetch(`/api/google-calendar/events?${params}`, { credentials: 'include' })
  const data = (await res.json()) as GoogleCalendarApiResponse
  if (!res.ok) {
    throw new Error(data.error ?? `Falha ao carregar eventos do Google Calendar (HTTP ${res.status}).`)
  }
  const calendarId = data.calendarId ?? 'primary'
  const rows = data.events ?? []
  const events: GoogleCalendarEvent[] = rows.map((r) => ({
    id: r.id,
    summary: r.summary,
    description: r.description,
    location: r.location,
    htmlLink: r.htmlLink,
    start: new Date(r.start),
    end: new Date(r.end),
    allDay: r.allDay,
  }))
  return { events, calendarId }
}
