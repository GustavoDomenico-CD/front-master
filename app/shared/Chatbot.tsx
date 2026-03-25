'use client'
import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { theme } from '@/app/styles/theme'

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
  options?: Options
}

interface Options {
  suggestions?: string[]
}

interface ChatManagerProps {
  apiBaseUrl?: string
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Shell = styled.section`
  width: 100%;
  max-width: 560px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.md};
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease both;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #764ba2 100%);
  color: white;
`

const Avatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px;
`

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
`

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 12px;
  line-height: 1.2;
`

const Messages = styled.main`
  height: min(460px, 55vh);
  overflow: auto;
  padding: 14px 14px 6px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 999px;
  }
`

const BubbleRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${(p) => (p.$isUser ? 'flex-end' : 'flex-start')};
  margin: 10px 0;
`

const Bubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  border-radius: 14px;
  padding: 10px 12px;
  color: ${(p) => (p.$isUser ? 'white' : theme.colors.dark)};
  background: ${(p) => (p.$isUser ? theme.colors.primary : theme.colors.light)};
  border: ${(p) => (p.$isUser ? 'none' : `1px solid ${theme.colors.border}`)};
  box-shadow: ${theme.shadow.sm};
`

const BubbleTime = styled.div`
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
`

const Typing = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: ${theme.colors.light};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.gray};
  font-size: 13px;
`

const dots = keyframes`
  0%, 20% { transform: translateY(0); opacity: .55; }
  50% { transform: translateY(-4px); opacity: 1; }
  80%, 100% { transform: translateY(0); opacity: .55; }
`

const DotRow = styled.span`
  display: inline-flex;
  gap: 5px;
`

const Dot = styled.span<{ $delayMs: number }>`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${theme.colors.gray};
  animation: ${dots} 1.1s infinite;
  animation-delay: ${(p) => p.$delayMs}ms;
`

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0 0;
`

const SuggestionButton = styled.button`
  border: 1px solid ${theme.colors.border};
  background: white;
  color: ${theme.colors.dark};
  padding: 8px 10px;
  font-size: 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`

const InputBar = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid ${theme.colors.border};
  background: white;
`

const TextInput = styled.input`
  flex: 1;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  padding: 10px 12px;
  font-size: 14px;
  color: ${theme.colors.dark};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  border: ${(p) => (p.$variant === 'primary' ? 'none' : `1px solid ${theme.colors.border}`)};
  background: ${(p) => (p.$variant === 'primary' ? theme.colors.primary : 'white')};
  color: ${(p) => (p.$variant === 'primary' ? 'white' : theme.colors.dark)};
  border-radius: ${theme.radius.md};
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.sm};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`

export default function ChatManager({ apiBaseUrl = '' }: ChatManagerProps) {
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('chatTheme') || 'light'
  })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [typingIndicator, setTypingIndicator] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('chatSessionId') || null
  })
  const [checkoutVisible, setCheckoutVisible] = useState(false)
  const [userInput, setUserInput] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Este chat foi originalmente feito para um "chatbot backend" externo (ex.: :8080).
   * No nosso app, esse serviço pode não estar rodando — então só chamamos API se
   * `apiBaseUrl` for fornecido explicitamente.
   */
  const apiUrl = apiBaseUrl.trim()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    if (apiUrl) initBackend()
    showWelcomeMessage()
  }, [])

  const initBackend = async () => {
    if (!apiUrl) return
    let attempts = 0
    while (attempts < 3) {
      try {
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        if (!response.ok) throw new Error('Falha na inicialização')
        const data = await response.json()
        console.log('Backend inicializado:', data.status)
        return
      } catch (error) {
        console.error('Erro ao inicializar backend (tentativa ' + (attempts + 1) + '):', error)
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
    addMessage('Backend indisponível após retries. Tente recarregar.', false)
  }

  const showWelcomeMessage = () => {
    const welcomeMessage =
      'Olá! Sou o Gustavinho, a assistente virtual da Edge Machine. Posso ajudar com dúvidas ou agendamentos. Como posso ajudar?'
    addMessage(welcomeMessage, false, {
      suggestions: ['Agendar serviço', 'Dúvidas sobre serviços', 'Quem Somos'],
    })
  }

  const addMessage = (text: string, isUser: boolean, options: Options = {}) => {
    if (!text) {
      text = 'Mensagem vazia ou erro desconhecido.'
    }
    const newMessage: Message = { text, isUser, timestamp: new Date(), options }
    setChatHistory((prev) => [...prev, newMessage])
    if (options.suggestions && options.suggestions.length > 0) {
      setSuggestions(options.suggestions)
    }
    scrollToBottom()
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const formatMessageText = (text: string) => {
    if (!text) return ''
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    )
    text = text.replace(/\n/g, '<br>')
    text = text.replace(/\- (.*?)(<br>|$)/g, '<li>$1</li>')
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return ('<ul>' + text + '</ul>').replace(/<br>(<li>.*?<\/li>)/g, '$1')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSendMessage = async (message?: string, isAction: boolean = false) => {
    if (!message) {
      message = userInput.trim()
    }
    if (!message || isProcessing) return
    setIsProcessing(true)
    if (!isAction) {
      addMessage(message, true)
      setUserInput('')
    }
    setTypingIndicator(true)
    // Aqui você implementaria a lógica de agendamento e API
    // Por simplicidade, vou simular uma resposta
    setTimeout(() => {
      addMessage('Resposta simulada do bot.', false)
      setTypingIndicator(false)
      setIsProcessing(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetChat = async () => {
    if (
      !window.confirm(
        'Tem certeza que deseja iniciar uma nova conversa? Toda a conversa atual será perdida.'
      )
    ) {
      return
    }
    setChatHistory([])
    setSuggestions([])
    setSessionId(null)
    localStorage.removeItem('chatSessionId')
    if (!apiUrl) {
      showWelcomeMessage()
      return
    }
    try {
      const response = await fetch(`${apiUrl}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.status === 'sucesso') {
        addMessage(data.resposta, false)
      } else {
        showWelcomeMessage()
      }
    } catch (error) {
      console.error('Erro ao reiniciar conversa:', error)
      showWelcomeMessage()
    }
  }

  return (
    <Shell aria-label="Chatbot">
      <Header>
        <Avatar src="/vercel.svg" alt="Assistente virtual" />
        <HeaderText>
          <Title>Gustavinho</Title>
          <Subtitle>Seu Agente Virtual da Edge Machine</Subtitle>
        </HeaderText>
      </Header>

      <Messages ref={chatContainerRef} aria-label="Mensagens do chat">
        {chatHistory.map((msg, index) => (
          <BubbleRow key={index} $isUser={msg.isUser}>
            <Bubble $isUser={msg.isUser}>
              <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
              <BubbleTime>{formatTime(msg.timestamp)}</BubbleTime>
            </Bubble>
          </BubbleRow>
        ))}

        {typingIndicator && (
          <BubbleRow $isUser={false}>
            <Typing>
              <span>Gustavinho está digitando</span>
              <DotRow aria-hidden="true">
                <Dot $delayMs={0} />
                <Dot $delayMs={120} />
                <Dot $delayMs={240} />
              </DotRow>
            </Typing>
          </BubbleRow>
        )}

        {suggestions.length > 0 && (
          <Suggestions aria-label="Sugestões">
            {suggestions.map((suggestion, index) => (
              <SuggestionButton
                key={index}
                type="button"
                onClick={() => handleSendMessage(suggestion, true)}
              >
                {suggestion}
              </SuggestionButton>
            ))}
          </Suggestions>
        )}
      </Messages>

      <InputBar>
        <TextInput
          type="text"
          placeholder="Digite sua mensagem..."
          aria-label="Digite sua mensagem"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          ref={inputRef}
        />
        <ActionButton
          type="button"
          $variant="primary"
          onClick={() => handleSendMessage()}
          disabled={isProcessing || !userInput.trim()}
        >
          Enviar
        </ActionButton>
        <ActionButton type="button" $variant="secondary" onClick={resetChat}>
          Nova conversa
        </ActionButton>
      </InputBar>
    </Shell>
  )
}