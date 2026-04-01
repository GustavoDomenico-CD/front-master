'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientDashboard from '@/app/shared/PatientDashboard';
import LoadingSpinner from '@/app/shared/LoadingSpinner';
import useSession from '@/app/hooks/useSession';
import { PatientDashboardData } from '@/app/types/patient';

// Replace with real API data when endpoint is ready.
const patientData: PatientDashboardData = {
  id: '1',
  name: 'Maria Silva',
  age: 29,
  phone: '(83) 99999-0000',
  email: 'maria@email.com',
  status: 'Active',
  scheduledAppointments: 4,
  completedAppointments: 12,
  canceledAppointments: 2,
  appointments: [
    {
      id: 'c1',
      date: '2026-04-10',
      time: '14:00',
      doctor: 'Dr. João Souza',
      specialty: 'General Practice',
      status: 'scheduled',
      notes: 'Routine follow-up',
    },
    {
      id: 'c2',
      date: '2026-04-15',
      time: '09:30',
      doctor: 'Dr. Ana Lima',
      specialty: 'Cardiology',
      status: 'scheduled',
    },
    {
      id: 'c3',
      date: '2026-03-20',
      time: '11:00',
      doctor: 'Dr. João Souza',
      specialty: 'General Practice',
      status: 'completed',
      notes: 'Patient reported symptom improvement',
    },
    {
      id: 'c4',
      date: '2026-03-05',
      time: '08:00',
      doctor: 'Dr. Ana Lima',
      specialty: 'Cardiology',
      status: 'canceled',
      notes: 'Patient canceled due to unavailability',
    },
  ],
  medicalRecord: {
    summary: 'Patient under clinical follow-up with stable progress.',
    notes: [
      'Appointment completed on 03/20/2026',
      'Patient reported symptom improvement',
      'Follow-up scheduled for next week',
    ],
    allergies: ['Dipyrone'],
    medications: ['Vitamin D', 'Paracetamol'],
    lastUpdated: '2026-04-01',
  },
};

export default function PatientPage() {
  const router = useRouter();
  
  const { loading, checkSession } = useSession();

  useEffect(() => {
    checkSession().catch(() => router.push('/painel-login'));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return <PatientDashboard patient={patientData} />;
}