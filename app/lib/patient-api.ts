import { apiRequest, extractApiMessage, parseApiObject } from '@/app/lib/backend'
import type { PatientDashboardData } from '@/app/types/patient'

export async function fetchPatientDashboard(): Promise<PatientDashboardData> {
  const res = await apiRequest('/api/patient/dashboard')
  const payload = await parseApiObject(res)
  if (!res.ok) {
    throw new Error(extractApiMessage(payload, 'Erro ao carregar painel.'))
  }
  return payload as unknown as PatientDashboardData
}
