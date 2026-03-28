'use client'

import { useEffect } from 'react'
import styled from 'styled-components'
import { useWhatsAppKPIs } from '@/app/hooks/useWhatsApp'

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
`

const Card = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`

const CardLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`

const CardValue = styled.div<{ $color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.$color ?? '#1f2937'};
`

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 13px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
`

export default function WhatsAppKPIsPanel() {
  const { kpis, loading, error, load } = useWhatsAppKPIs()

  useEffect(() => { load() }, [load])

  if (loading) return <Container><Title>KPIs WhatsApp</Title><div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>Carregando...</div></Container>
  if (error) return <Container><Title>KPIs WhatsApp</Title><ErrorMsg>{error}</ErrorMsg></Container>
  if (!kpis) return null

  const cards = [
    { label: 'Total Mensagens', value: kpis.totalMessages, color: '#3b82f6' },
    { label: 'Enviadas', value: kpis.sentMessages, color: '#25d366' },
    { label: 'Recebidas', value: kpis.receivedMessages, color: '#8b5cf6' },
    { label: 'Taxa Entrega', value: `${kpis.deliveredRate}%`, color: '#10b981' },
    { label: 'Taxa Leitura', value: `${kpis.readRate}%`, color: '#06b6d4' },
    { label: 'Falhas', value: kpis.failedMessages, color: '#ef4444' },
    { label: 'Total Contatos', value: kpis.totalContacts, color: '#f59e0b' },
    { label: 'Contatos Ativos', value: kpis.activeContacts, color: '#10b981' },
    { label: 'Templates', value: kpis.templatesCount, color: '#6366f1' },
  ]

  return (
    <Container>
      <Title>KPIs WhatsApp</Title>
      <Grid>
        {cards.map(c => (
          <Card key={c.label}>
            <CardLabel>{c.label}</CardLabel>
            <CardValue $color={c.color}>{c.value}</CardValue>
          </Card>
        ))}
      </Grid>
    </Container>
  )
}
