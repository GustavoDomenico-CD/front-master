'use client'

import { useEffect } from 'react'
import styled from 'styled-components'
import { useWhatsAppStatus } from '@/app/hooks/useWhatsApp'
import WhatsAppConnectPanel from '@/app/shared/WhatsAppConnectPanel'

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 24px;
`

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1f2937;
`

const StatusBar = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: ${p => p.$connected ? '#d1fae5' : '#fee2e2'};
  color: ${p => p.$connected ? '#065f46' : '#991b1b'};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
`

const Dot = styled.span<{ $on: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$on ? '#10b981' : '#ef4444'};
`

export default function WhatsAppConfigPanel() {
  const { status: connStatus, load: loadStatus } = useWhatsAppStatus()

  useEffect(() => { loadStatus() }, [loadStatus])

  return (
    <Container>
      <Title>WhatsApp</Title>

      <WhatsAppConnectPanel />

      <StatusBar $connected={connStatus?.connected ?? false}>
        <Dot $on={connStatus?.connected ?? false} />
        {connStatus?.connected
          ? `Conectado${connStatus.phoneNumber ? ` - ${connStatus.phoneNumber}` : ''}`
          : 'Desconectado'}
      </StatusBar>
    </Container>
  )
}
