'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'

import ChatManager from '@/app/shared/Chatbot'
import LoadingSpinner from '@/app/shared/LoadingSpinner'
import { checkSession, postLogout, type UserSession } from '@/app/lib/backend'

const ChatPageWrapper = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--chat-page-bg, #f8fafc);
`

const ChatContainer = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`

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
    <ChatPageWrapper>
      <ChatContainer>
        <ChatManager principal={principal} />
      </ChatContainer>
    </ChatPageWrapper>
  )
}

