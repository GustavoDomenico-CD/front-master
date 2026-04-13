import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/require-admin'

const ADMIN_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  admin: [
    'appointments:manage',
    'room-rentals:manage',
    'chatbot:manage',
    'whatsapp:manage',
    'users:view',
  ],
}

export async function requirePermission(
  request: Request,
  anyOf: string[]
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth
  const role = auth.profile.role.toLowerCase()
  const rolePermissions = ADMIN_PERMISSIONS[role] ?? []
  const allowed = rolePermissions.includes('*') || anyOf.some((perm) => rolePermissions.includes(perm))
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sem permissão para esta ação.' }, { status: 403 }),
    }
  }
  return { ok: true }
}
