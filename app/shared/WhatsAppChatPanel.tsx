'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { useWhatsAppContacts, useWhatsAppMessages, useWhatsAppStatus } from '@/app/hooks/useWhatsApp'
import type { WhatsAppContact, WhatsAppMessage } from '@/app/types/whatsapp'

/* ================================================================
   STYLED COMPONENTS — WhatsApp Web Layout
   ================================================================ */

const ChatLayout = styled.div`
  display: flex;
  height: calc(100vh - 200px);
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  background: #f0f2f5;
`

/* ─── Sidebar (Contact List) ─── */

const Sidebar = styled.aside`
  width: 380px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f0f2f5;
  border-bottom: 1px solid #e5e7eb;
`

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
`

const ConnectionDot = styled.span<{ $connected: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => (p.$connected ? '#25d366' : '#ef4444')};
  margin-right: 8px;
  box-shadow: 0 0 0 2px ${p => (p.$connected ? 'rgba(37,211,102,0.25)' : 'rgba(239,68,68,0.25)')};
`

const StatusLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
`

const SearchBox = styled.div`
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  background: #f0f2f5;
  outline: none;
  color: #1f2937;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    background: #e8eaed;
  }
`

const ContactList = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`

const ContactItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${p => (p.$active ? '#f0f2f5' : '#ffffff')};
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    background: ${p => (p.$active ? '#f0f2f5' : '#f9fafb')};
  }
`

const Avatar = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${p => p.$color || '#25d366'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
  flex-shrink: 0;
`

const ContactMeta = styled.div`
  flex: 1;
  min-width: 0;
`

const ContactNameRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const ContactName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ContactTime = styled.span`
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 8px;
`

const ContactPreview = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`

const BlockedTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #dc2626;
  background: #fee2e2;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
`

/* ─── Chat Panel (Right Side) ─── */

const ChatPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #efeae2;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`

const ChatPanelEmpty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  color: #6b7280;
  gap: 12px;
`

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #9ca3af;
`

const EmptyText = styled.p`
  font-size: 14px;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
`

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f0f2f5;
  border-bottom: 1px solid #e5e7eb;
  z-index: 2;
`

const ChatHeaderInfo = styled.div`
  flex: 1;
`

const ChatHeaderName = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
`

const ChatHeaderPhone = styled.div`
  font-size: 12px;
  color: #6b7280;
`

const AgentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #dcfce7;
  color: #166534;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5dbd6' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    padding: 16px 20px;
  }
`

const DateSeparator = styled.div`
  align-self: center;
  background: #e2ddd5;
  color: #54656f;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  margin: 8px 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
`

const MessageBubble = styled.div<{ $outbound: boolean }>`
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.45;
  color: #1f2937;
  position: relative;
  word-wrap: break-word;
  align-self: ${p => (p.$outbound ? 'flex-end' : 'flex-start')};
  background: ${p => (p.$outbound ? '#d9fdd3' : '#ffffff')};
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    ${p => (p.$outbound ? 'right: -8px' : 'left: -8px')};
    width: 0;
    height: 0;
    border-style: solid;
    ${p =>
      p.$outbound
        ? 'border-width: 0 0 8px 8px; border-color: transparent transparent transparent #d9fdd3;'
        : 'border-width: 0 8px 8px 0; border-color: transparent #ffffff transparent transparent;'}
  }
`

const MessageText = styled.div`
  margin-bottom: 2px;
`

const MediaLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 4px;
`

const MessageFooter = styled.div<{ $outbound: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
`

const MessageTime = styled.span`
  font-size: 11px;
  color: #8696a0;
`

const MessageCheck = styled.span<{ $status: string }>`
  font-size: 12px;
  color: ${p => {
    if (p.$status === 'read') return '#53bdeb'
    if (p.$status === 'delivered') return '#8696a0'
    if (p.$status === 'sent') return '#8696a0'
    if (p.$status === 'failed') return '#ef4444'
    return '#8696a0'
  }};
`

const MessageOriginLabel = styled.span<{ $outbound: boolean }>`
  font-size: 10px;
  font-weight: 700;
  color: ${p => (p.$outbound ? '#1e8e3e' : '#6b7280')};
  margin-bottom: 2px;
  display: block;
`

/* ─── Input Bar ─── */

const InputBar = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #f0f2f5;
  border-top: 1px solid #e5e7eb;
`

const MessageInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  outline: none;
  color: #1f2937;

  &::placeholder {
    color: #9ca3af;
  }
`

const SendButton = styled.button`
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #25d366;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #1da851;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #6b7280;
  font-size: 14px;
`

const ErrorBanner = styled.div`
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  padding: 8px 16px;
  text-align: center;
`

const RefreshHint = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-left: 6px;
`

const NoContactsEmpty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 20px;
  text-align: center;
  gap: 8px;
`

/* ================================================================
   HELPERS
   ================================================================ */

const AVATAR_COLORS = [
  '#25d366', '#00a884', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
  '#10b981', '#06b6d4',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatTime(d: string): string {
  try {
    return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDate(d: string): string {
  try {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Hoje'
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return ''
  }
}

function formatDateKey(d: string): string {
  try {
    return new Date(d).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case 'sent':      return '\u2713'
    case 'delivered':  return '\u2713\u2713'
    case 'read':       return '\u2713\u2713'
    case 'failed':     return '\u2717'
    default:           return '\u23F1'
  }
}

function mediaIcon(type: string): string {
  switch (type) {
    case 'image':    return '\uD83D\uDDBC\uFE0F'
    case 'video':    return '\uD83C\uDFA5'
    case 'audio':    return '\uD83C\uDFA4'
    case 'document': return '\uD83D\uDCC4'
    default:         return '\uD83D\uDCCE'
  }
}

/* ================================================================
   COMPONENT
   ================================================================ */

const POLL_INTERVAL = 8000

export default function WhatsAppChatPanel() {
  const { contacts, loading: contactsLoading, error: contactsError, load: loadContacts } = useWhatsAppContacts()
  const { messages, loading: msgsLoading, error: msgsError, load: loadMessages, send } = useWhatsAppMessages()
  const { status, load: loadStatus } = useWhatsAppStatus()

  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Load contacts + status on mount ───
  useEffect(() => {
    loadContacts(1, 100)
    loadStatus()
  }, [loadContacts, loadStatus])

  // ─── Load messages when contact changes ───
  useEffect(() => {
    if (!selectedContact) return
    loadMessages({ contactId: selectedContact.id, perPage: 50 })
  }, [selectedContact, loadMessages])

  // ─── Auto-scroll to latest message ───
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // ─── Poll for new messages ───
  const pollMessages = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selectedContact) return

    pollRef.current = setInterval(() => {
      loadMessages({ contactId: selectedContact.id, perPage: 50 })
    }, POLL_INTERVAL)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedContact, loadMessages])

  useEffect(() => {
    const cleanup = pollMessages()
    return cleanup
  }, [pollMessages])

  // ─── Filter contacts ───
  const filteredContacts = contacts.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q)
  })

  // ─── Sort contacts by lastMessageAt (most recent first) ───
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })

  // ─── Sort messages chronologically ───
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  )

  // ─── Find last message for a contact ───
  const lastMessageMap = new Map<number, WhatsAppMessage>()
  messages.forEach(m => {
    const existing = lastMessageMap.get(m.contactId)
    if (!existing || new Date(m.sentAt) > new Date(existing.sentAt)) {
      lastMessageMap.set(m.contactId, m)
    }
  })

  // ─── Send message ───
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact || !text.trim() || sending) return
    setSending(true)
    try {
      await send(selectedContact.phoneNumber, text.trim())
      setText('')
      await loadMessages({ contactId: selectedContact.id, perPage: 50 })
    } catch { /* hook handles error */ }
    setSending(false)
  }

  // ─── Select contact ───
  const handleSelectContact = (contact: WhatsAppContact) => {
    setSelectedContact(contact)
  }

  // ─── Group messages by date ───
  const groupedMessages: { date: string; messages: WhatsAppMessage[] }[] = []
  let currentGroup: { date: string; messages: WhatsAppMessage[] } | null = null
  for (const msg of sortedMessages) {
    const key = formatDateKey(msg.sentAt)
    if (!currentGroup || currentGroup.date !== key) {
      currentGroup = { date: key, messages: [] }
      groupedMessages.push(currentGroup)
    }
    currentGroup.messages.push(msg)
  }

  return (
    <ChatLayout>
      {/* ─── SIDEBAR ─── */}
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Conversas</SidebarTitle>
          <StatusLabel>
            <ConnectionDot $connected={status?.connected ?? false} />
            {status?.connected ? 'Conectado' : 'Desconectado'}
          </StatusLabel>
        </SidebarHeader>

        <SearchBox>
          <SearchInput
            type="text"
            placeholder="Buscar contato ou numero..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchBox>

        {contactsError && (
          <ErrorBanner>
            {contactsError}
            <RefreshHint onClick={() => loadContacts(1, 100)}>Recarregar</RefreshHint>
          </ErrorBanner>
        )}

        <ContactList>
          {contactsLoading && <LoadingOverlay>Carregando contatos...</LoadingOverlay>}

          {!contactsLoading && sortedContacts.length === 0 && (
            <NoContactsEmpty>
              {search ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
            </NoContactsEmpty>
          )}

          {sortedContacts.map(contact => (
            <ContactItem
              key={contact.id}
              $active={selectedContact?.id === contact.id}
              onClick={() => handleSelectContact(contact)}
            >
              <Avatar $color={avatarColor(contact.name)}>
                {avatarInitials(contact.name)}
              </Avatar>
              <ContactMeta>
                <ContactNameRow>
                  <ContactName>
                    {contact.name}
                    {contact.isBlocked && <BlockedTag>Bloqueado</BlockedTag>}
                  </ContactName>
                  {contact.lastMessageAt && (
                    <ContactTime>{formatTime(contact.lastMessageAt)}</ContactTime>
                  )}
                </ContactNameRow>
                <ContactPreview>
                  {contact.phoneNumber}
                </ContactPreview>
              </ContactMeta>
            </ContactItem>
          ))}
        </ContactList>
      </Sidebar>

      {/* ─── CHAT AREA ─── */}
      {!selectedContact ? (
        <ChatPanelEmpty>
          <EmptyIcon>&#128172;</EmptyIcon>
          <EmptyText>
            Selecione um contato para visualizar a conversa e acompanhar a atuacao do agente WhatsApp.
          </EmptyText>
        </ChatPanelEmpty>
      ) : (
        <ChatPanel>
          <ChatHeader>
            <Avatar $color={avatarColor(selectedContact.name)}>
              {avatarInitials(selectedContact.name)}
            </Avatar>
            <ChatHeaderInfo>
              <ChatHeaderName>{selectedContact.name}</ChatHeaderName>
              <ChatHeaderPhone>{selectedContact.phoneNumber}</ChatHeaderPhone>
            </ChatHeaderInfo>
            <AgentBadge>
              &#9679; Agente Ativo
            </AgentBadge>
          </ChatHeader>

          {msgsError && (
            <ErrorBanner>
              {msgsError}
              <RefreshHint onClick={() => loadMessages({ contactId: selectedContact.id, perPage: 50 })}>
                Recarregar
              </RefreshHint>
            </ErrorBanner>
          )}

          <MessagesContainer>
            {msgsLoading && sortedMessages.length === 0 && (
              <LoadingOverlay>Carregando mensagens...</LoadingOverlay>
            )}

            {!msgsLoading && sortedMessages.length === 0 && (
              <LoadingOverlay>Nenhuma mensagem nesta conversa</LoadingOverlay>
            )}

            {groupedMessages.map(group => (
              <div key={group.date}>
                <DateSeparator>{formatDate(group.messages[0].sentAt)}</DateSeparator>
                {group.messages.map(msg => {
                  const outbound = msg.direction === 'outbound'
                  return (
                    <MessageBubble key={msg.id} $outbound={outbound}>
                      <MessageOriginLabel $outbound={outbound}>
                        {outbound ? 'Agente' : selectedContact.name}
                      </MessageOriginLabel>

                      {msg.type !== 'text' && (
                        <MediaLabel>
                          {mediaIcon(msg.type)} {msg.type.toUpperCase()}
                          {msg.templateName && ` - ${msg.templateName}`}
                        </MediaLabel>
                      )}

                      <MessageText>{msg.content || '(sem conteudo)'}</MessageText>

                      <MessageFooter $outbound={outbound}>
                        <MessageTime>{formatTime(msg.sentAt)}</MessageTime>
                        {outbound && (
                          <MessageCheck $status={msg.status}>
                            {statusIcon(msg.status)}
                          </MessageCheck>
                        )}
                      </MessageFooter>
                    </MessageBubble>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputBar onSubmit={handleSend}>
            <MessageInput
              type="text"
              placeholder="Digite uma mensagem..."
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={sending || selectedContact.isBlocked}
            />
            <SendButton
              type="submit"
              disabled={sending || !text.trim() || selectedContact.isBlocked}
              title={selectedContact.isBlocked ? 'Contato bloqueado' : 'Enviar'}
            >
              {sending ? '\u23F3' : '\u27A4'}
            </SendButton>
          </InputBar>
        </ChatPanel>
      )}
    </ChatLayout>
  )
}
