import { useState, useCallback } from 'react'
import { Appointment, ChartsResponse, Filters } from '../types/Appoiments'
import { fetchAppointmentsList } from '@/app/lib/backend'

type PaginationInfo = {
  total: number
  totalPages: number
  currentPage: number
  perPage: number
}

export default function useAppoiments() {
  const [appoiments, setAppoiments] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 15,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartsData, setChartsData] = useState<ChartsResponse | null>(null)

  const fetchAgendamentos = useCallback(
    async (page = 1, filters: Partial<Filters> = {}) => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchAppointmentsList(page, pagination.perPage, filters)

        setAppoiments(data.agendamentos ?? [])
        setChartsData(data.charts ?? null)
        setPagination({
          total:       data.total,
          totalPages:  data.pages,
          currentPage: page,
          perPage:     pagination.perPage,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar agendamentos'
        setError(message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [pagination.perPage]
  )

  return { appoiments, pagination, loading, error, chartsData, fetchAgendamentos }
}