'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

import { Appointment, Filters } from '@/app/types/Appoiments';
import useSession from '@/app/hooks/useSession';
import useAppoiments from '@/app/hooks/useAppoiments';
import LoadingSpinner from '@/app/shared/LoadingSpinner';
import StatusMessage from '@/app/shared/StatusMessage';
import { AppoimentsTable } from '@/app/shared/AppoimentsTable';
import AppoimentsFilters from '@/app/shared/AppoimentsFilters';
import KPICards from '@/app/shared/KPICards';
import { useKPIs } from '@/app/hooks/useKPIs';
import IntegrationsStatus from '@/app/shared/IntegrationsStatus';
import Pagination from '@/app/shared/Pagination';
import { usePagination } from '@/app/hooks/usePagination';
import GraficosDashboard from '@/app/shared/GraphsDashboard';
import EditarAgendamentoModal from '@/app/shared/AppoimentsEditModal';
import { postLogout } from '@/app/lib/backend';
import DashboardTabs, { SIDEBAR_COLLAPSED } from '@/app/shared/DashboardTabs';
import type { TabItem } from '@/app/shared/DashboardTabs';
import WhatsAppConfigPanel from '@/app/shared/WhatsAppConfigPanel';
import WhatsAppMessagesPanel from '@/app/shared/WhatsAppMessagesPanel';
import WhatsAppContactsPanel from '@/app/shared/WhatsAppContactsPanel';
import WhatsAppTemplatesPanel from '@/app/shared/WhatsAppTemplatesPanel';
import WhatsAppKPIsPanel from '@/app/shared/WhatsAppKPIsPanel';
import WhatsAppChatPanel from '@/app/shared/WhatsAppChatPanel';
import SuperadminUserCreator from '@/app/shared/SuperadminUserCreator';
import ChatbotCadastroPanel from '@/app/shared/ChatbotCadastroPanel';
import RoomRentalsPanel from '@/app/shared/RoomRentalsPanel';

// Offset main content so it doesn't hide behind the collapsed sidebar
const PageWrapper = styled.div`
  margin-left: ${SIDEBAR_COLLAPSED};
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 24px 24px 24px 32px;
  transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
`

const PageInner = styled.div`
  width: 100%;
  max-width: 1280px;
`

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  color: #1f2937;
`

const RoleBadge = styled.span<{ $isAdmin: boolean }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${p => p.$isAdmin ? '#dbeafe' : '#f3f4f6'};
  color: ${p => p.$isAdmin ? '#1d4ed8' : '#6b7280'};
  margin-top: 4px;
`

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
`

const Section = styled.section<{ $marginBottom?: number; $marginTop?: number }>`
  margin-bottom: ${p => p.$marginBottom ? `${p.$marginBottom}px` : '0'};
  margin-top: ${p => p.$marginTop ? `${p.$marginTop}px` : '0'};
`

const ChartJsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
`

const ChatbotContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const ChatbotButton = styled.button`
  padding: 16px 32px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`

const WhatsAppSection = styled.div`
  margin-top: 20px;
`

const TABS: TabItem[] = [
  { id: 'agendamentos', label: 'Agendamentos' },
  { id: 'kpis', label: 'KPIs & Graficos' },
  { id: 'integracoes', label: 'Integracoes' },
  { id: 'salas', label: 'Aluguel de salas', adminOnly: true },
  { id: 'chatbot', label: 'Chatbot' },
  { id: 'chatbot-cadastros', label: 'Cadastros chatbot', adminOnly: true },
  { id: 'whatsapp-chat', label: 'WhatsApp Chat', adminOnly: true },
  { id: 'whatsapp-mensagens', label: 'WhatsApp Mensagens', adminOnly: true },
  { id: 'whatsapp-contatos', label: 'WhatsApp Contatos', adminOnly: true },
  { id: 'whatsapp-templates', label: 'WhatsApp Templates', adminOnly: true },
  { id: 'whatsapp-conexao', label: 'WhatsApp Conexão', adminOnly: true },
  { id: 'usuarios', label: 'Usuarios', adminOnly: true },
];

export default function AppoimentsPanel() {
  const router = useRouter();
  const { user, loading: sessionLoading, checkSession } = useSession();
  const { appoiments, loading, error, fetchAgendamentos, chartsData } = useAppoiments();
  const { kpis, loading: kpisLoading } = useKPIs();

  const [activeTab, setActiveTab] = useState('agendamentos');
  const [filtros, setFiltros] = useState<Partial<Filters>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [agendamentoEdit, setAgendamentoEdit] = useState<Appointment | null>(null);

  const { pagination, goToPage } = usePagination({ pageSize: 15 });
  const displayName = (user?.username || '').split('@')[0] || 'usuario';

  useEffect(() => {
    checkSession().catch(() => router.push('/painel-login'));
  }, []);

  useEffect(() => {
    if (user) {
      fetchAgendamentos(1, filtros);
    }
  }, [user, filtros]);

  useEffect(() => {
    if (error) {
      setStatusMessage({ type: 'error', message: error });
    }
  }, [error]);

  const handleApplyFilters = (newFiltros: Filters) => {
    setFiltros(newFiltros);
    fetchAgendamentos(1, newFiltros);
  };

  const handleEdit = (ag: Appointment) => {
    setAgendamentoEdit(ag);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusao deste agendamento?')) return;
    try {
      const res = await fetch(`/api/admin/${id}/delete`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      setStatusMessage({ type: 'success', message: 'Agendamento excluido com sucesso.' });
      fetchAgendamentos(pagination.currentPage, filtros);
    } catch {
      setStatusMessage({ type: 'error', message: 'Nao foi possivel excluir o agendamento.' });
    }
  };

  const handleLogout = async () => {
    try {
      await postLogout();
    } finally {
      router.push('/painel-login');
    }
  };

  if (sessionLoading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <DashboardTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user?.role}
      />

      <PageWrapper>
        <PageInner>
        <PageHeader>
          <div>
            <PageTitle>
              Ola, {displayName}
            </PageTitle>
            {user?.role && (
              <RoleBadge $isAdmin={user.role === 'admin' || user.role === 'superadmin'}>
                {user.role.toUpperCase()}
              </RoleBadge>
            )}
          </div>
          <LogoutButton onClick={handleLogout}>
            Sair
          </LogoutButton>
        </PageHeader>

        {statusMessage && (
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {activeTab === 'agendamentos' && (
          <>
            <Section $marginBottom={20}>
              <AppoimentsFilters onApply={handleApplyFilters} />
            </Section>

            <section>
              {loading && <LoadingSpinner />}

              <AppoimentsTable
                agendamentos={appoiments}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
              />
            </section>

            {modalOpen && agendamentoEdit && (
              <EditarAgendamentoModal
                agendamento={agendamentoEdit}
                onClose={() => {
                  setModalOpen(false);
                  setAgendamentoEdit(null);
                }}
                onSuccess={(detail) => {
                  setModalOpen(false);
                  setAgendamentoEdit(null);
                  setStatusMessage({
                    type: 'success',
                    message: `Agendamento atualizado com sucesso.${detail ?? ''}`,
                  });
                  fetchAgendamentos(pagination.currentPage, filtros);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'kpis' && (
          <>
            <KPICards kpis={kpis} loading={kpisLoading} />
            <Section $marginTop={20}>
              <ChartJsBadge>
                ChartJS
              </ChartJsBadge>
              <GraficosDashboard chartsData={chartsData} />
            </Section>
          </>
        )}

        {activeTab === 'integracoes' && (
          <IntegrationsStatus />
        )}

        {activeTab === 'salas' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <Section $marginBottom={20}>
            <RoomRentalsPanel />
          </Section>
        )}

        {activeTab === 'chatbot' && (
          <ChatbotContainer>
            <ChatbotButton onClick={() => router.push('/chatbot')}>
              Abrir Chatbot
            </ChatbotButton>
          </ChatbotContainer>
        )}

        {activeTab === 'chatbot-cadastros' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <ChatbotCadastroPanel />
        )}

        {activeTab === 'whatsapp-chat' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <WhatsAppChatPanel />
        )}

        {activeTab === 'whatsapp-mensagens' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <>
            <WhatsAppKPIsPanel />
            <WhatsAppSection>
              <WhatsAppMessagesPanel />
            </WhatsAppSection>
          </>
        )}

        {activeTab === 'whatsapp-contatos' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <WhatsAppContactsPanel />
        )}

        {activeTab === 'whatsapp-templates' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <WhatsAppTemplatesPanel />
        )}

        {activeTab === 'whatsapp-conexao' && (user?.role === 'admin' || user?.role === 'superadmin') && (
          <WhatsAppConfigPanel />
        )}

        {activeTab === 'usuarios' && user?.role === 'superadmin' && (
          <SuperadminUserCreator />
        )}
        </PageInner>
      </PageWrapper>
    </>
  );
}