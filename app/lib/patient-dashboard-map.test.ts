import { buildPatientDashboardFromAppointments, mapAppointmentStatus } from '@/app/lib/patient-dashboard-map'

describe('patient-dashboard-map', () => {
  it('normaliza status multilíngue', () => {
    expect(mapAppointmentStatus('Concluído')).toBe('completed')
    expect(mapAppointmentStatus('cancelled')).toBe('canceled')
    expect(mapAppointmentStatus('qualquer')).toBe('scheduled')
  })

  it('monta resumo e contadores do dashboard', () => {
    const dashboard = buildPatientDashboardFromAppointments(
      { id: 10, email: 'pessoa@teste.com', name: 'Pessoa Teste', isActive: true },
      [
        {
          id: '1',
          date: '2026-04-10',
          username: 'Pessoa Teste',
          email: 'pessoa@teste.com',
          professional: 'Dr. A',
          service: 'Consulta',
          typeOfService: 'Odonto',
          type_appointment: 'consulta',
          status: 'concluido',
          hour: 9,
        },
        {
          id: '2',
          date: '2026-04-12',
          username: 'Pessoa Teste',
          email: 'pessoa@teste.com',
          professional: 'Dr. B',
          service: 'Retorno',
          typeOfService: 'Odonto',
          type_appointment: 'retorno',
          status: 'cancelado',
          hour: 14,
        },
      ]
    )

    expect(dashboard.completedAppointments).toBe(1)
    expect(dashboard.canceledAppointments).toBe(1)
    expect(dashboard.scheduledAppointments).toBe(0)
    expect(dashboard.appointments).toHaveLength(2)
  })
})
