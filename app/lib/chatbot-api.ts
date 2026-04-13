import { apiRequest, extractApiMessage, parseApiObject } from '@/app/lib/backend'

export async function searchChatbot(query: string): Promise<Record<string, unknown>> {
  const res = await apiRequest('/api/admin/chatbot/search', {
    method: 'POST',
    body: JSON.stringify({ query, source: 'both' }),
  })
  const payload = await parseApiObject(res)
  if (!res.ok) {
    throw new Error(extractApiMessage(payload, 'Não foi possível processar sua mensagem.'))
  }
  return payload
}

export async function registerPatientByChatbot(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiRequest('/api/chatbot/cadastro', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const payload = await parseApiObject(res)
  if (!res.ok) {
    throw new Error(extractApiMessage(payload, 'Falha ao cadastrar paciente.'))
  }
  return payload
}

export async function createChatbotAppointment(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiRequest('/api/admin/appoiments/create', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const payload = await parseApiObject(res)
  if (!res.ok) {
    throw new Error(extractApiMessage(payload, 'Nao foi possivel concluir o agendamento.'))
  }
  return payload
}

export async function fetchProactiveRules(userId: number): Promise<Record<string, unknown>> {
  const res = await apiRequest(`/api/admin/proactive/rules?userId=${userId}`)
  return parseApiObject(res)
}

export async function checkProactiveMessages(userId: number): Promise<Record<string, unknown>> {
  const res = await apiRequest(`/api/admin/proactive/check?userId=${userId}`)
  return parseApiObject(res)
}

export async function mutateProactiveRules(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiRequest('/api/admin/proactive/rules', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return parseApiObject(res)
}
