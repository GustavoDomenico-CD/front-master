type Permission =
  | 'dashboard:view'
  | 'appointments:manage'
  | 'room-rentals:manage'
  | 'chatbot:manage'
  | 'whatsapp:manage'
  | 'users:view'
  | 'users:edit'
  | 'patient:access'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: [
    'dashboard:view',
    'appointments:manage',
    'room-rentals:manage',
    'chatbot:manage',
    'whatsapp:manage',
    'users:view',
    'users:edit',
    'patient:access',
  ],
  admin: [
    'dashboard:view',
    'appointments:manage',
    'room-rentals:manage',
    'chatbot:manage',
    'whatsapp:manage',
    'users:view',
  ],
  paciente: ['patient:access'],
  user: ['dashboard:view'],
}

export type { Permission }

export function resolvePermissions(user?: { role?: string; permissions?: string[]; roles?: string[] } | null): string[] {
  if (!user) return []
  const explicit = Array.isArray(user.permissions) ? user.permissions.filter(Boolean) : []
  if (explicit.length > 0) return explicit
  const roleSet = new Set<string>()
  if (typeof user.role === 'string' && user.role.trim()) roleSet.add(user.role.toLowerCase())
  if (Array.isArray(user.roles)) {
    for (const role of user.roles) {
      if (role && typeof role === 'string') roleSet.add(role.toLowerCase())
    }
  }
  const permissions = new Set<string>()
  for (const role of roleSet) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) permissions.add(p)
  }
  return Array.from(permissions)
}

export function can(
  user: { role?: string; permissions?: string[]; roles?: string[] } | null | undefined,
  permission: string
): boolean {
  return resolvePermissions(user).includes(permission)
}

export function canAny(
  user: { role?: string; permissions?: string[]; roles?: string[] } | null | undefined,
  permissions: string[]
): boolean {
  const resolved = resolvePermissions(user)
  return permissions.some((permission) => resolved.includes(permission))
}

export function canAll(
  user: { role?: string; permissions?: string[]; roles?: string[] } | null | undefined,
  permissions: string[]
): boolean {
  const resolved = resolvePermissions(user)
  return permissions.every((permission) => resolved.includes(permission))
}
