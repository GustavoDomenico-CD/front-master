/**
 * Chamadas HTTP do browser para as rotas /api (sessão via cookie).
 * O proxy para o backend externo fica em backend-server.ts.
 */

import type { Appointment, ChartsResponse, Filters } from '@/app/types/Appoiments'
import type { RoomBillingDisplay, RoomDefinition, RoomLease, RoomRentalsPayload } from '@/app/types/room-rentals'
import type { KpisResponse } from '@/app/types/kpi'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginApiResponse {
  success: boolean
  message?: string
  user?: { name: string; email: string }
}

export interface UserSession {
  id: number
  username: string
  email: string
  role: string
  /**
   * Alguns backends retornam também roles/permissions.
   * Esses campos são opcionais para manter compatibilidade.
   */
  roles?: string[]
  permissions?: string[]
}

export interface CheckSessionSuccess {
  status: 'autenticado'
  user: UserSession
}

export type IntegrationsStatusValue = 'Online' | 'Offline' | 'Desconhecido'

export interface IntegrationsStatusPayload {
  sheets: IntegrationsStatusValue
  calendar: IntegrationsStatusValue
  gmail: IntegrationsStatusValue
}

/** Normaliza valores vindos do backend (ONLINE, Online, etc.). */
export function normalizeIntegrationStatus(raw: string | undefined | null): IntegrationsStatusValue {
  const s = (raw ?? '').toString().trim().toLowerCase()
  if (['online', 'on', 'ok', 'connected', 'ativo'].includes(s)) return 'Online'
  if (['offline', 'off', 'down', 'disconnected', 'inativo'].includes(s)) return 'Offline'
  return 'Desconhecido'
}

function parseJsonObject(raw: string): { ok: true; value: Record<string, unknown> } | { ok: false } {
  if (!raw.trim()) return { ok: true, value: {} }
  try {
    const v = JSON.parse(raw) as unknown
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return { ok: true, value: v as Record<string, unknown> }
    }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export interface AppointmentsListSuccess {
  status: 'sucesso'
  agendamentos: Appointment[]
  charts: ChartsResponse | null
  total: number
  pages: number
  mensagem?: string
}

export class ApiError extends Error {
  status: number
  payload?: Record<string, unknown>

  constructor(message: string, status: number, payload?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function clientHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers)
  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers: clientHeaders(init),
  })
}

/** Faz parse tolerante de JSON para respostas de API inconsistentes. */
export async function parseApiObject(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>
}

/** Extrai uma mensagem de erro padrão em payloads heterogêneos. */
export function extractApiMessage(
  payload: Record<string, unknown>,
  fallback: string
): string {
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
  if (typeof payload.mensagem === 'string' && payload.mensagem.trim()) return payload.mensagem
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  return fallback
}

/** Lança ApiError quando o status HTTP não é de sucesso. */
export async function ensureApiSuccess(
  res: Response,
  fallback: string
): Promise<Record<string, unknown>> {
  const payload = await parseApiObject(res)
  if (!res.ok) {
    throw new ApiError(extractApiMessage(payload, fallback), res.status, payload)
  }
  return payload
}

export function buildAppointmentsListSearchParams(
  page: number,
  perPage: number,
  filters: Partial<Filters>
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  })
  if (filters.startDate) params.set('data_inicio', filters.startDate)
  if (filters.endDate) params.set('data_fim', filters.endDate)
  if (filters.service) params.set('servico', filters.service)
  if (filters.professional) params.set('profissional', filters.professional)
  if (filters.typeOfService) params.set('tipo_servico', filters.typeOfService)
  if (filters.type_appointment) params.set('tipo_ag', filters.type_appointment)
  if (filters.status) params.set('status', filters.status)
  if (filters.local) params.set('local', filters.local)
  return params
}

function isListSuccessStatus(status: unknown): boolean {
  const s = typeof status === 'string' ? status.toLowerCase() : ''
  return s === 'sucesso' || s === 'success'
}

export async function fetchAppointmentsList(
  page: number,
  perPage: number,
  filters: Partial<Filters>
): Promise<AppointmentsListSuccess> {
  const qs = buildAppointmentsListSearchParams(page, perPage, filters)
  const res = await apiRequest(`/api/admin/appoiments/list?${qs}`)
  const raw = await res.text()
  const parsed = parseJsonObject(raw)
  if (!parsed.ok) {
    throw new Error(`Resposta inválida ao carregar agendamentos (HTTP ${res.status}).`)
  }
  const data = parsed.value as unknown as AppointmentsListSuccess & {
    status?: string
    mensagem?: string
    message?: string
  }
  const msg =
    typeof data.mensagem === 'string'
      ? data.mensagem
      : typeof data.message === 'string'
        ? data.message
        : undefined
  if (!res.ok || !isListSuccessStatus(data.status)) {
    throw new Error(msg ?? 'Falha ao carregar agendamentos')
  }
  return data as AppointmentsListSuccess
}

function isKpiSuccessStatus(status: unknown): boolean {
  const s = typeof status === 'string' ? status.toLowerCase() : ''
  return s === 'success' || s === 'sucesso'
}

export async function fetchKpis(): Promise<KpisResponse> {
  const res = await apiRequest('/api/admin/appoiments/kpis')
  const raw = await res.text()
  const parsed = parseJsonObject(raw)
  if (!parsed.ok) {
    throw new Error(`Resposta inválida ao carregar KPIs (HTTP ${res.status}).`)
  }
  const data = parsed.value as unknown as KpisResponse & { mensagem?: string; message?: string }
  const msg =
    typeof data.mensagem === 'string'
      ? data.mensagem
      : typeof data.message === 'string'
        ? data.message
        : undefined
  if (!res.ok || !isKpiSuccessStatus(data.status)) {
    throw new Error(msg ?? 'Falha ao carregar KPIs')
  }
  return data as KpisResponse
}

export async function fetchIntegrationsStatus(): Promise<IntegrationsStatusPayload> {
  const res = await apiRequest('/api/admin/appoiments/status', { cache: 'no-store' })
  const raw = await res.text()
  const parsed = parseJsonObject(raw)
  if (!parsed.ok) {
    throw new Error(
      `Resposta inválida ao verificar status (HTTP ${res.status}): corpo não é JSON.`
    )
  }
  const data = parsed.value
  const mensagem =
    typeof data.mensagem === 'string'
      ? data.mensagem
      : typeof data.message === 'string'
        ? data.message
        : undefined

  if (!res.ok) {
    throw new Error(mensagem ?? `Falha ao verificar status (HTTP ${res.status}).`)
  }

  const st = typeof data.status === 'string' ? data.status.toLowerCase() : ''
  if (st !== 'sucesso' && st !== 'success') {
    throw new Error(mensagem ?? 'Resposta do servidor sem status de sucesso.')
  }

  const inner = data.data
  if (inner === null || typeof inner !== 'object' || Array.isArray(inner)) {
    throw new Error(mensagem ?? 'Dados de integração ausentes na resposta.')
  }
  const d = inner as Record<string, unknown>
  return {
    sheets: normalizeIntegrationStatus(d.sheets != null ? String(d.sheets) : undefined),
    calendar: normalizeIntegrationStatus(d.calendar != null ? String(d.calendar) : undefined),
    gmail: normalizeIntegrationStatus(d.gmail != null ? String(d.gmail) : undefined),
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const res = await apiRequest(`/api/admin/${id}/delete`, { method: 'DELETE' })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { mensagem?: string }
    throw new Error(data.mensagem ?? 'Erro ao excluir')
  }
}

export async function updateAppointment(id: string, body: Appointment): Promise<void> {
  const res = await apiRequest(`/api/admin/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(data?.message || `Erro ${res.status}: não foi possível atualizar.`)
  }
}

export async function checkSession(): Promise<UserSession> {
  const res = await apiRequest('/api/auth/check-session')
  const data = (await res.json()) as CheckSessionSuccess | { status?: string; message?: string }
  if (!res.ok || data.status !== 'autenticado' || !('user' in data)) {
    throw new Error('message' in data && data.message ? data.message : 'Não autenticado')
  }
  return data.user
}

export async function postLogout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' })
}

export async function postLogin(credentials: LoginCredentials): Promise<LoginApiResponse> {
  const res = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  const data = (await res.json()) as LoginApiResponse
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Falha ao autenticar')
  }
  return data
}

export async function fetchRoomRentals(): Promise<RoomRentalsPayload> {
  const res = await apiRequest('/api/admin/room-rentals', { cache: 'no-store' })
  const data = (await res.json().catch(() => ({}))) as { error?: string; data?: RoomRentalsPayload }
  if (!res.ok || !data.data) {
    throw new Error(data.error ?? 'Erro ao carregar aluguel de salas.')
  }
  return data.data
}

export async function createRoomDefinition(body: Omit<RoomDefinition, 'id'>): Promise<RoomDefinition> {
  const res = await apiRequest('/api/admin/room-rentals', {
    method: 'POST',
    body: JSON.stringify({
      kind: 'room',
      ...body,
    }),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; data?: RoomDefinition }
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Erro ao criar sala.')
  return data.data
}

export async function createRoomLease(body: Omit<RoomLease, 'id'>): Promise<RoomLease> {
  const res = await apiRequest('/api/admin/room-rentals', {
    method: 'POST',
    body: JSON.stringify({
      kind: 'lease',
      ...body,
    }),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; data?: RoomLease }
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Erro ao registrar locação.')
  return data.data
}

export async function updateRoomDefinition(id: string, patch: Partial<RoomDefinition>): Promise<RoomDefinition> {
  const res = await apiRequest(`/api/admin/room-rentals/${encodeURIComponent(id)}?kind=room`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; data?: RoomDefinition }
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Erro ao atualizar sala.')
  return data.data
}

export async function updateRoomLease(id: string, patch: Partial<RoomLease>): Promise<RoomLease> {
  const res = await apiRequest(`/api/admin/room-rentals/${encodeURIComponent(id)}?kind=lease`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; data?: RoomLease }
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Erro ao atualizar locação.')
  return data.data
}

export async function deleteRoomDefinition(id: string): Promise<void> {
  const res = await apiRequest(`/api/admin/room-rentals/${encodeURIComponent(id)}?kind=room`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Erro ao excluir sala.')
  }
}

export async function deleteRoomLease(id: string): Promise<void> {
  const res = await apiRequest(`/api/admin/room-rentals/${encodeURIComponent(id)}?kind=lease`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Erro ao excluir locação.')
  }
}

export type { RoomBillingDisplay, RoomDefinition, RoomLease, RoomRentalsPayload }
