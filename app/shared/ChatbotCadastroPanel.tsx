'use client'

import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/app/styles/theme'
import LoadingSpinner from '@/app/shared/LoadingSpinner'

type CadastroRow = {
  id: number
  email: string
  name: string | null
  phone: string | null
  consultationType: string | null
  consultationCategory: string | null
  role: string
  status: string
  errorMessage: string | null
  createdAt: string
  userId: number | null
  user: { id: number; email: string; role: string; name: string | null } | null
}

function str(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function extractCadastroList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (!json || typeof json !== 'object') return []
  const o = json as Record<string, unknown>
  if (Array.isArray(o.data)) return o.data
  if (Array.isArray(o.cadastros)) return o.cadastros
  if (Array.isArray(o.items)) return o.items
  return []
}

function normalizeUserNested(u: unknown): CadastroRow['user'] {
  if (!u || typeof u !== 'object') return null
  const o = u as Record<string, unknown>
  const idRaw = o.id
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw)
  if (!Number.isFinite(id)) return null
  return {
    id,
    email: String(o.email ?? ''),
    role: String(o.role ?? ''),
    name: str(o.name),
  }
}

function normalizeCadastroRow(raw: unknown, index: number): CadastroRow | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const idRaw = o.id
  let id = typeof idRaw === 'number' ? idRaw : Number(idRaw)
  if (!Number.isFinite(id)) id = index

  const createdAt =
    str(o.createdAt) ??
    str(o.created_at) ??
    str(o.createdAtUtc) ??
    str(o.data_criacao) ??
    ''

  const statusRaw = str(o.status) ?? str(o.estado) ?? ''
  const err =
    str(o.errorMessage) ??
    str(o.error_message) ??
    str(o.mensagem_erro) ??
    str(o.error) ??
    null

  const user = normalizeUserNested(o.user ?? o.User)
  const userIdRaw = o.userId ?? o.user_id
  const userIdNum = typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw)
  const userId = Number.isFinite(userIdNum) ? userIdNum : user?.id ?? null

  const email = str(o.email) ?? '—'
  const consultationType =
    str(o.consultationType) ?? str(o.consultation_type) ?? str(o.tipo_consulta)
  const consultationCategory =
    str(o.consultationCategory) ?? str(o.consultation_category) ?? str(o.categoria)

  return {
    id,
    email,
    name: str(o.name) ?? str(o.nome),
    phone: str(o.phone) ?? str(o.telefone) ?? str(o.phoneNumber),
    consultationType,
    consultationCategory,
    role: String(o.role ?? ''),
    status: statusRaw || '—',
    errorMessage: err,
    createdAt,
    userId,
    user,
  }
}

function statusIsOk(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'completed' || s === 'success' || s === 'sucesso' || s === 'concluido' || s === 'ok'
}

function formatCreatedAt(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR')
}

function previewText(value: string | null, max: number): { text: string; truncated: boolean } {
  if (value == null || value === '') return { text: '—', truncated: false }
  const truncated = value.length > max
  return { text: truncated ? `${value.slice(0, max)}…` : value, truncated }
}

const Wrap = styled.div`
  margin-top: 16px;
  background: white;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.table};
  overflow: auto;
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  color: ${theme.colors.dark};
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

const Sub = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: ${theme.colors.gray};
`

const Err = styled.p`
  color: ${theme.colors.danger};
  font-size: 14px;
`

const Badge = styled.span<{ $ok?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${(p) => (p.$ok ? '#dcfce7' : '#fee2e2')};
  color: ${(p) => (p.$ok ? '#166534' : '#991b1b')};
`

export default function ChatbotCadastroPanel() {
  const [rows, setRows] = useState<CadastroRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/chatbot-cadastros?limit=200', { credentials: 'include' })
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
      const list = extractCadastroList(data)
      if (!res.ok) {
        const msg =
          str(data.mensagem) ??
          str(data.message) ??
          str(data.error) ??
          'Não foi possível carregar os cadastros.'
        throw new Error(msg ?? 'Não foi possível carregar os cadastros.')
      }
      const st = String(data.status ?? '').toLowerCase()
      if (st === 'erro' || st === 'error' || st === 'falha') {
        throw new Error(
          str(data.mensagem) ?? str(data.message) ?? 'Não foi possível carregar os cadastros.',
        )
      }
      const normalized = list
        .map((item, i) => normalizeCadastroRow(item, i))
        .filter((r): r is CadastroRow => r != null)
      setRows(normalized)
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

  return (
    <div>
      <Title>Cadastros via chatbot</Title>
      <Sub>
        Registros gravados na tabela <code>ChatbotCadastro</code> ao concluir o cadastro de paciente no
        chatbot. Falhas (ex.: e-mail duplicado) aparecem com status <strong>failed</strong>.
      </Sub>
      {error && <Err>{error}</Err>}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Wrap>
          <Table>
            <thead>
              <tr>
                <th>Data</th>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Consulta</th>
                <th>Status</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const consulta = previewText(r.consultationType, 40)
                  const errPreview = r.errorMessage ? previewText(r.errorMessage, 120) : { text: '', truncated: false }
                  return (
                    <tr key={`${r.id}-${r.email}-${r.createdAt}`}>
                      <td>{formatCreatedAt(r.createdAt)}</td>
                      <td>{r.email}</td>
                      <td>{r.name ?? '—'}</td>
                      <td>{r.phone ?? '—'}</td>
                      <td title={r.consultationType ?? ''}>{consulta.text}</td>
                      <td>
                        <Badge $ok={statusIsOk(r.status)}>{r.status}</Badge>
                        {errPreview.text ? (
                          <span style={{ display: 'block', fontSize: 11, color: '#991b1b', marginTop: 4 }}>
                            {errPreview.text}
                          </span>
                        ) : null}
                      </td>
                      <td>{r.user?.id ?? r.userId ?? '—'}</td>
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
