'use client'

import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useWhatsAppStatus } from '@/app/hooks/useWhatsApp'
import { useWhatsAppMessages } from '@/app/hooks/useWhatsApp'

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 18px;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

const Title = styled.h4`
  margin: 0;
  font-size: 14px;
  color: #111827;
`

const StatusPill = styled.span<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${p => p.$connected ? '#d1fae5' : '#fee2e2'};
  color: ${p => p.$connected ? '#065f46' : '#991b1b'};
  white-space: nowrap;
`

const Dot = styled.span<{ $on: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$on ? '#10b981' : '#ef4444'};
`

const Meta = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 9px 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;

  background: ${p => {
    if (p.$variant === 'danger') return '#ef4444'
    if (p.$variant === 'secondary') return '#f3f4f6'
    return '#3b82f6'
  }};
  color: ${p => p.$variant === 'secondary' ? '#111827' : 'white'};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const QRBox = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  margin-top: 12px;
`

const QRImage = styled.img`
  width: 280px;
  max-width: 100%;
  border-radius: 10px;
  background: white;
  justify-self: center;
  padding: 10px;
  border: 1px solid #e5e7eb;
`

const Help = styled.div`
  font-size: 12px;
  color: #374151;
  line-height: 1.4;
`

const ErrorText = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #dc2626;
`

const ChatCard = styled.div`
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
`

const ChatTitle = styled.h5`
  margin: 0 0 10px;
  font-size: 13px;
  color: #111827;
`

const ChatRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ChatInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 9px 11px;
  font-size: 13px;
  flex: 1;
  min-width: 160px;
`

const ChatSendButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  background: #25d366;
  color: white;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default function WhatsAppConnectPanel({ pollMs = 2500 }: { pollMs?: number }) {
  const { status, loading, error, load, connect, disconnect, resetSession } = useWhatsAppStatus()
  const { send } = useWhatsAppMessages()
  const [busy, setBusy] = useState(false)
  const [chatPhone, setChatPhone] = useState('')
  const [chatText, setChatText] = useState('')
  const [sendingChat, setSendingChat] = useState(false)

  const connected = Boolean(status?.connected)
  const pillText = useMemo(() => {
    if (!status) return 'Desconhecido'
    if (status.connected) return 'Conectado'
    if (status.status === 'qr') return 'Aguardando QR'
    if (status.status === 'connecting') return 'Conectando'
    return 'Desconectado'
  }, [status])

  useEffect(() => {
    load()
    const t = setInterval(() => load(), pollMs)
    return () => clearInterval(t)
  }, [load, pollMs])

  const handleConnect = async () => {
    setBusy(true)
    try {
      await connect()
    } catch {
      // error is surfaced by the hook state; avoid crashing the page
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    setBusy(true)
    try {
      await disconnect()
    } catch {
      // error is surfaced by the hook state; avoid crashing the page
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Resetar a sessão do WhatsApp? Você terá que escanear o QR novamente.')) return
    setBusy(true)
    try {
      await resetSession()
    } catch {
      // error is surfaced by the hook state; avoid crashing the page
    } finally {
      setBusy(false)
    }
  }

  const handleSendQuickChat = async () => {
    if (!connected || !chatPhone.trim() || !chatText.trim()) return
    setSendingChat(true)
    try {
      await send(chatPhone.trim(), chatText.trim())
      setChatText('')
    } catch {
      // hook handles error state internally
    } finally {
      setSendingChat(false)
    }
  }

  return (
    <Card>
      <TitleRow>
        <Title>Conexão WhatsApp (Baileys)</Title>
        <StatusPill $connected={connected}>
          <Dot $on={connected} />
          {pillText}
        </StatusPill>
      </TitleRow>

      {status?.phoneNumber && (
        <Meta>
          Número conectado: <b>{status.phoneNumber}</b>
        </Meta>
      )}

      <Actions>
        {!connected ? (
          <Button onClick={handleConnect} disabled={busy || loading}>
            {status?.status === 'qr' ? 'Atualizar QR' : 'Conectar / Gerar QR'}
          </Button>
        ) : (
          <Button $variant="secondary" onClick={handleDisconnect} disabled={busy || loading}>
            Desconectar
          </Button>
        )}
        <Button $variant="danger" onClick={handleReset} disabled={busy || loading}>
          Resetar sessão
        </Button>
      </Actions>

      {!connected && status?.qr && (
        <QRBox>
          <QRImage src={status.qr} alt="QR Code WhatsApp" />
          <Help>
            Abra o WhatsApp no celular → <b>Aparelhos conectados</b> → <b>Conectar um aparelho</b> e escaneie o QR.
            Se o QR expirar, clique em <b>Atualizar QR</b>.
          </Help>
        </QRBox>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      {connected && (
        <ChatCard>
          <ChatTitle>Chat rápido WhatsApp</ChatTitle>
          <ChatRow>
            <ChatInput
              placeholder="Número destino (ex.: 5511999999999)"
              value={chatPhone}
              onChange={(e) => setChatPhone(e.target.value)}
            />
            <ChatInput
              placeholder="Digite a mensagem..."
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuickChat()}
            />
            <ChatSendButton
              type="button"
              onClick={handleSendQuickChat}
              disabled={sendingChat || !chatPhone.trim() || !chatText.trim()}
            >
              {sendingChat ? 'Enviando...' : 'Enviar'}
            </ChatSendButton>
          </ChatRow>
        </ChatCard>
      )}
    </Card>
  )
}

