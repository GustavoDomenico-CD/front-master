interface LoginAttempt{
    date_hour: string;
    user: string;
    status : string;
    ip: string;
}

interface InteractionLog{
    date_hour: string;
    session_id: string;
    question: string;
    answer: string;
    feedback?: string;
}

interface StatusData{
    sheets: 'ONLINE' | 'OFFLINE';
    calendar: 'ONLINE' | 'OFFLINE';
    gmail: 'ONLINE' | 'OFFLINE';
    login_attempts: LoginAttempt[];
    interaction_logs: InteractionLog[];
}

interface KpiData{
 total_appointments: number;
 total_revenue: number;
 pending_revenue: number;
 conversion_rate: number;
 emails_send: number;
 showOffRate: number;
 medium_ticket_value: number;
 cancellations: number;
}

interface Appointment{
    id: string;
    date: string;
    username: string;
    email: string;
    telephone: string;
    service: string;
    professional: string;
    typeOfService: string;
    local?: string;
    type_appointment: string;
    status?: string;
    day_of_month: number;
    hour: number;
    duration: number;
    observations?: string;
    /** Prontuário / receitas (texto) para envio ao paciente. */
    prescriptionText?: string;
    /** Quando o backend enviou a receita por WhatsApp (ISO). */
    whatsappPrescriptionSentAt?: string;
}

interface Filters{
    startDate: string;
    endDate: string;
    service: string;
    professional: string;
    typeOfService: string;
    type_appointment: string;
    status: string;
    local: string;
}

interface ChartData{
    labels: string[];
    data: number[];
}

interface ChartsResponse{
    appointmentsByService: ChartData;
    appointmentsByProfessional: ChartData;
    appointmentsByTypeOfService: ChartData;
    appointmentsByType: ChartData;

}

export type {LoginAttempt, InteractionLog, StatusData, KpiData, Appointment, Filters, ChartData, ChartsResponse};
