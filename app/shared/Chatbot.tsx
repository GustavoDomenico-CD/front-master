'use client'
import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { theme } from '@/app/styles/theme'
import { postLogout } from '@/app/lib/backend'

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
  options?: Options
  isProactive?: boolean
}

interface Options {
  suggestions?: string[]
}

interface ProactiveRule {
  id: number
  userId: number
  trigger: 'interval' | 'event' | 'schedule'
  condition: Record<string, unknown>
  message: string
  isActive: boolean
  lastFiredAt: string | null
  createdAt: string
}

interface ChatManagerProps {
  apiBaseUrl?: string
  userId?: number
  /**
   * Usado para herdar roles/permissions do "usuário principal" que abriu a página do chatbot.
   * Pode ser usado no cadastro de paciente.
   */
  principal?: {
    role?: string
    roles?: string[]
    permissions?: string[]
  } | null
}

const DENTISTRY_CONSULTATION_OPTIONS = [
  'Avaliacao odontologica inicial',
  'Limpeza e profilaxia',
  'Clareamento dental',
  'Ortodontia (aparelho)',
  'Tratamento de canal (endodontia)',
  'Extracao dentaria',
  'Implante dentario',
  'Protese dentaria',
  'Periodontia (gengiva)',
  'Odontopediatria',
  'Cirurgia bucomaxilofacial',
  'Dor de dente / urgencia',
]

const DENTISTRY_APPOINTMENT_SERVICES = [
  'Consulta odontologica de avaliacao',
  'Limpeza dental (profilaxia)',
  'Aplicacao de fluor',
  'Clareamento dental',
  'Restauracao (obturação)',
  'Tratamento de canal',
  'Extracao simples',
  'Extracao de siso',
  'Implante dentario',
  'Protese dentaria',
  'Aparelho ortodontico',
  'Manutencao ortodontica',
  'Periodontia (tratamento da gengiva)',
  'Odontopediatria',
  'Urgencia odontologica',
]

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Shell = styled.section`
  width: 100%;
  max-width: 560px;
  align-self: center;
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

const ProactiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${theme.colors.primary};
  background: rgba(59, 130, 246, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 4px;
`

const ProactivePanel = styled.div`
  padding: 14px;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.light};
  max-height: 320px;
  overflow-y: auto;
`

const RegistrationPanel = styled.div`
  padding: 14px;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.light};
  max-height: 420px;
  overflow-y: auto;
`

const PanelTitle = styled.h4`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.dark};
`

const RuleCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  margin-bottom: 6px;
  font-size: 12px;
`

const RuleInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const RuleTrigger = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${theme.colors.gray};
  text-transform: uppercase;
`

const RuleMessage = styled.p`
  margin: 2px 0 0;
  color: ${theme.colors.dark};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ToggleButton = styled.button<{ $active: boolean }>`
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${(p) => (p.$active ? theme.colors.primary : theme.colors.border)};
  transition: background 0.2s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$active ? '18px' : '2px')};
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: white;
    transition: left 0.2s;
  }
`

const SmallButton = styled.button`
  border: none;
  background: none;
  color: ${theme.colors.gray};
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  flex-shrink: 0;

  &:hover {
    color: ${theme.colors.primary};
  }
`

const AddRuleForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 10px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
`

const FormRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const SmallInput = styled.input`
  flex: 1;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  padding: 6px 8px;
  font-size: 12px;
  color: ${theme.colors.dark};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`

const SmallSelect = styled.select`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  padding: 6px 8px;
  font-size: 12px;
  color: ${theme.colors.dark};
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
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

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 0 0 10px;
`

const EmptyRuleText = styled.p`
  font-size: 12px;
  color: ${theme.colors.gray};
  margin: 0 0 8px;
`

const SmallActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  border: ${(p) => (p.$variant === 'primary' ? 'none' : `1px solid ${theme.colors.border}`)};
  background: ${(p) => (p.$variant === 'primary' ? theme.colors.primary : 'white')};
  color: ${(p) => (p.$variant === 'primary' ? 'white' : theme.colors.dark)};
  border-radius: ${theme.radius.md};
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  margin-top: 6px;

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

const SmallNewRuleButton = styled.button`
  border: none;
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radius.md};
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  margin-top: 4px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.sm};
  }
`

const ProactiveHeaderButton = styled(SmallButton)`
  color: white;
  font-size: 18px;
  margin-left: auto;
`

const TransparentForm = styled(AddRuleForm)`
  border: none;
  padding: 0;
  background: transparent;
  margin-top: 0;
`

const LgpdLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
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

export default function ChatManager({ apiBaseUrl = '', userId, principal }: ChatManagerProps) {
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

  // ─── Proactive Agent State ────────────────────────────────
  const [showProactivePanel, setShowProactivePanel] = useState(false)
  const [proactiveRules, setProactiveRules] = useState<ProactiveRule[]>([])
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRuleTrigger, setNewRuleTrigger] = useState<'interval' | 'event' | 'schedule'>('interval')
  const [newRuleMessage, setNewRuleMessage] = useState('')
  const [newRuleCondition, setNewRuleCondition] = useState('')
  const proactiveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Patient Registration (via Chatbot) ────────────────────────
  const [showPatientRegistration, setShowPatientRegistration] = useState(false)
  const [patientForm, setPatientForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    consultationType: '',
  })
  const [patientLoading, setPatientLoading] = useState(false)
  const [patientError, setPatientError] = useState<string | null>(null)

  // ─── Dental Appointment Scheduling (via Chatbot) ───────────────
  const [showSchedulePanel, setShowSchedulePanel] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    service: '',
    professional: '',
    date: '',
    hour: '',
    duration: '60',
    observations: '',
    lgpdConsent: false,
    lgpdPurpose: 'agendamento_consulta_odontologica',
    lgpdPolicyVersion: '1.0',
  })

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

  // Polling para mensagens proativas
  useEffect(() => {
    if (!userId) return

    fetchProactiveRules()

    // Poll a cada 60 segundos para mensagens proativas
    proactiveIntervalRef.current = setInterval(() => {
      checkProactiveMessages()
    }, 60_000)

    return () => {
      if (proactiveIntervalRef.current) {
        clearInterval(proactiveIntervalRef.current)
      }
    }
  }, [userId])

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
      'Olá! Posso ajudar com dúvidas ou agendamentos. Como posso ajudar?'
    addMessage(welcomeMessage, false, {
      suggestions: ['Agendar serviço', 'Dúvidas sobre serviços', 'Quem Somos', 'Cadastrar paciente'],
    })
  }

  const addMessage = (text: string, isUser: boolean, options: Options = {}, isProactive: boolean = false) => {
    if (!text) {
      text = 'Mensagem vazia ou erro desconhecido.'
    }
    const newMessage: Message = { text, isUser, timestamp: new Date(), options, isProactive }
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
    try {
      const res = await fetch('/api/admin/chatbot/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: message, source: 'both' }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        status?: string
        data?: {
          db?: Array<{
            id: number
            email: string
            name: string | null
            phone: string | null
            role: string
            isActive: boolean
          }>
          api?: Array<{
            method: string
            path: string
            description: string
            tags: string[]
          }>
        }
        mensagem?: string
      }

      if (!res.ok || json.status !== 'sucesso') {
        addMessage(json.mensagem ?? 'Não foi possível processar sua mensagem.', false)
        return
      }

      const parts: string[] = []
      const d = json.data
      if (d?.db && d.db.length > 0) {
        parts.push('**Usuários encontrados:**')
        for (const u of d.db.slice(0, 8)) {
          parts.push(
            `- ${u.name ?? '(sem nome)'} (${u.email}) — ${u.role}${u.isActive ? '' : ' [inativo]'}`,
          )
        }
        if (d.db.length > 8) parts.push(`… e mais ${d.db.length - 8} registro(s).`)
      }
      if (d?.api && d.api.length > 0) {
        parts.push('**Endpoints relacionados:**')
        for (const a of d.api.slice(0, 10)) {
          parts.push(`- **${a.method} ${a.path}**: ${a.description}`)
        }
      }
      if (parts.length === 0) {
        parts.push(
          'Não encontrei resultados para essa busca. Posso ajudar com **agendamento** ou **cadastro de paciente** pelas opções abaixo.',
        )
      }
      addMessage(parts.join('\n'), false)
    } catch {
      addMessage('Erro de conexão. Confirme se o backend Nest está rodando (veja README).', false)
    } finally {
      setTypingIndicator(false)
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const inheritedRoles =
    principal?.roles && principal.roles.length > 0
      ? principal.roles
      : principal?.role
        ? [principal.role]
        : []

  const filteredConsultationOptions = DENTISTRY_CONSULTATION_OPTIONS.filter((option) => {
    const query = patientForm.consultationType.trim().toLowerCase()
    if (!query) return true
    return option.toLowerCase().includes(query)
  }).slice(0, 6)

  const filteredDentalServices = DENTISTRY_APPOINTMENT_SERVICES.filter((option) => {
    const query = scheduleForm.service.trim().toLowerCase()
    if (!query) return true
    return option.toLowerCase().includes(query)
  }).slice(0, 7)

  const handleRegisterPatient = async () => {
    if (patientLoading) return
    setPatientError(null)

    const email = patientForm.email.trim()
    const password = patientForm.password

    if (!email || !password) {
      setPatientError('E-mail e senha são obrigatórios.')
      return
    }

    setPatientLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name: patientForm.name.trim() || undefined,
          phone: patientForm.phone.trim() || undefined,
          consultationType: patientForm.consultationType.trim() || undefined,
          consultationCategory: 'odontologia',
          role: 'paciente',
          roles: inheritedRoles.length > 0 ? inheritedRoles : undefined,
          permissions: principal?.permissions?.length ? principal.permissions : undefined,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        message?: string
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Falha ao cadastrar paciente.')
      }

      addMessage(
        'Paciente cadastrado com sucesso. O administrador poderá acessar com as mesmas roles/permissões do usuário principal.',
        false,
      )

      setShowPatientRegistration(false)
      setPatientForm({ email: '', password: '', name: '', phone: '', consultationType: '' })

      // Garantir que ninguém fique logado após o cadastro.
      await postLogout().catch(() => {})
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar paciente.'
      setPatientError(msg)
      addMessage(msg, false)
    } finally {
      setPatientLoading(false)
    }
  }

  const handleScheduleAppointment = async () => {
    if (scheduleLoading) return
    setScheduleError(null)

    const requiredMissing =
      !scheduleForm.patientName.trim() ||
      !scheduleForm.email.trim() ||
      !scheduleForm.phone.trim() ||
      !scheduleForm.service.trim() ||
      !scheduleForm.date ||
      !scheduleForm.hour

    if (requiredMissing) {
      setScheduleError('Preencha nome, e-mail, telefone, servico, data e horario.')
      return
    }

    if (!scheduleForm.lgpdConsent) {
      setScheduleError('O consentimento LGPD e obrigatorio para concluir o agendamento.')
      return
    }

    setScheduleLoading(true)
    try {
      const payload = {
        date: scheduleForm.date,
        hour: Number(scheduleForm.hour.split(':')[0]),
        duration: Number(scheduleForm.duration) || 60,
        username: scheduleForm.patientName.trim(),
        email: scheduleForm.email.trim(),
        telephone: scheduleForm.phone.trim(),
        service: scheduleForm.service.trim(),
        professional: scheduleForm.professional.trim() || 'A definir',
        typeOfService: 'odontologia',
        type_appointment: 'consulta',
        local: 'clinica odontologica',
        observations: scheduleForm.observations.trim() || undefined,
        lgpd: {
          consentGiven: true,
          consentAt: new Date().toISOString(),
          purpose: scheduleForm.lgpdPurpose,
          policyVersion: scheduleForm.lgpdPolicyVersion,
          legalBasis: 'consentimento_titular',
          dataMinimization: true,
        },
      }

      const res = await fetch('/api/admin/appoiments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as {
        status?: string
        success?: boolean
        mensagem?: string
        message?: string
      }

      const ok = res.ok && (data.success === true || data.status === 'sucesso' || data.status === 'success')
      if (!ok) {
        throw new Error(data.mensagem || data.message || 'Nao foi possivel concluir o agendamento.')
      }

      addMessage(
        `Agendamento odontologico criado para ${scheduleForm.patientName.trim()} em ${scheduleForm.date} as ${scheduleForm.hour}.`,
        false,
      )

      setShowSchedulePanel(false)
      setScheduleForm({
        patientName: '',
        email: '',
        phone: '',
        service: '',
        professional: '',
        date: '',
        hour: '',
        duration: '60',
        observations: '',
        lgpdConsent: false,
        lgpdPurpose: 'agendamento_consulta_odontologica',
        lgpdPolicyVersion: '1.0',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao criar agendamento.'
      setScheduleError(msg)
      addMessage(msg, false)
    } finally {
      setScheduleLoading(false)
    }
  }

  // ─── Proactive Agent Functions ──────────────────────────────

  const fetchProactiveRules = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/admin/proactive/rules?userId=${userId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.status === 'sucesso' && Array.isArray(data.data)) {
        setProactiveRules(data.data)
      }
    } catch (err) {
      console.error('Erro ao buscar regras proativas:', err)
    }
  }

  const checkProactiveMessages = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/admin/proactive/check?userId=${userId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.status === 'sucesso' && Array.isArray(data.data)) {
        for (const msg of data.data) {
          addMessage(msg.message, false, {}, true)
        }
      }
    } catch (err) {
      console.error('Erro ao verificar mensagens proativas:', err)
    }
  }

  const addProactiveRule = async () => {
    if (!userId || !newRuleMessage.trim()) return
    let condition: Record<string, unknown> = {}
    try {
      condition = newRuleCondition.trim() ? JSON.parse(newRuleCondition) : {}
    } catch {
      if (newRuleTrigger === 'interval') {
        condition = { intervalMinutes: parseInt(newRuleCondition) || 30 }
      } else if (newRuleTrigger === 'event') {
        condition = { event: newRuleCondition.trim() }
      } else if (newRuleTrigger === 'schedule') {
        const parts = newRuleCondition.split(':')
        condition = { hour: parseInt(parts[0]) || 0, minute: parseInt(parts[1]) || 0 }
      }
    }
    try {
      const res = await fetch('/api/admin/proactive/rules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trigger: newRuleTrigger,
          condition,
          message: newRuleMessage.trim(),
        }),
      })
      const data = await res.json()
      if (data.status === 'sucesso') {
        setNewRuleMessage('')
        setNewRuleCondition('')
        setShowAddRule(false)
        fetchProactiveRules()
      }
    } catch (err) {
      console.error('Erro ao criar regra proativa:', err)
    }
  }

  const toggleProactiveRule = async (ruleId: number) => {
    try {
      await fetch(`/api/admin/proactive/rules`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'toggle', ruleId }),
      })
      setProactiveRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r)),
      )
    } catch (err) {
      console.error('Erro ao alternar regra proativa:', err)
    }
  }

  const deleteProactiveRule = async (ruleId: number) => {
    try {
      await fetch(`/api/admin/proactive/rules`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'delete', ruleId }),
      })
      setProactiveRules((prev) => prev.filter((r) => r.id !== ruleId))
    } catch (err) {
      console.error('Erro ao remover regra proativa:', err)
    }
  }

  const triggerConditionPlaceholder = () => {
    switch (newRuleTrigger) {
      case 'interval': return 'Minutos (ex.: 30)'
      case 'event': return 'Nome do evento (ex.: new_appointment)'
      case 'schedule': return 'Horário HH:MM (ex.: 09:00)'
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
        {userId && (
          <ProactiveHeaderButton
            onClick={() => setShowProactivePanel((v) => !v)}
            title="Configurar comportamento proativo"
          >
            {showProactivePanel ? '\u2715' : '\u2699'}
          </ProactiveHeaderButton>
        )}
      </Header>

      <Messages ref={chatContainerRef} aria-label="Mensagens do chat">
        {chatHistory.map((msg, index) => (
          <BubbleRow key={index} $isUser={msg.isUser}>
            <Bubble $isUser={msg.isUser}>
              {msg.isProactive && (
                <ProactiveBadge>&#9889; Proativo</ProactiveBadge>
              )}
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
                onClick={() => {
                  if (suggestion === 'Agendar serviço') {
                    setShowSchedulePanel(true)
                    setScheduleError(null)
                    return
                  }
                  if (suggestion === 'Cadastrar paciente') {
                    setShowPatientRegistration(true)
                    setPatientError(null)
                    setPatientForm({ email: '', password: '', name: '', phone: '', consultationType: '' })
                    return
                  }
                  handleSendMessage(suggestion, true)
                }}
              >
                {suggestion}
              </SuggestionButton>
            ))}
          </Suggestions>
        )}
      </Messages>

      {showProactivePanel && userId && (
        <ProactivePanel>
          <PanelTitle>Comportamento Proativo do Agente</PanelTitle>

          {proactiveRules.length === 0 && !showAddRule && (
            <EmptyRuleText>
              Nenhuma regra configurada. O agente pode enviar mensagens automaticamente
              com base em intervalos, horários ou eventos.
            </EmptyRuleText>
          )}

          {proactiveRules.map((rule) => (
            <RuleCard key={rule.id}>
              <RuleInfo>
                <RuleTrigger>{rule.trigger}</RuleTrigger>
                <RuleMessage title={rule.message}>{rule.message}</RuleMessage>
              </RuleInfo>
              <ToggleButton
                $active={rule.isActive}
                onClick={() => toggleProactiveRule(rule.id)}
                title={rule.isActive ? 'Desativar' : 'Ativar'}
              />
              <SmallButton onClick={() => deleteProactiveRule(rule.id)} title="Remover">
                &#128465;
              </SmallButton>
            </RuleCard>
          ))}

          {showAddRule ? (
            <AddRuleForm>
              <FormRow>
                <SmallSelect
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value as 'interval' | 'event' | 'schedule')}
                >
                  <option value="interval">Intervalo</option>
                  <option value="schedule">Horário</option>
                  <option value="event">Evento</option>
                </SmallSelect>
                <SmallInput
                  placeholder={triggerConditionPlaceholder()}
                  value={newRuleCondition}
                  onChange={(e) => setNewRuleCondition(e.target.value)}
                />
              </FormRow>
              <SmallInput
                placeholder="Mensagem que o agente enviará..."
                value={newRuleMessage}
                onChange={(e) => setNewRuleMessage(e.target.value)}
              />
              <FormRow>
                <SmallActionButton
                  type="button"
                  $variant="primary"
                  onClick={addProactiveRule}
                  disabled={!newRuleMessage.trim()}
                >
                  Salvar
                </SmallActionButton>
                <SmallActionButton
                  type="button"
                  $variant="secondary"
                  onClick={() => setShowAddRule(false)}
                >
                  Cancelar
                </SmallActionButton>
              </FormRow>
            </AddRuleForm>
          ) : (
            <SmallNewRuleButton
              type="button"
              onClick={() => setShowAddRule(true)}
            >
              + Nova regra
            </SmallNewRuleButton>
          )}
        </ProactivePanel>
      )}

      {showPatientRegistration && (
        <RegistrationPanel>
          <PanelTitle>Cadastro de Paciente</PanelTitle>

          {patientError && (
            <ErrorText>
              {patientError}
            </ErrorText>
          )}

          <TransparentForm>
            <FormRow>
              <SmallInput
                placeholder="E-mail do paciente"
                value={patientForm.email}
                onChange={(e) => setPatientForm((p) => ({ ...p, email: e.target.value }))}
                type="email"
                autoComplete="email"
              />
              <SmallInput
                placeholder="Senha"
                value={patientForm.password}
                onChange={(e) => setPatientForm((p) => ({ ...p, password: e.target.value }))}
                type="password"
                autoComplete="new-password"
              />
            </FormRow>

            <FormRow>
              <SmallInput
                placeholder="Nome (opcional)"
                value={patientForm.name}
                onChange={(e) => setPatientForm((p) => ({ ...p, name: e.target.value }))}
                type="text"
              />
              <SmallInput
                placeholder="Telefone (opcional)"
                value={patientForm.phone}
                onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))}
                type="tel"
              />
            </FormRow>

            <SmallInput
              placeholder="Consulta odontologica (ex.: limpeza, canal, implante)"
              value={patientForm.consultationType}
              onChange={(e) => setPatientForm((p) => ({ ...p, consultationType: e.target.value }))}
              type="text"
            />
            <Suggestions aria-label="Sugestoes de consulta odontologica">
              {filteredConsultationOptions.map((option) => (
                <SuggestionButton
                  key={option}
                  type="button"
                  onClick={() => setPatientForm((p) => ({ ...p, consultationType: option }))}
                >
                  {option}
                </SuggestionButton>
              ))}
            </Suggestions>

            <FormRow>
              <SmallActionButton
                type="button"
                $variant="primary"
                onClick={handleRegisterPatient}
                disabled={
                  patientLoading || !patientForm.email.trim() || patientForm.password.length < 1
                }
              >
                {patientLoading ? 'Cadastrando...' : 'Cadastrar'}
              </SmallActionButton>
              <SmallActionButton
                type="button"
                $variant="secondary"
                onClick={() => setShowPatientRegistration(false)}
                disabled={patientLoading}
              >
                Cancelar
              </SmallActionButton>
            </FormRow>
          </TransparentForm>
        </RegistrationPanel>
      )}

      {showSchedulePanel && (
        <RegistrationPanel>
          <PanelTitle>Agendamento Odontologico</PanelTitle>

          {scheduleError && (
            <ErrorText>
              {scheduleError}
            </ErrorText>
          )}

          <TransparentForm>
            <FormRow>
              <SmallInput
                placeholder="Nome completo do cliente"
                value={scheduleForm.patientName}
                onChange={(e) => setScheduleForm((p) => ({ ...p, patientName: e.target.value }))}
                type="text"
              />
              <SmallInput
                placeholder="E-mail"
                value={scheduleForm.email}
                onChange={(e) => setScheduleForm((p) => ({ ...p, email: e.target.value }))}
                type="email"
              />
            </FormRow>

            <FormRow>
              <SmallInput
                placeholder="Telefone"
                value={scheduleForm.phone}
                onChange={(e) => setScheduleForm((p) => ({ ...p, phone: e.target.value }))}
                type="tel"
              />
              <SmallInput
                placeholder="Profissional (opcional)"
                value={scheduleForm.professional}
                onChange={(e) => setScheduleForm((p) => ({ ...p, professional: e.target.value }))}
                type="text"
              />
            </FormRow>

            <SmallInput
              placeholder="Servico odontologico (ex.: limpeza, canal, implante)"
              value={scheduleForm.service}
              onChange={(e) => setScheduleForm((p) => ({ ...p, service: e.target.value }))}
              type="text"
            />
            <Suggestions aria-label="Sugestoes de servicos odontologicos">
              {filteredDentalServices.map((option) => (
                <SuggestionButton
                  key={option}
                  type="button"
                  onClick={() => setScheduleForm((p) => ({ ...p, service: option }))}
                >
                  {option}
                </SuggestionButton>
              ))}
            </Suggestions>

            <FormRow>
              <SmallInput
                placeholder="Data"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))}
                type="date"
              />
              <SmallInput
                placeholder="Horario"
                value={scheduleForm.hour}
                onChange={(e) => setScheduleForm((p) => ({ ...p, hour: e.target.value }))}
                type="time"
              />
            </FormRow>

            <FormRow>
              <SmallInput
                placeholder="Duracao (min)"
                value={scheduleForm.duration}
                onChange={(e) => setScheduleForm((p) => ({ ...p, duration: e.target.value }))}
                type="number"
                min="15"
                step="15"
              />
              <SmallInput
                placeholder="Finalidade LGPD"
                value={scheduleForm.lgpdPurpose}
                onChange={(e) => setScheduleForm((p) => ({ ...p, lgpdPurpose: e.target.value }))}
                type="text"
              />
            </FormRow>

            <SmallInput
              placeholder="Observacoes (opcional)"
              value={scheduleForm.observations}
              onChange={(e) => setScheduleForm((p) => ({ ...p, observations: e.target.value }))}
              type="text"
            />

            <LgpdLabel>
              <input
                type="checkbox"
                checked={scheduleForm.lgpdConsent}
                onChange={(e) => setScheduleForm((p) => ({ ...p, lgpdConsent: e.target.checked }))}
              />
              Autorizo o tratamento dos meus dados para agendamento odontologico (LGPD).
            </LgpdLabel>

            <FormRow>
              <SmallActionButton
                type="button"
                $variant="primary"
                onClick={handleScheduleAppointment}
                disabled={scheduleLoading}
              >
                {scheduleLoading ? 'Agendando...' : 'Confirmar agendamento'}
              </SmallActionButton>
              <SmallActionButton
                type="button"
                $variant="secondary"
                onClick={() => setShowSchedulePanel(false)}
                disabled={scheduleLoading}
              >
                Cancelar
              </SmallActionButton>
            </FormRow>
          </TransparentForm>
        </RegistrationPanel>
      )}

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