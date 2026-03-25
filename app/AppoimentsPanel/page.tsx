'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { deleteAppointment, postLogout } from '@/app/lib/backend';
import ChatManager from '@/app/shared/Chatbot';

export default function AppoimentsPanel() {
  const router = useRouter();
  const { user, loading: sessionLoading, checkSession } = useSession();
  const { appoiments, loading, error, fetchAgendamentos, chartsData } = useAppoiments();
  const { kpis, loading: kpisLoading } = useKPIs();

  const [filtros, setFiltros] = useState<Partial<Filters>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [agendamentoEdit, setAgendamentoEdit] = useState<Appointment | null>(null);

  const { pagination, goToPage } = usePagination({ pageSize: 15 });

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
    if (!confirm('Confirmar exclusão deste agendamento?')) return;
    try {
      const res = await fetch(`/api/admin/${id}/delete`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      setStatusMessage({ type: 'success', message: 'Agendamento excluído com sucesso.' });
      fetchAgendamentos(pagination.currentPage, filtros);
    } catch {
      setStatusMessage({ type: 'error', message: 'Não foi possível excluir o agendamento.' });
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
    <div className="painel-container">
      <header>
        <h1>Olá, {user?.username}</h1>
        <button onClick={handleLogout}>Sair</button>
      </header>

      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onClose={() => setStatusMessage(null)}
        />
      )}

      <IntegrationsStatus />
      

      <KPICards kpis={kpis} loading={kpisLoading} />

      <section className="filtros-section">
        <AppoimentsFilters onApply={handleApplyFilters} />
      </section>

      <section className="table-section">
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

      <GraficosDashboard chartsData={chartsData} />

      <ChatManager />

      {modalOpen && agendamentoEdit && (
        <EditarAgendamentoModal
          agendamento={agendamentoEdit}
          onClose={() => {
            setModalOpen(false);
            setAgendamentoEdit(null);
          }}
          onSuccess={() => {
            setModalOpen(false);
            setAgendamentoEdit(null);
            setStatusMessage({ type: 'success', message: 'Agendamento atualizado com sucesso.' });
            fetchAgendamentos(pagination.currentPage, filtros);
          }}
        />
      )}
    </div>
  );
}