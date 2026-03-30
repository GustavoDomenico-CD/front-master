import { apiRequest } from './backend'
import type {
  WhatsAppConfig,
  WhatsAppContact,
  WhatsAppMessage,
  WhatsAppTemplate,
  WhatsAppKPIs,
  PaginatedResponse,
} from '@/app/types/whatsapp'

// ─── Config ─────────────────────────────────────────────

export async function fetchWhatsAppConfigs(): Promise<WhatsAppConfig[]> {
  const res = await apiRequest('/api/admin/whatsapp/config')
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao carregar configuracoes')
  return data.data
}

export async function createWhatsAppConfig(body: {
  instanceName: string
  phoneNumber: string
  apiKey: string
  webhookUrl?: string
}): Promise<WhatsAppConfig> {
  const res = await apiRequest('/api/admin/whatsapp/config', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao criar configuracao')
  return data.data
}

export async function updateWhatsAppConfig(
  id: number,
  body: Partial<{ instanceName: string; phoneNumber: string; apiKey: string; webhookUrl: string; isActive: boolean }>
): Promise<WhatsAppConfig> {
  const res = await apiRequest(`/api/admin/whatsapp/config/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao atualizar configuracao')
  return data.data
}

export async function deleteWhatsAppConfig(id: number): Promise<void> {
  const res = await apiRequest(`/api/admin/whatsapp/config/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, string>).message ?? 'Erro ao remover configuracao')
  }
}

export async function fetchWhatsAppStatus(): Promise<{
  connected: boolean
  status: string
  phoneNumber: string | null
  instanceName: string | null
  qr?: string | null
}> {
  const res = await apiRequest('/api/admin/whatsapp/status')
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao verificar status')
  return data.data
}

export async function connectWhatsApp(): Promise<{
  connected: boolean
  status: string
  phoneNumber: string | null
  instanceName: string | null
  qr?: string | null
}> {
  const res = await apiRequest('/api/admin/whatsapp/connect', { method: 'POST' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? data.mensagem ?? 'Erro ao conectar')
  return data.data
}

export async function disconnectWhatsApp(): Promise<void> {
  const res = await apiRequest('/api/admin/whatsapp/disconnect', { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).message ?? (data as any).mensagem ?? 'Erro ao desconectar')
}

export async function resetWhatsAppSession(): Promise<void> {
  const res = await apiRequest('/api/admin/whatsapp/reset-session', { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any).message ?? (data as any).mensagem ?? 'Erro ao resetar sessão')
}

// ─── Messages ───────────────────────────────────────────

export async function fetchWhatsAppMessages(params?: {
  contactId?: number
  direction?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  perPage?: number
}): Promise<PaginatedResponse<WhatsAppMessage>> {
  const qs = new URLSearchParams()
  if (params?.contactId) qs.set('contactId', String(params.contactId))
  if (params?.direction) qs.set('direction', params.direction)
  if (params?.status) qs.set('status', params.status)
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  qs.set('page', String(params?.page ?? 1))
  qs.set('per_page', String(params?.perPage ?? 20))

  const res = await apiRequest(`/api/admin/whatsapp/messages?${qs}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Erro ao carregar mensagens')
  return { data: json.data, total: json.total, page: json.page, pages: json.pages }
}

export async function sendWhatsAppText(to: string, text: string) {
  const res = await apiRequest('/api/admin/whatsapp/messages/send-text', {
    method: 'POST',
    body: JSON.stringify({ to, text }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao enviar mensagem')
  return data.data
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  variables?: string[]
) {
  const res = await apiRequest('/api/admin/whatsapp/messages/send-template', {
    method: 'POST',
    body: JSON.stringify({ to, templateName, languageCode, variables }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao enviar template')
  return data.data
}

export async function sendWhatsAppMedia(body: {
  to: string
  type: 'image' | 'document' | 'audio' | 'video'
  mediaUrl: string
  caption?: string
  filename?: string
}) {
  const res = await apiRequest('/api/admin/whatsapp/messages/send-media', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao enviar midia')
  return data.data
}

// ─── Contacts ───────────────────────────────────────────

export async function fetchWhatsAppContacts(page = 1, perPage = 20): Promise<PaginatedResponse<WhatsAppContact>> {
  const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  const res = await apiRequest(`/api/admin/whatsapp/contacts?${qs}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Erro ao carregar contatos')
  return { data: json.data, total: json.total, page: json.page, pages: json.pages }
}

export async function upsertWhatsAppContact(body: {
  phoneNumber: string
  name: string
  tags?: string[]
}): Promise<WhatsAppContact> {
  const res = await apiRequest('/api/admin/whatsapp/contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao salvar contato')
  return data.data
}

export async function deleteWhatsAppContact(id: number): Promise<void> {
  const res = await apiRequest(`/api/admin/whatsapp/contacts/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, string>).message ?? 'Erro ao remover contato')
  }
}

export async function toggleBlockContact(id: number): Promise<WhatsAppContact> {
  const res = await apiRequest(`/api/admin/whatsapp/contacts/${id}/toggle-block`, { method: 'PATCH' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao alterar bloqueio')
  return data.data
}

// ─── Templates ──────────────────────────────────────────

export async function fetchWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const res = await apiRequest('/api/admin/whatsapp/templates')
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao carregar templates')
  return data.data
}

export async function createWhatsAppTemplate(body: {
  name: string
  category: string
  language: string
  content: string
  variables?: string[]
}): Promise<WhatsAppTemplate> {
  const res = await apiRequest('/api/admin/whatsapp/templates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao criar template')
  return data.data
}

export async function updateWhatsAppTemplate(
  id: number,
  body: Partial<{
    name: string
    category: string
    language: string
    content: string
    variables: string[]
    isActive: boolean
  }>
): Promise<WhatsAppTemplate> {
  const res = await apiRequest(`/api/admin/whatsapp/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao atualizar template')
  return data.data
}

export async function deleteWhatsAppTemplate(id: number): Promise<void> {
  const res = await apiRequest(`/api/admin/whatsapp/templates/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, string>).message ?? 'Erro ao remover template')
  }
}

// ─── KPIs ──────────────────────────────────────────────

export async function fetchWhatsAppKPIs(): Promise<WhatsAppKPIs> {
  const res = await apiRequest('/api/admin/whatsapp/kpis')
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Erro ao carregar KPIs')
  return data.data
}
