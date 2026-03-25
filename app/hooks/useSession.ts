'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { checkSession as fetchSessionUser, postLogout, type UserSession } from '@/app/lib/backend'

interface UseSessionReturn {
  user: UserSession | null
  loading: boolean
  error: string | null
  checkSession: () => Promise<void>
  logout: () => Promise<void>
}

export default function useSession(): UseSessionReturn {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const user = await fetchSessionUser()
      setUser(user)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao verificar sessão'
      setError(message)
      setUser(null)
      router.replace('/painel-login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await postLogout()
      setUser(null)
      router.replace('/painel-login')
    } catch {
      setError('Falha ao fazer logout')
    } finally {
      setLoading(false)
    }
  }, [router])

  return { user, loading, error, checkSession, logout }
}