'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import ChatManager from '@/app/shared/Chatbot'
import LoadingSpinner from '@/app/shared/LoadingSpinner'
import { checkSession, postLogout, type UserSession } from '@/app/lib/backend'

export default function ChatbotPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [principal, setPrincipal] = useState<{
    role?: string
    roles?: string[]
    permissions?: string[]
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        // Gate de acesso: só abre para quem está autenticado.
        const user: UserSession = await checkSession()
        setPrincipal({
          role: user.role,
          roles: user.roles,
          permissions: user.permissions,
        })

        // Depois libera o chat sem manter sessão (logout automático).
        await postLogout().catch(() => {})
      } catch {
        router.replace('/painel-login')
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [router])

  if (checking) return <LoadingSpinner fullScreen text="Carregando chat..." />

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ChatManager principal={principal} />
    </div>
  )
}

