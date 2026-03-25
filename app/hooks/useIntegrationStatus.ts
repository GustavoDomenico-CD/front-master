import { useState, useEffect, useCallback } from 'react'
import { fetchIntegrationsStatus } from '@/app/lib/backend'

type IntegrationsStatus = 'Online' | 'Offline' | 'Desconhecido'

interface IntegrationsData {
  sheets: IntegrationsStatus
  calendar: IntegrationsStatus
  gmail: IntegrationsStatus
  lastCheck?: string
}

interface UseIntegrationsStatusReturn {
  status: IntegrationsData
  loading: boolean
  error: string | null
  refetch: () => void
  isPolling: boolean
  togglePolling: () => void
}

export function useIntegrationsStatus(options: {
  autoFetch?: boolean
  pollingIntervalMs?: number
} = {}): UseIntegrationsStatusReturn {
  const { autoFetch = true, pollingIntervalMs = 3 * 60 * 1000 } = options

  const [status, setStatus] = useState<IntegrationsData>({
    sheets: 'Desconhecido',
    calendar: 'Desconhecido',
    gmail: 'Desconhecido',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const payload = await fetchIntegrationsStatus()

      setStatus({
        ...payload,
        lastCheck: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }),
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível verificar o status'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) fetchStatus()
  }, [fetchStatus, autoFetch])

  useEffect(() => {
    if (!isPolling || !autoFetch) return
    const interval = setInterval(fetchStatus, pollingIntervalMs)
    return () => clearInterval(interval)
  }, [fetchStatus, isPolling, pollingIntervalMs, autoFetch])

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    isPolling,
    togglePolling: () => setIsPolling(p => !p),
  }
}