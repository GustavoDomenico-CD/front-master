import { apiRequest, ensureApiSuccess, extractApiMessage, parseApiObject } from '@/app/lib/backend'

export type UserRoleUpdateInput = {
  name?: string
  role?: string
  email?: string
  is_active?: boolean
}

export async function fetchUsersList(): Promise<unknown[]> {
  const res = await apiRequest('/api/users')
  const payload = await ensureApiSuccess(res, 'Não foi possível carregar os usuários.')
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.users)) return payload.users
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.usuarios)) return payload.usuarios
  return []
}

export async function fetchAvailableRoles(): Promise<string[]> {
  const res = await apiRequest('/api/users/roles')
  const payload = await parseApiObject(res)
  if (!res.ok || !Array.isArray(payload)) return []
  return payload.map(String)
}

export async function patchUser(id: string | number, body: UserRoleUpdateInput): Promise<void> {
  const res = await apiRequest(`/api/users/${encodeURIComponent(String(id))}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const payload = await parseApiObject(res)
    throw new Error(extractApiMessage(payload, 'Falha ao atualizar usuário.'))
  }
}
