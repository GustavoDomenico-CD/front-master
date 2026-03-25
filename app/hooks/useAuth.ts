'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { postLogin, postLogout, type LoginCredentials } from '@/app/lib/backend'

interface AuthResponse {
  success: boolean
  message?: string
  user?: { name: string; email: string }
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)

    try {
      const data = await postLogin(credentials)

      router.push('/painel-agendamento')
      router.refresh()

      return {
        success: true,
        user: data.user,
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao fazer login'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await postLogout()
      router.push('/painel-login')
      router.refresh()
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    }
  }

  return { login, logout, loading, error }
}