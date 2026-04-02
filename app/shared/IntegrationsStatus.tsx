'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useIntegrationsStatus } from './../hooks/useIntegrationStatus'
import { fetchAppointmentsList } from '@/app/lib/backend'
import type { Appointment } from '@/app/types/Appoiments'
import { sendWhatsAppText, fetchWhatsAppStatus } from '@/app/lib/whatsapp-api'

const StatusContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin: 24px 0;
`

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1f2937;
`

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`

const StatusCard = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`

const ServiceName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #374151;
`

const StatusBadge = styled.span<{ $status: 'Online' | 'Offline' | 'Desconhecido' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;

  background: ${props => {
    if (props.$status === 'Online') return '#d1fae5'
    if (props.$status === 'Offline') return '#fee2e2'
    return '#f3f4f6'
  }};

  color: ${props => {
    if (props.$status === 'Online') return '#065f46'
    if (props.$status === 'Offline') return '#991b1b'
    return '#4b5563'
  }};
`

const Dot = styled.span<{ $status: 'Online' | 'Offline' | 'Desconhecido' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    if (props.$status === 'Online') return '#10b981'
    if (props.$status === 'Offline') return '#ef4444'
    return '#9ca3af'
  }};
`

const LastCheck = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 12px;
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
`

const SuccessMessage = styled.div`
  color: #166534;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
`

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const PollingButton = styled.button<{ $isPolling: boolean }>`
  margin-right: 12px;
  padding: 6px 12px;
  font-size: 13px;
  background: ${p => p.$isPolling ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.$isPolling ? '#166534' : '#991b1b'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
`

const RefreshButton = styled.button<{ $loading: boolean }>`
  padding: 6px 12px;
  font-size: 13px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: ${p => p.$loading ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$loading ? 0.7 : 1};
`

const ErrorBanner = styled.div`
  color: #dc2626;
  margin-bottom: 16px;
`

const CalendarCard = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
`

const CalendarTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 15px;
  color: #1f2937;
`

const CalendarDescription = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: #4b5563;
`

const CalendarMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`

const Pill = styled.span`
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 10px;
  background: #e0e7ff;
  color: #3730a3;
`

const ReminderButton = styled.button<{ $enabled: boolean }>`
  padding: 8px 12px;
  font-size: 13px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 12px;
  background: ${p => (p.$enabled ? '#dcfce7' : '#fee2e2')};
  color: ${p => (p.$enabled ? '#166534' : '#991b1b')};
`

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
`

const Table = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: #f8fafc;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
`

const Td = styled.td`
  font-size: 13px;
  color: #1f2937;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
`

const EmptyState = styled.div`
  font-size: 13px;
  color: #6b7280;
  padding: 16px 4px 0;
`

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
`

const MonthTitle = styled.h5`
  margin: 0;
  font-size: 15px;
  color: #1f2937;
`

const MonthActions = styled.div`
  display: flex;
  gap: 8px;
`

const MonthButton = styled.button`
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
`

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
`

const Weekday = styled.div`
  text-align: center;
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
`

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
`

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean }>`
  min-height: 88px;
  border-radius: 8px;
  border: 1px solid ${p => (p.$isToday ? '#3b82f6' : '#e2e8f0')};
  background: ${p => (p.$isCurrentMonth ? '#ffffff' : '#f8fafc')};
  opacity: ${p => (p.$isCurrentMonth ? 1 : 0.6)};
  padding: 6px;
`

const DayNumber = styled.div<{ $isToday: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${p => (p.$isToday ? '#1d4ed8' : '#334155')};
  margin-bottom: 4px;
`

const EventItem = styled.div`
  font-size: 11px;
  line-height: 1.35;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  padding: 3px 5px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MoreEvents = styled.div`
  font-size: 10px;
  color: #64748b;
`

const REMINDER_DAY_BEFORE_HOURS_MIN = 24
const REMINDER_DAY_BEFORE_HOURS_MAX = 48
const REMINDER_STORAGE_KEY = 'whatsapp_consulta_lembretes_enviados'
const APPOINTMENTS_POLL_MS = 60 * 1000

function buildAppointmentDate(appointment: Appointment): Date | null {
  if (!appointment.date) return null
  const hour = Number(appointment.hour)
  if (Number.isNaN(hour)) return null
  const iso = `${appointment.date}T${String(hour).padStart(2, '0')}:00:00`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function reminderId(appointment: Appointment): string {
  return `${appointment.id}-${appointment.date}-${appointment.hour}`
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

function readSentReminders(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>()
  const raw = window.localStorage.getItem(REMINDER_STORAGE_KEY)
  if (!raw) return new Set<string>()
  try {
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr.map(String) : [])
  } catch {
    return new Set<string>()
  }
}

function persistSentReminders(sent: Set<string>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(Array.from(sent)))
}

export default function IntegrationsStatus(){
  const { status, loading, error, refetch, isPolling, togglePolling } = useIntegrationsStatus({
    autoFetch: true,
    pollingIntervalMs: 180000,
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderLog, setReminderLog] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const loadCalendarAppointments = async () => {
    setCalendarLoading(true)
    setCalendarError(null)
    try {
      const res = await fetchAppointmentsList(1, 200, { status: 'scheduled' })
      setAppointments(res.agendamentos ?? [])
    } catch (err: unknown) {
      setCalendarError(err instanceof Error ? err.message : 'Falha ao carregar consultas do calendário.')
    } finally {
      setCalendarLoading(false)
    }
  }

  useEffect(() => {
    loadCalendarAppointments()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      loadCalendarAppointments()
    }, APPOINTMENTS_POLL_MS)
    return () => clearInterval(timer)
  }, [])

  const upcomingAppointments = useMemo(() => {
    const now = Date.now()
    return appointments
      .map((a) => ({ item: a, when: buildAppointmentDate(a) }))
      .filter((x): x is { item: Appointment; when: Date } => Boolean(x.when))
      .filter((x) => x.when.getTime() >= now)
      .sort((a, b) => a.when.getTime() - b.when.getTime())
      .slice(0, 50)
  }, [appointments])

  useEffect(() => {
    if (!reminderEnabled || status.calendar !== 'Online' || upcomingAppointments.length === 0) return
    let cancelled = false
    const run = async () => {
      const sent = readSentReminders()
      try {
        const wa = await fetchWhatsAppStatus()
        if (!wa.connected) return

        for (const ap of upcomingAppointments) {
          if (cancelled) return
          const phone = normalizePhone(ap.item.telephone ?? '')
          if (!phone) continue
          const id = reminderId(ap.item)
          if (sent.has(id)) continue
          const diffMs = ap.when.getTime() - Date.now()
          const diffHours = diffMs / (1000 * 60 * 60)
          if (diffHours < REMINDER_DAY_BEFORE_HOURS_MIN || diffHours > REMINDER_DAY_BEFORE_HOURS_MAX) continue

          const msg =
            `Olá ${ap.item.username}, lembrando que sua consulta é amanhã, ` +
            `${formatDateTime(ap.when)}, com ${ap.item.professional || 'seu profissional'} ` +
            `(${ap.item.service || ap.item.typeOfService || 'atendimento'}).`

          await sendWhatsAppText(phone, msg)
          sent.add(id)
          persistSentReminders(sent)
          setReminderLog(`Lembrete enviado para ${ap.item.username} (${phone})`)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setReminderLog(
            `Falha ao enviar lembretes: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
          )
        }
      }
    }

    run()
    const timer = setInterval(run, 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [reminderEnabled, status.calendar, upcomingAppointments])

  const services = [
    {name: 'Google Sheets', key: 'sheets' as const },
    {name: 'Google Calendar', key: 'calendar' as const},
    {name: 'Gmail', key: 'gmail' as const}
  ]

  const calendarStart = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const weekday = first.getDay()
    const mondayOffset = (weekday + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - mondayOffset)
    start.setHours(0, 0, 0, 0)
    return start
  }, [calendarMonth])

  const calendarCells = useMemo(() => {
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(calendarStart)
      d.setDate(calendarStart.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [calendarStart])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, { hour: number; label: string }[]>()
    for (const ap of appointments) {
      const when = buildAppointmentDate(ap)
      if (!when) continue
      const key = when.toISOString().slice(0, 10)
      const list = map.get(key) ?? []
      list.push({
        hour: Number(ap.hour) || 0,
        label: `${String(ap.hour).padStart(2, '0')}:00 ${ap.username}`,
      })
      map.set(key, list)
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.hour - b.hour)
      map.set(key, list)
    }
    return map
  }, [appointments])

  const monthTitle = useMemo(() => {
    return calendarMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  }, [calendarMonth])

  return (
    <StatusContainer>
      <HeaderRow>
        <Title>Status das Integrações</Title>
        <div>
          <PollingButton $isPolling={isPolling} onClick={() => togglePolling()}>
            {isPolling ? 'Polling: ON' : 'Polling: OFF'}
          </PollingButton>

          <RefreshButton $loading={loading} onClick={refetch} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar agora'}
          </RefreshButton>
        </div>
      </HeaderRow>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <StatusGrid>
        {services.map(service => {
          const current = status[service.key]

          return (
            <StatusCard key={service.key}>
              <ServiceName>{service.name}</ServiceName>
              <StatusBadge $status={current}>
                <Dot $status={current} />
                {current}
              </StatusBadge>
            </StatusCard>
          )
        })}
      </StatusGrid>

      {status.lastCheck && (
        <LastCheck>Última verificação: {status.lastCheck}</LastCheck>
      )}

      <CalendarCard>
        <CalendarTitle>Google Calendar - consultas sincronizadas</CalendarTitle>
        <CalendarDescription>
          As consultas agendadas aparecem abaixo. Quando estiverem próximas, o sistema envia lembrete automático via WhatsApp.
        </CalendarDescription>

        <CalendarMeta>
          <Pill>Eventos futuros: {upcomingAppointments.length}</Pill>
          <Pill>Lembrete: dia anterior</Pill>
          <Pill>Calendar: {status.calendar}</Pill>
          <Pill>Atualização: a cada 1 min</Pill>
        </CalendarMeta>

        <ReminderButton
          type="button"
          $enabled={reminderEnabled}
          onClick={() => setReminderEnabled((v) => !v)}
        >
          {reminderEnabled ? 'Lembrete WhatsApp: ON' : 'Lembrete WhatsApp: OFF'}
        </ReminderButton>

        <RefreshButton
          type="button"
          $loading={calendarLoading}
          onClick={loadCalendarAppointments}
          disabled={calendarLoading}
        >
          {calendarLoading ? 'Sincronizando...' : 'Sincronizar consultas agora'}
        </RefreshButton>

        {calendarError && <ErrorMessage>{calendarError}</ErrorMessage>}
        {!calendarError && reminderLog && (
          reminderLog.startsWith('Falha') ? (
            <ErrorMessage>{reminderLog}</ErrorMessage>
          ) : (
            <SuccessMessage>{reminderLog}</SuccessMessage>
          )
        )}

        {upcomingAppointments.length === 0 ? (
          <EmptyState>Nenhuma consulta futura encontrada para sincronizar.</EmptyState>
        ) : (
          <>
            <CalendarHeader>
              <MonthTitle>{monthTitle}</MonthTitle>
              <MonthActions>
                <MonthButton
                  type="button"
                  onClick={() =>
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                >
                  Mes anterior
                </MonthButton>
                <MonthButton
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                  }}
                >
                  Hoje
                </MonthButton>
                <MonthButton
                  type="button"
                  onClick={() =>
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                >
                  Proximo mes
                </MonthButton>
              </MonthActions>
            </CalendarHeader>

            <WeekHeader>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(day => (
                <Weekday key={day}>{day}</Weekday>
              ))}
            </WeekHeader>

            <CalendarGrid>
              {calendarCells.map((cellDate) => {
                const key = cellDate.toISOString().slice(0, 10)
                const events = eventsByDay.get(key) ?? []
                const isCurrentMonth = cellDate.getMonth() === calendarMonth.getMonth()
                const today = new Date()
                const isToday =
                  today.getFullYear() === cellDate.getFullYear() &&
                  today.getMonth() === cellDate.getMonth() &&
                  today.getDate() === cellDate.getDate()
                return (
                  <DayCell
                    key={key}
                    $isCurrentMonth={isCurrentMonth}
                    $isToday={isToday}
                  >
                    <DayNumber $isToday={isToday}>{cellDate.getDate()}</DayNumber>
                    {events.slice(0, 2).map((event, idx) => (
                      <EventItem key={`${key}-${idx}`}>{event.label}</EventItem>
                    ))}
                    {events.length > 2 && (
                      <MoreEvents>+{events.length - 2} mais</MoreEvents>
                    )}
                  </DayCell>
                )
              })}
            </CalendarGrid>
          </>
        )}
      </CalendarCard>
    </StatusContainer>
  )

}
