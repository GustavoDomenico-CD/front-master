import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/require-admin'
import {
  deleteLease,
  deleteRoom,
  updateLease,
  updateRoom,
} from '@/app/lib/room-rentals-store'
import type { RoomBillingDisplay } from '@/app/types/room-rentals'

export const runtime = 'nodejs'

type Kind = 'room' | 'lease'

function getKind(request: Request): Kind | null {
  const u = new URL(request.url)
  const k = u.searchParams.get('kind')
  if (k === 'room' || k === 'lease') return k
  return null
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const kind = getKind(request)
  if (!kind) {
    return NextResponse.json({ error: 'Parâmetro kind=room|lease é obrigatório.' }, { status: 400 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (kind === 'room') {
    const patch = {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      priceDaily: body.priceDaily != null ? Number(body.priceDaily) : undefined,
      priceMonthly: body.priceMonthly != null ? Number(body.priceMonthly) : undefined,
      conditions: typeof body.conditions === 'string' ? body.conditions.trim() : undefined,
    }
    if (patch.priceDaily != null && (Number.isNaN(patch.priceDaily) || patch.priceDaily < 0)) {
      return NextResponse.json({ error: 'Preço diário inválido.' }, { status: 400 })
    }
    if (patch.priceMonthly != null && (Number.isNaN(patch.priceMonthly) || patch.priceMonthly < 0)) {
      return NextResponse.json({ error: 'Preço mensal inválido.' }, { status: 400 })
    }
    const updated = await updateRoom(id, patch)
    if (!updated) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updated })
  }

  const billing = body.billingPeriod as RoomBillingDisplay | undefined
  if (billing != null && billing !== 'daily' && billing !== 'monthly') {
    return NextResponse.json({ error: 'Período de cobrança inválido.' }, { status: 400 })
  }

  const patchLease = {
    roomId: typeof body.roomId === 'string' ? body.roomId.trim() : undefined,
    tenantName: typeof body.tenantName === 'string' ? body.tenantName.trim() : undefined,
    tenantEmail:
      typeof body.tenantEmail === 'string'
        ? body.tenantEmail.trim() || undefined
        : undefined,
    tenantPhone:
      typeof body.tenantPhone === 'string'
        ? body.tenantPhone.trim() || undefined
        : undefined,
    billingPeriod: billing,
    pricePaid: body.pricePaid != null ? Number(body.pricePaid) : undefined,
    startDate: typeof body.startDate === 'string' ? body.startDate.trim() : undefined,
    endDate: typeof body.endDate === 'string' ? body.endDate.trim() : undefined,
    inService: typeof body.inService === 'boolean' ? body.inService : undefined,
    notes: typeof body.notes === 'string' ? body.notes.trim() || undefined : undefined,
  }

  if (patchLease.pricePaid != null && (Number.isNaN(patchLease.pricePaid) || patchLease.pricePaid < 0)) {
    return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 })
  }

  const updatedLease = await updateLease(id, patchLease)
  if (!updatedLease) {
    return NextResponse.json({ error: 'Locação não encontrada.' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: updatedLease })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const kind = getKind(request)
  if (!kind) {
    return NextResponse.json({ error: 'Parâmetro kind=room|lease é obrigatório.' }, { status: 400 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  }

  const ok = kind === 'room' ? await deleteRoom(id) : await deleteLease(id)
  if (!ok) {
    return NextResponse.json({ error: 'Registro não encontrado.' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
