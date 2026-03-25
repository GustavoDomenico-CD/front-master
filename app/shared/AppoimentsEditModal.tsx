'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Appointment } from '../types/Appoiments';
import { theme } from '../styles/theme';

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Overlay & Shell ───────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease both;
`;

const Modal = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.25s ease both;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 3px; }
`;

// ─── Header ────────────────────────────────────────────────────────────────────

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid ${theme.colors.border};
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-radius: ${theme.radius.lg} ${theme.radius.lg} 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.dark};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: ${theme.colors.primary};
    border-radius: 2px;
    display: inline-block;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${theme.radius.sm};
  background: ${theme.colors.light};
  color: ${theme.colors.gray};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
    color: ${theme.colors.danger};
  }
`;

// ─── Body ──────────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  padding: 24px 28px;
`;

const GroupTitle = styled.p`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${theme.colors.gray};
  margin: 24px 0 12px;

  &:first-child { margin-top: 0; }
`;

const FormGrid = styled.div<{ cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols ?? 2}, 1fr);
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ $full?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  ${({ $full }) => $full && css`grid-column: 1 / -1;`}
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.dark};
`;

const inputBase = css`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  font-size: 14px;
  color: ${theme.colors.dark};
  background: white;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  &:disabled {
    background: ${theme.colors.light};
    color: ${theme.colors.gray};
    cursor: not-allowed;
  }
`;

const Input = styled.input`${inputBase}`;
const Select = styled.select`${inputBase} cursor: pointer;`;
const Textarea = styled.textarea`
  ${inputBase}
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
`;

// ─── Footer ────────────────────────────────────────────────────────────────────

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px 24px;
  border-top: 1px solid ${theme.colors.border};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 22px;
  border: none;
  border-radius: ${theme.radius.sm};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ $variant = 'primary' }) => {
    if ($variant === 'primary') return css`
      background: ${theme.colors.primary};
      color: white;
      &:hover:not(:disabled) { background: #2563eb; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    `;
    if ($variant === 'secondary') return css`
      background: ${theme.colors.light};
      color: ${theme.colors.dark};
      &:hover { background: ${theme.colors.border}; }
    `;
    if ($variant === 'danger') return css`
      background: #fee2e2;
      color: ${theme.colors.danger};
      &:hover { background: #fecaca; }
    `;
  }}
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${theme.radius.sm};
  color: #991b1b;
  font-size: 14px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

// ─── Status options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  'Atendido',
  'Cliente Chegou',
  'Confirmado',
  'Tratamento concluido',
  'Confirmar',
  'Compromisso pessoal',
  'Desmarcou',
  'Não compareceu',
];

// ─── Component ─────────────────────────────────────────────────────────────────

interface EditarAgendamentoModalProps {
  agendamento: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarAgendamentoModal({
  agendamento,
  onClose,
  onSuccess,
}: EditarAgendamentoModalProps) {
  const [form, setForm] = useState<Appointment>({ ...agendamento });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/${agendamento.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Erro ${res.status}: não foi possível atualizar.`);
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay ref={overlayRef} onClick={handleOverlayClick}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <ModalHeader>
          <ModalTitle id="modal-title">Editar Agendamento #{agendamento.id}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Fechar">✕</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            {/* Cliente */}
            <GroupTitle>Dados do Cliente</GroupTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="username">Nome</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="telephone">Telefone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </FormGroup>
            </FormGrid>

            {/* Agendamento */}
            <GroupTitle>Agendamento</GroupTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="hour">Horário</Label>
                <Input
                  id="hour"
                  name="hour"
                  type="number"
                  min={0}
                  max={23}
                  value={form.hour}
                  onChange={handleChange}
                  placeholder="Ex: 14"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="duration">Duração (min)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min={0}
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="Ex: 60"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  name="local"
                  value={form.local ?? ''}
                  onChange={handleChange}
                  placeholder="Local do atendimento"
                />
              </FormGroup>
            </FormGrid>

            {/* Serviço */}
            <GroupTitle>Serviço</GroupTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="service">Serviço</Label>
                <Input
                  id="service"
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  placeholder="Nome do serviço"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="professional">Profissional</Label>
                <Input
                  id="professional"
                  name="professional"
                  value={form.professional}
                  onChange={handleChange}
                  placeholder="Nome do profissional"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="typeOfService">Tipo de Serviço</Label>
                <Input
                  id="typeOfService"
                  name="typeOfService"
                  value={form.typeOfService}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="type_appointment">Tipo de Agendamento</Label>
                <Input
                  id="type_appointment"
                  name="type_appointment"
                  value={form.type_appointment}
                  onChange={handleChange}
                />
              </FormGroup>
            </FormGrid>

            {/* Status */}
            <GroupTitle>Status</GroupTitle>
            <FormGrid cols={1}>
              <FormGroup>
                <Label htmlFor="status">Situação</Label>
                <Select
                  id="status"
                  name="status"
                  value={form.status ?? ''}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormGroup>
            </FormGrid>

            {/* Observações */}
            <GroupTitle>Observações</GroupTitle>
            <FormGrid cols={1}>
              <FormGroup $full>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={form.observations ?? ''}
                  onChange={handleChange}
                  placeholder="Informações adicionais..."
                />
              </FormGroup>
            </FormGrid>
          </ModalBody>

          <ModalFooter>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? '⏳ Salvando...' : '✓ Salvar Alterações'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </Overlay>
  );
}
