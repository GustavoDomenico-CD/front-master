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
  age: number;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  medicalRecord: PatientMedicalRecord;
  appointments: Appointment[];
}