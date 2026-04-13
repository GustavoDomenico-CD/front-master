import type {
  Appointment as PatientAppointment,
  PatientDashboardData,
  PatientMedicalRecord,
} from '@/app/types/patient'

type AdminAppointmentRow = {
  id: string
  date: string
  username: string
  email: string
  professional: string
  service: string
  typeOfService: string
  type_appointment: string
  status?: string
  hour: number
  observations?: string
}

/**
 * Normaliza os status vindos de diferentes backends/idiomas para o
 * contrato único usado no dashboard do paciente.
 */
export function mapAppointmentStatus(raw?: string): PatientAppointment['status'] {
  const x = (raw ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (['cancelado', 'canceled', 'cancelled'].includes(x)) return 'canceled'
  if (['concluido', 'completed', 'feito', 'realizado'].includes(x)) return 'completed'
  return 'scheduled'
}

function hourLabel(h: number): string {
  return `${String(Number(h) || 0).padStart(2, '0')}:00`
}

/**
 * Constrói o payload completo do dashboard do paciente a partir do perfil
 * autenticado e da listagem de agendamentos já filtrada por e-mail.
 */
export function buildPatientDashboardFromAppointments(
  profile: {
    id: number
    email: string
    name?: string | null
    phone?: string | null
    isActive?: boolean
  },
  rows: AdminAppointmentRow[],
): PatientDashboardData {
  const appointments: PatientAppointment[] = rows.map((a) => ({
    id: String(a.id),
    date: a.date,
    time: hourLabel(a.hour),
    doctor: a.professional?.trim() || 'Profissional',
    specialty: a.typeOfService?.trim() || a.service?.trim() || '—',
    status: mapAppointmentStatus(a.status),
    notes: a.observations?.trim() || undefined,
  }))

  const scheduledAppointments = appointments.filter((x) => x.status === 'scheduled').length
  const completedAppointments = appointments.filter((x) => x.status === 'completed').length
  const canceledAppointments = appointments.filter((x) => x.status === 'canceled').length

  const notesFromObs = rows
    .map((r) => r.observations?.trim())
    .filter((x): x is string => Boolean(x))

  const medicalRecord: PatientMedicalRecord = {
    summary:
      appointments.length > 0
        ? 'Resumo com base nos seus agendamentos. Para informações clínicas detalhadas, fale com seu profissional.'
        : 'Quando você tiver agendamentos, eles aparecerão nas abas acima.',
    notes: notesFromObs.length > 0 ? notesFromObs : [],
    allergies: [],
    medications: [],
    lastUpdated: new Date().toISOString().slice(0, 10),
  }

  return {
    id: String(profile.id),
    name: profile.name?.trim() || profile.email.split('@')[0] || 'Paciente',
    age: null,
    phone: profile.phone?.trim() || '—',
    email: profile.email,
    status: profile.isActive === false ? 'Inativo' : 'Ativo',
    scheduledAppointments,
    completedAppointments,
    canceledAppointments,
    medicalRecord,
    appointments,
  }
}
