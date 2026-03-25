'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styled from 'styled-components'

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`

const RegisterCard = styled.div`
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
`

const Title = styled.h1`
  text-align: center;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 28px;
`

const Subtitle = styled.p`
  text-align: center;
  color: #6b7280;
  margin-bottom: 24px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`

const Button = styled.button<{ $loading?: boolean }>`
  padding: 14px;
  background: ${({ $loading }) => ($loading ? '#93c5fd' : '#3b82f6')};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 6px;
`

const LinkText = styled.p`
  text-align: center;
  margin-top: 18px;
  color: #6b7280;

  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    avatarUrl: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Falha ao criar conta')
      }

      router.push('/painel-agendamento')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao tentar criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Criar conta</Title>
        <Subtitle>Preencha os dados para acessar o painel</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">E-mail</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="avatarUrl">Avatar URL (opcional)</Label>
            <Input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              placeholder="https://exemplo.com/avatar.png"
              value={formData.avatarUrl}
              onChange={handleChange}
            />
          </InputGroup>

          <Button type="submit" disabled={loading} $loading={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>

        <LinkText>
          Já tem conta? <Link href="/painel-login">Entrar</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  )
}

