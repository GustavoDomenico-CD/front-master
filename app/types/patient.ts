export interface PatientMedicalRecord {
  summary: string;
  notes: string[];
  allergies: string[];
  medications: string[];
  lastUpdated: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: "scheduled" | "completed" | "canceled";
  notes?: string;
}

export interface PatientDashboardData {
  id: string;
  name: string;
  /** Quando não há data de nascimento no cadastro, exibir como “não informada”. */
  age: number | null;
  phone: string;
  email: string;
  status: "Ativo" | "Inativo";
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  medicalRecord: PatientMedicalRecord;
  appointments: Appointment[];
}