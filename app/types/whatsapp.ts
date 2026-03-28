export type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'qr_pending'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive'

export interface WhatsAppConfig {
  id: number
  instanceName: string
  phoneNumber: string
  apiKey: string
  webhookUrl: string
  status: WhatsAppConnectionStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WhatsAppContact {
  id: number
  phoneNumber: string
  name: string
  profilePicUrl?: string
  isBlocked: boolean
  lastMessageAt?: string
  tags: string
  createdAt: string
  updatedAt: string
}

export interface WhatsAppMessage {
  id: number
  contactId: number
  contact?: WhatsAppContact
  direction: MessageDirection
  type: MessageType
  content: string
  mediaUrl?: string
  status: MessageStatus
  externalId?: string
  templateName?: string
  sentAt: string
  deliveredAt?: string
  readAt?: string
  createdAt: string
}

export interface WhatsAppTemplate {
  id: number
  name: string
  category: string
  language: string
  content: string
  variables: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WhatsAppKPIs {
  totalMessages: number
  sentMessages: number
  receivedMessages: number
  deliveredRate: number
  readRate: number
  failedMessages: number
  totalContacts: number
  activeContacts: number
  templatesCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pages: number
}
