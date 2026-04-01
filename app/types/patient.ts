export interface PatientProntuario {
  resumo: string;
  observacoes: string[];
  alergias: string[];
  medicamentos: string[];
  ultimaAtualizacao: string;
}

// ✅ Novo tipo adicionado
export interface Consulta {
  id: string;
  data: string;
  hora: string;
  medico: string;
  especialidade: string;
  status: "marcada" | "feita" | "cancelada";
  observacao?: string;
}

export interface PatientDashboardData {
  id: string;
  nome: string;
  idade: number;
  telefone: string;
  email: string;
  status: "Ativo" | "Inativo";
  consultasMarcadas: number;
  consultasFeitas: number;
  consultasCanceladas: number;
  prontuario: PatientProntuario;
  consultas: Consulta[]; 
}