'use client'

import { useState, useCallback } from 'react'
import type {
  WhatsAppConfig,
  WhatsAppContact,
  WhatsAppMessage,
  WhatsAppTemplate,
  WhatsAppKPIs,
} from '@/app/types/whatsapp'
import {
  fetchWhatsAppConfigs,
  createWhatsAppConfig,
  updateWhatsAppConfig,
  deleteWhatsAppConfig,
  fetchWhatsAppStatus,
  fetchWhatsAppMessages,
  sendWhatsAppText,
  fetchWhatsAppContacts,
  upsertWhatsAppContact,
  deleteWhatsAppContact,
  toggleBlockContact,
  fetchWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  fetchWhatsAppKPIs,
} from '@/app/lib/whatsapp-api'

export function useWhatsAppConfig() {
  const [configs, setConfigs] = useState<WhatsAppConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWhatsAppConfigs()
      setConfigs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configuracoes')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (body: { instanceName: string; phoneNumber: string; apiKey: string; webhookUrl?: string }) => {
    setError(null)
    try {
      const config = await createWhatsAppConfig(body)
      setConfigs(prev => [config, ...prev])
      return config
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar')
      throw err
    }
  }, [])

  const update = useCallback(async (id: number, body: Partial<WhatsAppConfig>) => {
    setError(null)
    try {
      const config = await updateWhatsAppConfig(id, body)
      setConfigs(prev => prev.map(c => c.id === id ? config : c))
      return config
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
      throw err
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    setError(null)
    try {
      await deleteWhatsAppConfig(id)
      setConfigs(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover')
      throw err
    }
  }, [])

  return { configs, loading, error, load, create, update, remove }
}

export function useWhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (params?: {
    contactId?: number; direction?: string; status?: string;
    startDate?: string; endDate?: string; page?: number; perPage?: number
  }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWhatsAppMessages(params)
      setMessages(res.data)
      setTotal(res.total)
      setPages(res.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }, [])

  const send = useCallback(async (to: string, text: string) => {
    setError(null)
    try {
      await sendWhatsAppText(to, text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
      throw err
    }
  }, [])

  return { messages, total, pages, loading, error, load, send }
}

export function useWhatsAppContacts() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (page = 1, perPage = 20) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWhatsAppContacts(page, perPage)
      setContacts(res.data)
      setTotal(res.total)
      setPages(res.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [])

  const upsert = useCallback(async (body: { phoneNumber: string; name: string; tags?: string[] }) => {
    setError(null)
    try {
      const contact = await upsertWhatsAppContact(body)
      setContacts(prev => {
        const idx = prev.findIndex(c => c.id === contact.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = contact; return next }
        return [contact, ...prev]
      })
      return contact
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    setError(null)
    try {
      await deleteWhatsAppContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover')
      throw err
    }
  }, [])

  const toggleBlock = useCallback(async (id: number) => {
    setError(null)
    try {
      const contact = await toggleBlockContact(id)
      setContacts(prev => prev.map(c => c.id === id ? contact : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar bloqueio')
      throw err
    }
  }, [])

  return { contacts, total, pages, loading, error, load, upsert, remove, toggleBlock }
}

export function useWhatsAppTemplates() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWhatsAppTemplates()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (body: { name: string; category: string; language: string; content: string; variables?: string[] }) => {
    setError(null)
    try {
      const template = await createWhatsAppTemplate(body)
      setTemplates(prev => [template, ...prev])
      return template
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar')
      throw err
    }
  }, [])

  const update = useCallback(async (id: number, body: Partial<{ name: string; category: string; language: string; content: string; variables: string[]; isActive: boolean }>) => {
    setError(null)
    try {
      const template = await updateWhatsAppTemplate(id, body)
      setTemplates(prev => prev.map(t => t.id === id ? template : t))
      return template
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
      throw err
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    setError(null)
    try {
      await deleteWhatsAppTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover')
      throw err
    }
  }, [])

  return { templates, loading, error, load, create, update, remove }
}

export function useWhatsAppKPIs() {
  const [kpis, setKpis] = useState<WhatsAppKPIs | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWhatsAppKPIs()
      setKpis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar KPIs')
    } finally {
      setLoading(false)
    }
  }, [])

  return { kpis, loading, error, load }
}

export function useWhatsAppStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    status: string
    phoneNumber: string | null
    instanceName: string | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWhatsAppStatus()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar status')
    } finally {
      setLoading(false)
    }
  }, [])

  return { status, loading, error, load }
}
