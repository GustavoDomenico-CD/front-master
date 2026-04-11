'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/app/styles/theme'

const Card = styled.section`
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 18px;
  margin-top: 18px;
  box-shadow: ${theme.shadow.table};
`

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 16px;
  color: #111827;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`

const Input = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
`

const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: white;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`

const Button = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
`

const Info = styled.p<{ $error?: boolean }>`
  margin: 10px 0 0;
  font-size: 13px;
  color: ${(p) => (p.$error ? '#b91c1c' : '#374151')};
`

type SuperadminUserCreatorProps = {
  onCreated?: () => void
}

export default function SuperadminUserCreator({ onCreated }: SuperadminUserCreatorProps) {
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
  })

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch('/api/users/roles', { credentials: 'include' })
        const data = await res.json().catch(() => [])
        if (res.ok && Array.isArray(data)) {
          setRoles(data)
          setForm((p) => ({ ...p, role: data[0] ?? 'user' }))
        }
      } catch {
        // ignore
      }
    }
    loadRoles()
  }, [])

  const onSubmit = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim() || undefined,
          role: form.role || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || data.mensagem || 'Falha ao criar usuário')
      }

      setMessage(`Usuário criado com role "${data.role ?? form.role}".`)
      setForm((p) => ({ ...p, email: '', password: '', name: '' }))
      onCreated?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Falha ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Title>Criar login (superadmin)</Title>
      <Grid>
        <Input
          placeholder="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <Input
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Input
          placeholder="Nome (opcional)"
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </Grid>
      <Actions>
        <Button
          type="button"
          disabled={loading || !form.email.trim() || form.password.length < 8}
          onClick={onSubmit}
        >
          {loading ? 'Criando...' : 'Criar usuário'}
        </Button>
      </Actions>
      {message && <Info>{message}</Info>}
      {error && <Info $error>{error}</Info>}
    </Card>
  )
}

