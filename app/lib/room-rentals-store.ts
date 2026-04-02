import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { RoomDefinition, RoomLease, RoomRentalsPayload } from '@/app/types/room-rentals'

const FILE = path.join(process.cwd(), 'data', 'room-rentals.json')

function emptyPayload(): RoomRentalsPayload {
  return { rooms: [], leases: [] }
}

async function ensureDir(): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true })
}

export async function loadRoomRentals(): Promise<RoomRentalsPayload> {
  try {
    const raw = await readFile(FILE, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Array.isArray((parsed as RoomRentalsPayload).rooms) &&
      Array.isArray((parsed as RoomRentalsPayload).leases)
    ) {
      return parsed as RoomRentalsPayload
    }
  } catch {
    /* arquivo ausente ou inválido */
  }
  return emptyPayload()
}

export async function saveRoomRentals(data: RoomRentalsPayload): Promise<void> {
  await ensureDir()
  await writeFile(FILE, JSON.stringify(data, null, 2), 'utf8')
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function addRoom(room: Omit<RoomDefinition, 'id'>): Promise<RoomDefinition> {
  const data = await loadRoomRentals()
  const created: RoomDefinition = { ...room, id: newId() }
  data.rooms.push(created)
  await saveRoomRentals(data)
  return created
}

export async function updateRoom(id: string, patch: Partial<RoomDefinition>): Promise<RoomDefinition | null> {
  const data = await loadRoomRentals()
  const idx = data.rooms.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const prev = data.rooms[idx]
  const next: RoomDefinition = { ...prev, id }
  for (const [k, v] of Object.entries(patch) as [keyof RoomDefinition, RoomDefinition[keyof RoomDefinition]][]) {
    if (v !== undefined) (next as unknown as Record<string, unknown>)[k as string] = v
  }
  data.rooms[idx] = next
  await saveRoomRentals(data)
  return next
}

export async function deleteRoom(id: string): Promise<boolean> {
  const data = await loadRoomRentals()
  const before = data.rooms.length
  data.rooms = data.rooms.filter((r) => r.id !== id)
  data.leases = data.leases.filter((l) => l.roomId !== id)
  if (data.rooms.length === before) return false
  await saveRoomRentals(data)
  return true
}

export async function addLease(lease: Omit<RoomLease, 'id'>): Promise<RoomLease> {
  const data = await loadRoomRentals()
  const created: RoomLease = { ...lease, id: newId() }
  data.leases.push(created)
  await saveRoomRentals(data)
  return created
}

export async function updateLease(id: string, patch: Partial<RoomLease>): Promise<RoomLease | null> {
  const data = await loadRoomRentals()
  const idx = data.leases.findIndex((l) => l.id === id)
  if (idx < 0) return null
  const prev = data.leases[idx]
  const next: RoomLease = { ...prev, id }
  for (const [k, v] of Object.entries(patch) as [keyof RoomLease, RoomLease[keyof RoomLease]][]) {
    if (v !== undefined) (next as unknown as Record<string, unknown>)[k as string] = v
  }
  data.leases[idx] = next
  await saveRoomRentals(data)
  return next
}

export async function deleteLease(id: string): Promise<boolean> {
  const data = await loadRoomRentals()
  const before = data.leases.length
  data.leases = data.leases.filter((l) => l.id !== id)
  if (data.leases.length === before) return false
  await saveRoomRentals(data)
  return true
}
