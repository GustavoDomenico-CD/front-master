import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/lib/require-admin'
import {
  addLease,
  addRoom,
  loadRoomRentals,
} from '@/app/lib/room-rentals-store'
import type { RoomBillingDisplay } from '@/app/types/room-rentals'

export const runtime = 'nodejs'

/** Lista salas, preços e locações (persistência local em data/room-rentals.json). */
export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const data = await loadRoomRentals()
  return NextResponse.json({ success: true, data })
}

type PostBody =
  | {
      kind: 'room'
      name: string
      priceDaily: number
      priceMonthly: number
      conditions: string
    }
  | {
      kind: 'lease'
      roomId: string
      tenantName: string
      tenantEmail?: string
      tenantPhone?: string
      billingPeriod: RoomBillingDisplay
      pricePaid: number
      startDate: string
      endDate: string
      inService: boolean
      notes?: string
    }

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (body.kind === 'room') {
    const name = (body.name ?? '').trim()
    if (!name) {
      return NextResponse.json({ error: 'Nome da sala é obrigatório.' }, { status: 400 })
    }
    const priceDaily = Number(body.priceDaily)
    const priceMonthly = Number(body.priceMonthly)
    if (Number.isNaN(priceDaily) || Number.isNaN(priceMonthly) || priceDaily < 0 || priceMonthly < 0) {
      return NextResponse.json({ error: 'Preços inválidos.' }, { status: 400 })
    }
    const created = await addRoom({
      name,
      priceDaily,
      priceMonthly,
      conditions: (body.conditions ?? '').trim(),
    })
    return NextResponse.json({ success: true, data: created })
  }

  if (body.kind === 'lease') {
    const tenantName = (body.tenantName ?? '').trim()
    if (!tenantName || !(body.roomId ?? '').trim()) {
      return NextResponse.json({ error: 'Sala e locatário são obrigatórios.' }, { status: 400 })
    }
    if (body.billingPeriod !== 'daily' && body.billingPeriod !== 'monthly') {
      return NextResponse.json({ error: 'Período de cobrança inválido.' }, { status: 400 })
    }
    const pricePaid = Number(body.pricePaid)
    if (Number.isNaN(pricePaid) || pricePaid < 0) {
      return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 })
    }
    const start = (body.startDate ?? '').trim()
    const end = (body.endDate ?? '').trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return NextResponse.json({ error: 'Datas devem estar no formato YYYY-MM-DD.' }, { status: 400 })
    }
    if (start > end) {
      return NextResponse.json({ error: 'Data de início não pode ser posterior ao fim.' }, { status: 400 })
    }
    const created = await addLease({
      roomId: body.roomId.trim(),
      tenantName,
      tenantEmail: body.tenantEmail?.trim() || undefined,
      tenantPhone: body.tenantPhone?.trim() || undefined,
      billingPeriod: body.billingPeriod,
      pricePaid,
      startDate: start,
      endDate: end,
      inService: Boolean(body.inService),
      notes: body.notes?.trim() || undefined,
    })
    return NextResponse.json({ success: true, data: created })
  }

  return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
}
