'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWhatsAppMessages } from '@/app/hooks/useWhatsApp'
import Pagination from '@/app/shared/Pagination'

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

const SendBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  flex: 1;
  min-width: 0;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`

const PhoneInput = styled(Input)`
  flex: 0 0 200px;
`

const SendButton = styled.button`
  padding: 10px 20px;
  background: #25d366;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover { background: #1da851; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MessageRow = styled.div<{ $direction: string }>`
  padding: 12px 16px;
  border-radius: 10px;
  background: ${p => p.$direction === 'outbound' ? '#dcfce7' : '#f0f9ff'};
  border-left: 4px solid ${p => p.$direction === 'outbound' ? '#25d366' : '#3b82f6'};
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`

const ContactName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: #374151;
`

const MessageTime = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const MessageContent = styled.div`
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
`

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  background: ${p => {
    if (p.$status === 'read') return '#d1fae5'
    if (p.$status === 'delivered') return '#dbeafe'
    if (p.$status === 'sent') return '#fef3c7'
    if (p.$status === 'failed') return '#fee2e2'
    return '#f3f4f6'
  }};
  color: ${p => {
    if (p.$status === 'read') return '#065f46'
    if (p.$status === 'delivered') return '#1e40af'
    if (p.$status === 'sent') return '#92400e'
    if (p.$status === 'failed') return '#991b1b'
    return '#4b5563'
  }};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
`

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
`

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: white;
`

export default function WhatsAppMessagesPanel() {
  const { messages, pages, loading, error, load, send } = useWhatsAppMessages()
  const [phone, setPhone] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [page, setPage] = useState(1)
  const [direction, setDirection] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => { load({ page, direction: direction || undefined, status: status || undefined }) }, [load, page, direction, status])

  const handleSend = async () => {
    if (!phone.trim() || !text.trim()) return
    setSending(true)
    try {
      await send(phone.trim(), text.trim())
      setText('')
      load({ page, direction: direction || undefined, status: status || undefined })
    } catch { /* handled by hook */ }
    setSending(false)
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString('pt-BR') } catch { return d }
  }

  return (
    <Container>
      <Title>Mensagens WhatsApp</Title>

      <SendBar>
        <PhoneInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="Numero (5511...)" />
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Digite sua mensagem..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <SendButton onClick={handleSend} disabled={sending || !phone.trim() || !text.trim()}>
          {sending ? 'Enviando...' : 'Enviar'}
        </SendButton>
      </SendBar>

      <FiltersRow>
        <Select value={direction} onChange={e => { setDirection(e.target.value); setPage(1) }}>
          <option value="">Todas direcoes</option>
          <option value="inbound">Recebidas</option>
          <option value="outbound">Enviadas</option>
        </Select>
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Todos status</option>
          <option value="sent">Enviada</option>
          <option value="delivered">Entregue</option>
          <option value="read">Lida</option>
          <option value="failed">Falhou</option>
        </Select>
      </FiltersRow>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {loading && <EmptyState>Carregando mensagens...</EmptyState>}

      {!loading && messages.length === 0 && <EmptyState>Nenhuma mensagem encontrada</EmptyState>}

      <MessageList>
        {messages.map(m => (
          <MessageRow key={m.id} $direction={m.direction}>
            <MessageHeader>
              <div>
                <ContactName>
                  {m.direction === 'outbound' ? 'Enviada para' : 'Recebida de'}: {m.contact?.name ?? m.contact?.phoneNumber ?? `#${m.contactId}`}
                </ContactName>
                <StatusBadge $status={m.status}>{m.status}</StatusBadge>
              </div>
              <MessageTime>{formatDate(m.sentAt)}</MessageTime>
            </MessageHeader>
            <MessageContent>
              {m.type === 'text' ? m.content : `[${m.type}] ${m.content || m.templateName || ''}`}
            </MessageContent>
          </MessageRow>
        ))}
      </MessageList>

      {pages > 1 && (
        <div style={{ marginTop: 16 }}>
          <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
        </div>
      )}
    </Container>
  )
}
