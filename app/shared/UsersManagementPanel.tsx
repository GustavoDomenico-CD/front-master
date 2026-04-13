'use client'

import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/app/styles/theme'
import LoadingSpinner from '@/app/shared/LoadingSpinner'
import { fetchAvailableRoles, fetchUsersList, patchUser } from '@/app/lib/users-api'

export type UsersManagementPanelProps = {
  canEdit: boolean
  onListChanged?: () => void
}

type UserRow = {
  id: number | string
  email: string
  name: string | null
  role: string
  isActive: boolean
}

const Wrap = styled.div`
  margin-top: 0;
  background: white;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.table};
  overflow: auto;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  color: ${theme.colors.dark};
`

const Sub = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: ${theme.colors.gray};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
    vertical-align: middle;
  }
  th {
    background: ${theme.colors.dark};
    color: white;
    font-weight: 600;
  }
  tr:hover td {
    background: #f8fafc;
  }
`

const Err = styled.p`
  color: ${theme.colors.danger};
  font-size: 14px;
`

const Badge = styled.span<{ $muted?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${(p) => (p.$muted ? '#f3f4f6' : '#dbeafe')};
  color: ${(p) => (p.$muted ? '#4b5563' : '#1d4ed8')};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Btn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.$variant === 'ghost' ? '#f3f4f6' : '#2563eb')};
  color: ${(p) => (p.$variant === 'ghost' ? '#374151' : 'white')};
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Input = styled.input`
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 13px;
  min-width: 140px;
`

const Select = styled.select`
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 13px;
  background: white;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`

function extractUsersList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  const o = data as Record<string, unknown>
  if (Array.isArray(o.data)) return o.data
  if (Array.isArray(o.users)) return o.users
  if (Array.isArray(o.items)) return o.items
  if (Array.isArray(o.usuarios)) return o.usuarios
  return []
}

function str(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function normalizeUserRow(raw: Record<string, unknown>): UserRow | null {
  const idRaw = raw.id ?? raw.userId ?? raw.user_id
  const id =
    typeof idRaw === 'number' && Number.isFinite(idRaw)
      ? idRaw
      : typeof idRaw === 'string' && idRaw.trim() !== ''
        ? idRaw.trim()
        : null
  if (id == null) return null

  const email = str(raw.email) ?? str(raw.username) ?? ''
  if (!email) return null

  const activeRaw = raw.is_active ?? raw.isActive ?? raw.ativo
  const isActive =
    typeof activeRaw === 'boolean'
      ? activeRaw
      : typeof activeRaw === 'string'
        ? !['false', '0', 'inativo', 'inactive'].includes(activeRaw.toLowerCase())
        : true

  return {
    id,
    email,
    name: str(raw.name) ?? str(raw.nome),
    role: String(raw.role ?? raw.papel ?? '').toLowerCase() || '—',
    isActive,
  }
}

export default function UsersManagementPanel({
  canEdit,
  onListChanged,
}: UsersManagementPanelProps) {
  const [rows, setRows] = useState<UserRow[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | string | null>(null)
  const [draft, setDraft] = useState({ name: '', role: '', email: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const loadRoles = useCallback(async () => {
    if (!canEdit) return
    try {
      const data = await fetchAvailableRoles()
      if (Array.isArray(data)) setRoles(data)
    } catch {
      // ignore
    }
  }, [canEdit])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUsersList()
      const list = extractUsersList(data)
      const next = list
        .map((item) =>
          item !== null && typeof item === 'object'
            ? normalizeUserRow(item as Record<string, unknown>)
            : null,
        )
        .filter((r): r is UserRow => r != null)
      setRows(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const startEdit = (r: UserRow) => {
    setSaveErr(null)
    setEditId(r.id)
    setDraft({
      name: r.name ?? '',
      role: r.role && r.role !== '—' ? r.role : roles[0] ?? 'user',
      email: r.email,
      isActive: r.isActive,
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setSaveErr(null)
  }

  const saveEdit = async () => {
    if (editId == null) return
    setSaving(true)
    setSaveErr(null)
    try {
      await patchUser(editId, {
        name: draft.name.trim() || undefined,
        role: draft.role || undefined,
        email: draft.email.trim() || undefined,
        is_active: draft.isActive,
      })
      setEditId(null)
      await load()
      onListChanged?.()
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Title>Usuários do sistema</Title>
      <Sub>
        Lista de contas cadastradas. {canEdit ? 'Como superadmin, você pode editar nome, e-mail, perfil e status.' : 'Apenas visualização; alterações são feitas pelo superadmin.'}
      </Sub>
      {error && <Err>{error}</Err>}
      <Toolbar>
        <Btn type="button" $variant="ghost" onClick={() => load()} disabled={loading}>
          Atualizar
        </Btn>
      </Toolbar>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Wrap>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Status</th>
                {canEdit ? <th>Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} style={{ textAlign: 'center', color: '#6b7280' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const isRowEdit = canEdit && editId != null && String(editId) === String(r.id)
                  return (
                    <tr key={String(r.id)}>
                      <td>{String(r.id)}</td>
                      <td>
                        {isRowEdit ? (
                          <Input
                            type="email"
                            value={draft.email}
                            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                          />
                        ) : (
                          r.email
                        )}
                      </td>
                      <td>
                        {isRowEdit ? (
                          <Input
                            type="text"
                            value={draft.name}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                            placeholder="Nome"
                          />
                        ) : (
                          r.name ?? '—'
                        )}
                      </td>
                      <td>
                        {isRowEdit ? (
                          <Select
                            value={draft.role}
                            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                          >
                            {(roles.length ? roles : [r.role]).map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Badge>{r.role}</Badge>
                        )}
                      </td>
                      <td>
                        {isRowEdit ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <input
                              type="checkbox"
                              checked={draft.isActive}
                              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
                            />
                            Ativo
                          </label>
                        ) : (
                          <Badge $muted={!r.isActive}>{r.isActive ? 'Ativo' : 'Inativo'}</Badge>
                        )}
                      </td>
                      {canEdit ? (
                        <td>
                          {isRowEdit ? (
                            <Actions>
                              <Btn type="button" disabled={saving} onClick={saveEdit}>
                                {saving ? 'Salvando…' : 'Salvar'}
                              </Btn>
                              <Btn type="button" $variant="ghost" disabled={saving} onClick={cancelEdit}>
                                Cancelar
                              </Btn>
                            </Actions>
                          ) : (
                            <Btn type="button" $variant="ghost" onClick={() => startEdit(r)}>
                              Editar
                            </Btn>
                          )}
                          {isRowEdit && saveErr ? (
                            <div style={{ marginTop: 6, fontSize: 11, color: '#b91c1c' }}>{saveErr}</div>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        </Wrap>
      )}
    </div>
  )
}
