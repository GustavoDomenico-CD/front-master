'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWhatsAppTemplates } from '@/app/hooks/useWhatsApp'

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

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
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
    return '#3b82f6'
  }};
  color: ${p => p.$variant === 'secondary' ? '#374151' : 'white'};

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const FormContainer = styled.div`
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

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

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`

const TemplateCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 8px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const TemplateName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
`

const TemplateMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
`

const TemplateContent = styled.div`
  font-size: 14px;
  color: #374151;
  background: #f9fafb;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.5;
  white-space: pre-wrap;
`

const ActiveBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${p => p.$active ? '#d1fae5' : '#fee2e2'};
  color: ${p => p.$active ? '#065f46' : '#991b1b'};
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

const Actions = styled.div`
  display: flex;
  gap: 6px;
`

const CountLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`

const FieldSpaced = styled(Field)`
  margin-bottom: 12px;
`

const ClickableBadge = styled(ActiveBadge)`
  cursor: pointer;
`

const SmallDangerButton = styled(Button)`
  padding: 4px 10px;
  font-size: 12px;
`

export default function WhatsAppTemplatesPanel() {
  const { templates, loading, error, load, create, update, remove } = useWhatsAppTemplates()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'marketing', language: 'pt_BR', content: '', variables: '' })

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    const vars = form.variables.split(',').map(v => v.trim()).filter(Boolean)
    try {
      await create({
        name: form.name.trim(),
        category: form.category,
        language: form.language,
        content: form.content.trim(),
        variables: vars.length > 0 ? vars : undefined,
      })
      setForm({ name: '', category: 'marketing', language: 'pt_BR', content: '', variables: '' })
      setShowForm(false)
    } catch { /* handled by hook */ }
  }

  const handleToggle = async (id: number, current: boolean) => {
    try { await update(id, { isActive: !current }) } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este template?')) return
    try { await remove(id) } catch { /* handled */ }
  }

  const parseVars = (v: string): string[] => {
    try { return JSON.parse(v) } catch { return [] }
  }

  return (
    <Container>
      <Title>Templates de Mensagem</Title>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <TopBar>
        <CountLabel>{templates.length} template(s)</CountLabel>
        <Button onClick={() => setShowForm(!showForm)} $variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? 'Cancelar' : 'Novo Template'}
        </Button>
      </TopBar>

      {showForm && (
        <FormContainer>
          <FormGrid>
            <Field>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="nome_do_template" />
            </Field>
            <Field>
              <Label>Categoria</Label>
              <Input as="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="marketing">Marketing</option>
                <option value="utility">Utilidade</option>
                <option value="authentication">Autenticacao</option>
              </Input>
            </Field>
            <Field>
              <Label>Idioma</Label>
              <Input value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} placeholder="pt_BR" />
            </Field>
            <Field>
              <Label>Variaveis (separadas por virgula)</Label>
              <Input value={form.variables} onChange={e => setForm(p => ({ ...p, variables: e.target.value }))} placeholder="nome, data, horario" />
            </Field>
          </FormGrid>
          <FieldSpaced>
            <Label>Conteudo</Label>
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Ola {{1}}, sua consulta esta marcada para {{2}} as {{3}}." />
          </FieldSpaced>
          <Button onClick={handleCreate} disabled={!form.name.trim() || !form.content.trim()}>
            {loading ? 'Salvando...' : 'Criar Template'}
          </Button>
        </FormContainer>
      )}

      {loading && <EmptyState>Carregando...</EmptyState>}

      {!loading && templates.length === 0 && <EmptyState>Nenhum template cadastrado</EmptyState>}

      {templates.map(t => {
        const vars = parseVars(t.variables)
        return (
          <TemplateCard key={t.id}>
            <TemplateHeader>
              <div>
                <TemplateName>{t.name}</TemplateName>
                <TemplateMeta>
                  {t.category} | {t.language}
                  {vars.length > 0 && ` | Vars: ${vars.join(', ')}`}
                </TemplateMeta>
              </div>
              <Actions>
                <ClickableBadge $active={t.isActive} onClick={() => handleToggle(t.id, t.isActive)}>
                  {t.isActive ? 'Ativo' : 'Inativo'}
                </ClickableBadge>
                <SmallDangerButton $variant="danger" onClick={() => handleDelete(t.id)}>
                  Remover
                </SmallDangerButton>
              </Actions>
            </TemplateHeader>
            <TemplateContent>{t.content}</TemplateContent>
          </TemplateCard>
        )
      })}
    </Container>
  )
}
