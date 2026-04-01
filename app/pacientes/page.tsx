'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientDashboard from '@/app/shared/PatientDashboard';
import LoadingSpinner from '@/app/shared/LoadingSpinner';
import useSession from '@/app/hooks/useSession';
import { PatientDashboardData } from '@/app/types/patient';

// chamada real à API quando o endpoint estiver pronto
const patientData: PatientDashboardData = {
  id: '1',
  nome: 'Maria Silva',
  idade: 29,
  telefone: '(83) 99999-0000',
  email: 'maria@email.com',
  status: 'Ativo',
  consultasMarcadas: 4,
  consultasFeitas: 12,
  consultasCanceladas: 2,
  consultas: [
    {
      id: 'c1',
      data: '2026-04-10',
      hora: '14:00',
      medico: 'Dr. João Souza',
      especialidade: 'Clínico Geral',
      status: 'marcada',
      observacao: 'Retorno de rotina',
    },
    {
      id: 'c2',
      data: '2026-04-15',
      hora: '09:30',
      medico: 'Dra. Ana Lima',
      especialidade: 'Cardiologia',
      status: 'marcada',
    },
    {
      id: 'c3',
      data: '2026-03-20',
      hora: '11:00',
      medico: 'Dr. João Souza',
      especialidade: 'Clínico Geral',
      status: 'feita',
      observacao: 'Paciente relatou melhora no quadro',
    },
    {
      id: 'c4',
      data: '2026-03-05',
      hora: '08:00',
      medico: 'Dra. Ana Lima',
      especialidade: 'Cardiologia',
      status: 'cancelada',
      observacao: 'Paciente desmarcou por indisponibilidade',
    },
  ],
  prontuario: {
    resumo: 'Paciente em acompanhamento clínico com evolução estável.',
    observacoes: [
      'Consulta realizada em 20/03/2026',
      'Paciente relatou melhora no quadro',
      'Retorno agendado para próxima semana',
    ],
    alergias: ['Dipirona'],
    medicamentos: ['Vitamina D', 'Paracetamol'],
    ultimaAtualizacao: '2026-04-01',
  },
};

export default function PacientePage() {
  const router = useRouter();
  
  const { loading, checkSession } = useSession();

  useEffect(() => {
    checkSession().catch(() => router.push('/painel-login'));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return <PatientDashboard patient={patientData} />;
}