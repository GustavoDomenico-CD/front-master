'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
  createRoomDefinition,
  createRoomLease,
  deleteRoomDefinition,
  deleteRoomLease,
  fetchRoomRentals,
  updateRoomDefinition,
  updateRoomLease,
} from '@/app/lib/backend'
import type { RoomDefinition, RoomLease, RoomRentalsPayload } from '@/app/types/room-rentals'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Section = styled.section`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
`

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 17px;
  color: #1f2937;
`

const SectionDesc = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`

const Table = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13px;
`

const Th = styled.th`
  text-align: left;
  padding: 10px 12px;
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e5e7eb;
`

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: top;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
`

const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
`

const TextArea = styled.textarea`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  min-height: 72px;
  resize: vertical;
`

const Select = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Btn = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${(p) =>
    p.$variant === 'danger' ? '#ef4444' : p.$variant === 'secondary' ? '#f1f5f9' : '#3b82f6'};
  color: ${(p) => (p.$variant === 'secondary' ? '#334155' : '#fff')};
`

const Badge = styled.span<{ $tone: 'ok' | 'warn' | 'muted' | 'bad' }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${(p) =>
    p.$tone === 'ok' ? '#dcfce7' : p.$tone === 'warn' ? '#fef9c3' : p.$tone === 'bad' ? '#fee2e2' : '#f1f5f9'};
  color: ${(p) =>
    p.$tone === 'ok' ? '#166534' : p.$tone === 'warn' ? '#854d0e' : p.$tone === 'bad' ? '#991b1b' : '#475569'};
`

const ErrorBox = styled.div`
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 10px;
`

function formatMoney(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function leaseWindowStatus(start: string, end: string): 'futura' | 'ativa' | 'encerrada' {
  const t = todayStr()
  if (end < t) return 'encerrada'
  if (start > t) return 'futura'
  return 'ativa'
}

function inclusiveDays(start: string, end: string): number {
  const a = new Date(start + 'T12:00:00').getTime()
  const b = new Date(end + 'T12:00:00').getTime()
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1)
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export default function RoomRentalsPanel() {
  const [data, setData] = useState<RoomRentalsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [roomForm, setRoomForm] = useState({
    name: '',
    priceDaily: '',
    priceMonthly: '',
    conditions: '',
  })
  const [leaseForm, setLeaseForm] = useState({
    roomId: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    billingPeriod: 'daily' as 'daily' | 'monthly',
    pricePaid: '',
    startDate: '',
    endDate: '',
    inService: true,
    notes: '',
  })

  const [editingRoom, setEditingRoom] = useState<RoomDefinition | null>(null)
  const [editingLease, setEditingLease] = useState<RoomLease | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await fetchRoomRentals()
      setData(payload)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const roomById = useMemo(() => {
    const m = new Map<string, RoomDefinition>()
    data?.rooms.forEach((r) => m.set(r.id, r))
    return m
  }, [data])

  const sortedLeases = useMemo(() => {
    if (!data) return []
    return [...data.leases].sort((a, b) => {
      if (a.endDate !== b.endDate) return a.endDate < b.endDate ? 1 : -1
      return a.startDate < b.startDate ? 1 : -1
    })
  }, [data])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomForm.name.trim()) return
    await createRoomDefinition({
      name: roomForm.name.trim(),
      priceDaily: Number(roomForm.priceDaily) || 0,
      priceMonthly: Number(roomForm.priceMonthly) || 0,
      conditions: roomForm.conditions.trim(),
    })
    setRoomForm({ name: '', priceDaily: '', priceMonthly: '', conditions: '' })
    await load()
  }

  const handleSaveEditRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return
    await updateRoomDefinition(editingRoom.id, {
      name: editingRoom.name.trim(),
      priceDaily: Number(editingRoom.priceDaily),
      priceMonthly: Number(editingRoom.priceMonthly),
      conditions: editingRoom.conditions.trim(),
    })
    setEditingRoom(null)
    await load()
  }

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaseForm.roomId || !leaseForm.tenantName.trim() || !leaseForm.startDate || !leaseForm.endDate) return
    await createRoomLease({
      roomId: leaseForm.roomId,
      tenantName: leaseForm.tenantName.trim(),
      tenantEmail: leaseForm.tenantEmail.trim() || undefined,
      tenantPhone: leaseForm.tenantPhone.trim() || undefined,
      billingPeriod: leaseForm.billingPeriod,
      pricePaid: Number(leaseForm.pricePaid) || 0,
      startDate: leaseForm.startDate,
      endDate: leaseForm.endDate,
      inService: leaseForm.inService,
      notes: leaseForm.notes.trim() || undefined,
    })
    setLeaseForm({
      roomId: '',
      tenantName: '',
      tenantEmail: '',
      tenantPhone: '',
      billingPeriod: 'daily',
      pricePaid: '',
      startDate: '',
      endDate: '',
      inService: true,
      notes: '',
    })
    await load()
  }

  const handleSaveEditLease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLease) return
    await updateRoomLease(editingLease.id, {
      roomId: editingLease.roomId,
      tenantName: editingLease.tenantName.trim(),
      tenantEmail: editingLease.tenantEmail?.trim() || undefined,
      tenantPhone: editingLease.tenantPhone?.trim() || undefined,
      billingPeriod: editingLease.billingPeriod,
      pricePaid: Number(editingLease.pricePaid),
      startDate: editingLease.startDate,
      endDate: editingLease.endDate,
      inService: editingLease.inService,
      notes: editingLease.notes?.trim() || undefined,
    })
    setEditingLease(null)
    await load()
  }

  if (loading && !data) {
    return <SectionDesc>Carregando aluguel de salas...</SectionDesc>
  }

  return (
    <Wrap>
      {error && <ErrorBox>{error}</ErrorBox>}

      <Section>
        <SectionTitle>Preços e condições das salas</SectionTitle>
        <SectionDesc>
          Cadastre cada sala com valores diários e mensais e as condições comerciais. Apenas administradores
          podem alterar esta seção.
        </SectionDesc>

        <form onSubmit={handleCreateRoom}>
          <FormGrid>
            <Label>
              Nome da sala
              <Input
                value={roomForm.name}
                onChange={(e) => setRoomForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Ex.: Sala 1"
                required
              />
            </Label>
            <Label>
              Preço diário (R$)
              <Input
                type="number"
                min={0}
                step={0.01}
                value={roomForm.priceDaily}
                onChange={(e) => setRoomForm((s) => ({ ...s, priceDaily: e.target.value }))}
              />
            </Label>
            <Label>
              Preço mensal (R$)
              <Input
                type="number"
                min={0}
                step={0.01}
                value={roomForm.priceMonthly}
                onChange={(e) => setRoomForm((s) => ({ ...s, priceMonthly: e.target.value }))}
              />
            </Label>
          </FormGrid>
          <Label>
            Condições
            <TextArea
              value={roomForm.conditions}
              onChange={(e) => setRoomForm((s) => ({ ...s, conditions: e.target.value }))}
              placeholder="Ex.: caução, horário de uso, limpeza..."
            />
          </Label>
          <BtnRow style={{ marginTop: 10 }}>
            <Btn type="submit">Adicionar sala</Btn>
          </BtnRow>
        </form>

        <TableWrap style={{ marginTop: 16 }}>
          <Table>
            <thead>
              <tr>
                <Th>Sala</Th>
                <Th>Diária</Th>
                <Th>Mensal</Th>
                <Th>Condições</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {(data?.rooms ?? []).length === 0 ? (
                <tr>
                  <Td colSpan={5}>
                    Nenhuma sala cadastrada.
                  </Td>
                </tr>
              ) : (
                (data?.rooms ?? []).map((r) => (
                  <tr key={r.id}>
                    <Td>{r.name}</Td>
                    <Td>{formatMoney(r.priceDaily)}</Td>
                    <Td>{formatMoney(r.priceMonthly)}</Td>
                    <Td style={{ maxWidth: 280 }}>{r.conditions || '—'}</Td>
                    <Td>
                      <BtnRow>
                        <Btn type="button" $variant="secondary" onClick={() => setEditingRoom({ ...r })}>
                          Editar
                        </Btn>
                        <Btn
                          type="button"
                          $variant="danger"
                          onClick={async () => {
                            if (!confirm('Excluir esta sala e locações vinculadas?')) return
                            await deleteRoomDefinition(r.id)
                            await load()
                          }}
                        >
                          Excluir
                        </Btn>
                      </BtnRow>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrap>

        {editingRoom && (
          <form onSubmit={handleSaveEditRoom} style={{ marginTop: 16 }}>
            <SectionTitle style={{ fontSize: 15 }}>Editar sala</SectionTitle>
            <FormGrid>
              <Label>
                Nome
                <Input
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom((s) => (s ? { ...s, name: e.target.value } : s))}
                  required
                />
              </Label>
              <Label>
                Preço diário
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editingRoom.priceDaily}
                  onChange={(e) =>
                    setEditingRoom((s) => (s ? { ...s, priceDaily: Number(e.target.value) } : s))
                  }
                />
              </Label>
              <Label>
                Preço mensal
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editingRoom.priceMonthly}
                  onChange={(e) =>
                    setEditingRoom((s) => (s ? { ...s, priceMonthly: Number(e.target.value) } : s))
                  }
                />
              </Label>
            </FormGrid>
            <Label>
              Condições
              <TextArea
                value={editingRoom.conditions}
                onChange={(e) => setEditingRoom((s) => (s ? { ...s, conditions: e.target.value } : s))}
              />
            </Label>
            <BtnRow style={{ marginTop: 10 }}>
              <Btn type="submit">Salvar</Btn>
              <Btn type="button" $variant="secondary" onClick={() => setEditingRoom(null)}>
                Cancelar
              </Btn>
            </BtnRow>
          </form>
        )}
      </Section>

      <Section>
        <SectionTitle>Locações e uso das salas</SectionTitle>
        <SectionDesc>
          Registre quem alugou, o valor acordado (diário ou mensal), período do contrato (até quando a sala
          fica reservada), duração em dias e se está em atendimento no período atual.
        </SectionDesc>

        <form onSubmit={handleCreateLease}>
          <FormGrid>
            <Label>
              Sala
              <Select
                value={leaseForm.roomId}
                onChange={(e) => setLeaseForm((s) => ({ ...s, roomId: e.target.value }))}
                required
              >
                <option value="">Selecione...</option>
                {(data?.rooms ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Locatário
              <Input
                value={leaseForm.tenantName}
                onChange={(e) => setLeaseForm((s) => ({ ...s, tenantName: e.target.value }))}
                required
              />
            </Label>
            <Label>
              E-mail
              <Input
                type="email"
                value={leaseForm.tenantEmail}
                onChange={(e) => setLeaseForm((s) => ({ ...s, tenantEmail: e.target.value }))}
              />
            </Label>
            <Label>
              Telefone
              <Input
                value={leaseForm.tenantPhone}
                onChange={(e) => setLeaseForm((s) => ({ ...s, tenantPhone: e.target.value }))}
              />
            </Label>
            <Label>
              Cobrança
              <Select
                value={leaseForm.billingPeriod}
                onChange={(e) =>
                  setLeaseForm((s) => ({ ...s, billingPeriod: e.target.value as 'daily' | 'monthly' }))
                }
              >
                <option value="daily">Diária</option>
                <option value="monthly">Mensal</option>
              </Select>
            </Label>
            <Label>
              Valor (R$)
              <Input
                type="number"
                min={0}
                step={0.01}
                value={leaseForm.pricePaid}
                onChange={(e) => setLeaseForm((s) => ({ ...s, pricePaid: e.target.value }))}
              />
            </Label>
            <Label>
              Início
              <Input
                type="date"
                value={leaseForm.startDate}
                onChange={(e) => setLeaseForm((s) => ({ ...s, startDate: e.target.value }))}
                required
              />
            </Label>
            <Label>
              Fim (alugada até)
              <Input
                type="date"
                value={leaseForm.endDate}
                onChange={(e) => setLeaseForm((s) => ({ ...s, endDate: e.target.value }))}
                required
              />
            </Label>
            <Label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={leaseForm.inService}
                onChange={(e) => setLeaseForm((s) => ({ ...s, inService: e.target.checked }))}
              />
              Em atendimento
            </Label>
          </FormGrid>
          <Label>
            Observações
            <TextArea
              value={leaseForm.notes}
              onChange={(e) => setLeaseForm((s) => ({ ...s, notes: e.target.value }))}
            />
          </Label>
          <BtnRow style={{ marginTop: 10 }}>
            <Btn type="submit">Registrar locação</Btn>
          </BtnRow>
        </form>

        <TableWrap style={{ marginTop: 16 }}>
          <Table>
            <thead>
              <tr>
                <Th>Sala</Th>
                <Th>Locatário</Th>
                <Th>Contato</Th>
                <Th>Cobrança</Th>
                <Th>Valor</Th>
                <Th>Período</Th>
                <Th>Até quando</Th>
                <Th>Duração</Th>
                <Th>Status período</Th>
                <Th>Atendimento</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {sortedLeases.length === 0 ? (
                <tr>
                  <Td colSpan={11}>
                    Nenhuma locação registrada.
                  </Td>
                </tr>
              ) : (
                sortedLeases.map((l) => {
                  const room = roomById.get(l.roomId)
                  const win = leaseWindowStatus(l.startDate, l.endDate)
                  const tone: 'ok' | 'warn' | 'muted' | 'bad' =
                    win === 'ativa' ? 'ok' : win === 'futura' ? 'warn' : 'muted'
                  return (
                    <tr key={l.id}>
                      <Td>{room?.name ?? l.roomId}</Td>
                      <Td>{l.tenantName}</Td>
                      <Td>
                        {l.tenantEmail && <div>{l.tenantEmail}</div>}
                        {l.tenantPhone && <div>{l.tenantPhone}</div>}
                        {!l.tenantEmail && !l.tenantPhone && '—'}
                      </Td>
                      <Td>{l.billingPeriod === 'daily' ? 'Diária' : 'Mensal'}</Td>
                      <Td>{formatMoney(l.pricePaid)}</Td>
                      <Td>
                        {formatDateBR(l.startDate)} → {formatDateBR(l.endDate)}
                      </Td>
                      <Td>{formatDateBR(l.endDate)}</Td>
                      <Td>{inclusiveDays(l.startDate, l.endDate)} dias</Td>
                      <Td>
                        <Badge $tone={tone}>
                          {win === 'ativa' ? 'No período' : win === 'futura' ? 'Futura' : 'Encerrada'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge $tone={l.inService ? 'ok' : 'bad'}>
                          {l.inService ? 'Sim' : 'Não'}
                        </Badge>
                      </Td>
                      <Td>
                        <BtnRow>
                          <Btn type="button" $variant="secondary" onClick={() => setEditingLease({ ...l })}>
                            Editar
                          </Btn>
                          <Btn
                            type="button"
                            $variant="danger"
                            onClick={async () => {
                              if (!confirm('Excluir esta locação?')) return
                              await deleteRoomLease(l.id)
                              await load()
                            }}
                          >
                            Excluir
                          </Btn>
                        </BtnRow>
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        </TableWrap>

        {editingLease && (
          <form onSubmit={handleSaveEditLease} style={{ marginTop: 16 }}>
            <SectionTitle style={{ fontSize: 15 }}>Editar locação</SectionTitle>
            <FormGrid>
              <Label>
                Sala
                <Select
                  value={editingLease.roomId}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, roomId: e.target.value } : s))}
                  required
                >
                  {(data?.rooms ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Label>
              <Label>
                Locatário
                <Input
                  value={editingLease.tenantName}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, tenantName: e.target.value } : s))}
                  required
                />
              </Label>
              <Label>
                E-mail
                <Input
                  value={editingLease.tenantEmail ?? ''}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, tenantEmail: e.target.value } : s))}
                />
              </Label>
              <Label>
                Telefone
                <Input
                  value={editingLease.tenantPhone ?? ''}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, tenantPhone: e.target.value } : s))}
                />
              </Label>
              <Label>
                Cobrança
                <Select
                  value={editingLease.billingPeriod}
                  onChange={(e) =>
                    setEditingLease((s) =>
                      s ? { ...s, billingPeriod: e.target.value as 'daily' | 'monthly' } : s,
                    )
                  }
                >
                  <option value="daily">Diária</option>
                  <option value="monthly">Mensal</option>
                </Select>
              </Label>
              <Label>
                Valor
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editingLease.pricePaid}
                  onChange={(e) =>
                    setEditingLease((s) => (s ? { ...s, pricePaid: Number(e.target.value) } : s))
                  }
                />
              </Label>
              <Label>
                Início
                <Input
                  type="date"
                  value={editingLease.startDate}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, startDate: e.target.value } : s))}
                  required
                />
              </Label>
              <Label>
                Fim
                <Input
                  type="date"
                  value={editingLease.endDate}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, endDate: e.target.value } : s))}
                  required
                />
              </Label>
              <Label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={editingLease.inService}
                  onChange={(e) => setEditingLease((s) => (s ? { ...s, inService: e.target.checked } : s))}
                />
                Em atendimento
              </Label>
            </FormGrid>
            <Label>
              Observações
              <TextArea
                value={editingLease.notes ?? ''}
                onChange={(e) => setEditingLease((s) => (s ? { ...s, notes: e.target.value } : s))}
              />
            </Label>
            <BtnRow style={{ marginTop: 10 }}>
              <Btn type="submit">Salvar</Btn>
              <Btn type="button" $variant="secondary" onClick={() => setEditingLease(null)}>
                Cancelar
              </Btn>
            </BtnRow>
          </form>
        )}
      </Section>
    </Wrap>
  )
}
