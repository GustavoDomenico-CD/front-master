import { useState, useEffect, useCallback } from 'react'
import { KPI } from '../types/kpi'
import { fetchKpis } from '@/app/lib/backend'

export function useKPIs() {
  const [kpis, setKpis] = useState<KPI | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKPIs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchKpis()
      setKpis(data.kpis)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar KPIs'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKPIs()
  }, [fetchKPIs])

  return { kpis, loading, error, fetchKPIs }
}