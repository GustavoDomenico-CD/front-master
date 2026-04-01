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
  user: { id: number; email: string; role: string; name: string | null } | null
}

const Wrap = styled.div`
  margin-top: 16px;
  background: white;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
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
      const data = (await res.json().catch(() => ({}))) as {
        status?: string
        data?: CadastroRow[]
        mensagem?: string
      }
      const st = (data.status ?? '').toLowerCase()
      if (!res.ok || (st !== 'sucesso' && st !== 'success') || !Array.isArray(data.data)) {
        throw new Error(data.mensagem ?? 'Não foi possível carregar os cadastros.')
      }
      setRows(data.data)
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
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString('pt-BR')}</td>
                    <td>{r.email}</td>
                    <td>{r.name ?? '—'}</td>
                    <td>{r.phone ?? '—'}</td>
                    <td title={r.consultationType ?? ''}>
                      {(r.consultationType ?? '—').slice(0, 40)}
                      {(r.consultationType?.length ?? 0) > 40 ? '…' : ''}
                    </td>
                    <td>
                      <Badge $ok={r.status === 'completed'}>{r.status}</Badge>
                      {r.errorMessage ? (
                        <span style={{ display: 'block', fontSize: 11, color: '#991b1b', marginTop: 4 }}>
                          {r.errorMessage.slice(0, 120)}
                        </span>
                      ) : null}
                    </td>
                    <td>{r.user?.id ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Wrap>
      )}
    </div>
  )
}
