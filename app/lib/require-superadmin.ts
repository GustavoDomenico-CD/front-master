import { NextResponse } from 'next/server'
import { requireAdmin, type AdminProfile } from '@/app/lib/require-admin'

export async function requireSuperadmin(request: Request): Promise<
  | { ok: true; profile: AdminProfile }
  | { ok: false; response: NextResponse }
> {
  const gate = await requireAdmin(request)
  if (!gate.ok) return gate
  if ((gate.profile.role ?? '').toLowerCase() !== 'superadmin') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Apenas superadmin pode executar esta ação.' },
        { status: 403 },
      ),
    }
  }
  return gate
}
