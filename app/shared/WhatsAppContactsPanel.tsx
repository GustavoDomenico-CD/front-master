'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWhatsAppContacts } from '@/app/hooks/useWhatsApp'
import Pagination from '@/app/shared/Pagination'

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

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' | 'warning' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  background: ${p => {
    if (p.$variant === 'danger') return '#ef4444'
    if (p.$variant === 'secondary') return '#f3f4f6'
    if (p.$variant === 'warning') return '#f59e0b'
    return '#3b82f6'
  }};
  color: ${p => p.$variant === 'secondary' ? '#374151' : 'white'};

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  flex: 1;
  min-width: 160px;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`

const ContactCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`

const ContactInfo = styled.div`
  flex: 1;
`

const ContactName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
`

const ContactDetail = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`

const BlockedBadge = styled.span`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #fee2e2;
  color: #991b1b;
  margin-left: 8px;
`

const Actions = styled.div`
  display: flex;
  gap: 6px;
`

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
`

export default function WhatsAppContactsPanel() {
  const { contacts, pages, loading, error, load, upsert, remove, toggleBlock } = useWhatsAppContacts()
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ phoneNumber: '', name: '' })

  useEffect(() => { load(page) }, [load, page])

  const handleAdd = async () => {
    if (!form.phoneNumber.trim() || !form.name.trim()) return
    try {
      await upsert({ phoneNumber: form.phoneNumber.trim(), name: form.name.trim() })
      setForm({ phoneNumber: '', name: '' })
      setShowForm(false)
    } catch { /* handled by hook */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este contato?')) return
    try { await remove(id) } catch { /* handled by hook */ }
  }

  const formatDate = (d?: string) => {
    if (!d) return 'Nunca'
    try { return new Date(d).toLocaleString('pt-BR') } catch { return d }
  }

  return (
    <Container>
      <Title>Contatos WhatsApp</Title>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <TopBar>
        <span style={{ fontSize: 14, color: '#6b7280' }}>
          {contacts.length} contato(s)
        </span>
        <Button onClick={() => setShowForm(!showForm)} $variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? 'Cancelar' : 'Novo Contato'}
        </Button>
      </TopBar>

      {showForm && (
        <FormRow>
          <Input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="Telefone (5511...)" />
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome" />
          <Button onClick={handleAdd} disabled={!form.phoneNumber.trim() || !form.name.trim()}>Salvar</Button>
        </FormRow>
      )}

      {loading && <EmptyState>Carregando...</EmptyState>}

      {!loading && contacts.length === 0 && <EmptyState>Nenhum contato cadastrado</EmptyState>}

      {contacts.map(c => (
        <ContactCard key={c.id}>
          <ContactInfo>
            <ContactName>
              {c.name}
              {c.isBlocked && <BlockedBadge>Bloqueado</BlockedBadge>}
            </ContactName>
            <ContactDetail>
              {c.phoneNumber} - Ultima msg: {formatDate(c.lastMessageAt)}
            </ContactDetail>
          </ContactInfo>
          <Actions>
            <Button $variant="warning" onClick={() => toggleBlock(c.id)} style={{ padding: '6px 12px' }}>
              {c.isBlocked ? 'Desbloquear' : 'Bloquear'}
            </Button>
            <Button $variant="danger" onClick={() => handleDelete(c.id)} style={{ padding: '6px 12px' }}>
              Remover
            </Button>
          </Actions>
        </ContactCard>
      ))}

      {pages > 1 && (
        <div style={{ marginTop: 16 }}>
          <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
        </div>
      )}
    </Container>
  )
}
