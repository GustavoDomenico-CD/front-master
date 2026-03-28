'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWhatsAppConfig, useWhatsAppStatus } from '@/app/hooks/useWhatsApp'

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  padding: 24px;
`

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1f2937;
`

const StatusBar = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: ${p => p.$connected ? '#d1fae5' : '#fee2e2'};
  color: ${p => p.$connected ? '#065f46' : '#991b1b'};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
`

const Dot = styled.span<{ $on: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$on ? '#10b981' : '#ef4444'};
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  background: ${p => {
    if (p.$variant === 'danger') return '#ef4444'
    if (p.$variant === 'secondary') return '#f3f4f6'
    return '#3b82f6'
  }};
  color: ${p => p.$variant === 'secondary' ? '#374151' : 'white'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ConfigCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`

const ConfigInfo = styled.div`
  flex: 1;
`

const ConfigName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
`

const ConfigDetail = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
`

const SuccessMsg = styled.div`
  color: #065f46;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #d1fae5;
  border-radius: 8px;
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const CountLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`

const FormWrapper = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background: #f9fafb;
`

const SmallButton = styled(Button)`
  padding: 6px 14px;
  font-size: 13px;
`

export default function WhatsAppConfigPanel() {
  const { configs, loading, error, load, create, remove } = useWhatsAppConfig()
  const { status: connStatus, load: loadStatus } = useWhatsAppStatus()
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({ instanceName: '', phoneNumber: '', apiKey: '', webhookUrl: '' })

  useEffect(() => { load(); loadStatus() }, [load, loadStatus])

  const handleCreate = async () => {
    if (!form.instanceName || !form.phoneNumber || !form.apiKey) return
    try {
      await create(form)
      setForm({ instanceName: '', phoneNumber: '', apiKey: '', webhookUrl: '' })
      setShowForm(false)
      setSuccess('Configuracao criada com sucesso')
      setTimeout(() => setSuccess(null), 3000)
    } catch { /* error handled by hook */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta configuracao?')) return
    try {
      await remove(id)
      setSuccess('Configuracao removida')
      setTimeout(() => setSuccess(null), 3000)
    } catch { /* error handled by hook */ }
  }

  return (
    <Container>
      <Title>Configuracao WhatsApp</Title>

      <StatusBar $connected={connStatus?.connected ?? false}>
        <Dot $on={connStatus?.connected ?? false} />
        {connStatus?.connected
          ? `Conectado - ${connStatus.instanceName} (${connStatus.phoneNumber})`
          : 'Desconectado'}
      </StatusBar>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{success}</SuccessMsg>}

      <TopBar>
        <CountLabel>{configs.length} configuracao(oes)</CountLabel>
        <Button onClick={() => setShowForm(!showForm)} $variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? 'Cancelar' : 'Nova Configuracao'}
        </Button>
      </TopBar>

      {showForm && (
        <FormWrapper>
          <FormGrid>
            <Field>
              <Label>Nome da Instancia</Label>
              <Input value={form.instanceName} onChange={e => setForm(p => ({ ...p, instanceName: e.target.value }))} placeholder="Ex: Clinica Principal" />
            </Field>
            <Field>
              <Label>Numero do Telefone</Label>
              <Input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="5511999999999" />
            </Field>
            <Field>
              <Label>API Key / Access Token</Label>
              <Input type="password" value={form.apiKey} onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))} placeholder="Token de acesso" />
            </Field>
            <Field>
              <Label>Webhook URL (opcional)</Label>
              <Input value={form.webhookUrl} onChange={e => setForm(p => ({ ...p, webhookUrl: e.target.value }))} placeholder="https://..." />
            </Field>
          </FormGrid>
          <Button onClick={handleCreate} disabled={loading || !form.instanceName || !form.phoneNumber || !form.apiKey}>
            {loading ? 'Salvando...' : 'Salvar Configuracao'}
          </Button>
        </FormWrapper>
      )}

      {configs.map(c => (
        <ConfigCard key={c.id}>
          <ConfigInfo>
            <ConfigName>{c.instanceName}</ConfigName>
            <ConfigDetail>{c.phoneNumber} - Status: {c.status} {c.isActive ? '' : '(Inativo)'}</ConfigDetail>
          </ConfigInfo>
          <Actions>
            <SmallButton $variant="danger" onClick={() => handleDelete(c.id)}>
              Remover
            </SmallButton>
          </Actions>
        </ConfigCard>
      ))}
    </Container>
  )
}
