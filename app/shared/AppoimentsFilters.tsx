import React, { useState } from "react";
import { Filters } from "@/app/types/Appoiments";
import styled from "styled-components";
import { theme } from "../styles/theme";

const ContainerFilters = styled.div`
background: white;
border-radius: ${theme.radius.md};
box-shadow: ${theme.shadow.md};
padding: 24px;
margin: 24px;
`;

const Title = styled.h2`
margin:0 0 16px 0;
color: ${theme.colors.dark};
font-size: 20px;
`;

const FormGrid = styled.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 16px;
`;

const FormGroup = styled.div`
display: flex;
flex-direction: column;
gap: 8px;
`;

const Label = styled.label`
font-size: 14px;
font-weight: 600;
color: ${theme.colors.gray};
margin-bottom: 4px;
`;

const Input = styled.input`
padding: 10px 12px;
border: 1px solid ${theme.colors.border};
border-radius: ${theme.radius.sm};
font-size: 14px;
color: ${theme.colors.dark};
transition: border-color 0.2s;
&:focus {
  border-color: ${theme.colors.primary};
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
`;

const Select = styled.select`
padding: 10px 12px;
border: 1px solid ${theme.colors.border};
border-radius: ${theme.radius.sm};
font-size: 14px;
color: ${theme.colors.dark};
transition: border-color 0.2s;
cursor: pointer;
&:focus {
  border-color: ${theme.colors.primary};
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
`;

/** Deve ser div: não pode envolver <button> dentro de <button> (HTML inválido + hydration error). */
const ButtonGroup = styled.div`
display: flex;
gap: 16px;
margin-top: 24px;
justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
padding: 10px 20px;
border: none;
border-radius: ${theme.radius.sm};
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s;
${({ variant }) => variant === 'primary' ? `
  background: ${theme.colors.primary};
  color: white;
  &:hover {
    background: ${theme.colors.primary}cc;
  }
` : `
  background: ${theme.colors.light};
  color: ${theme.colors.dark};
  border: 1px solid ${theme.colors.border};
  &:hover {
    background: #e2e8f0;
  }
`}`;

interface FiltersAppoimentsProps {
    onApply: (filters: Filters) => void;
    professionals?: { id: number; name: string }[];
    local?: { id: number; name: string }[];
    services?: { id: number; name: string }[];
}

const MOCK_PROFESSIONALS = [
  { id: 1, name: "Dra. Ana Souza" },
  { id: 2, name: "Dr. Bruno Lima" },
  { id: 3, name: "Dra. Camila Prado" },
  { id: 4, name: "Dr. Daniel Costa" },
];

const MOCK_LOCALS = [
  { id: 1, name: "Clinica Centro" },
  { id: 2, name: "Clinica Zona Sul" },
  { id: 3, name: "Clinica Zona Norte" },
];

const MOCK_SERVICE_TYPES_BY_PROFESSIONAL: Record<string, string[]> = {
  "Dra. Ana Souza": ["Limpeza", "Clareamento", "Avaliacao"],
  "Dr. Bruno Lima": ["Canal", "Extracao", "Urgencia"],
  "Dra. Camila Prado": ["Ortodontia", "Manutencao de aparelho", "Avaliacao"],
  "Dr. Daniel Costa": ["Implante", "Protese", "Cirurgia oral"],
};

const STATUS_OPTIONS = ["Pendente", "Confirmado", "Concluido", "Cancelado"];
const APPOINTMENT_TYPES = ["Consulta", "Retorno", "Urgencia"];

const AppointmentsFilters: React.FC<FiltersAppoimentsProps> = ({
  onApply,
  professionals = [],
  local = [],
  services = [],
}) => {
  const professionalOptions = professionals.length > 0 ? professionals : MOCK_PROFESSIONALS;
  const localOptions = local.length > 0 ? local : MOCK_LOCALS;

  const [filtros, setFiltros] = useState<Filters>({
    startDate: '',
    endDate: '',
    service: '',
    professional: '',
    typeOfService: '',
    type_appointment: '',
    status: '',
    local: '',
  });

  // Só na montagem: [local] quebrava — o default `local = []` é um array novo a cada render,
  // logo o efeito repetia sem parar (setFiltros → re-render → nova referência → efeito de novo).
  React.useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFiltros((prev) => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => {
      // Quando troca profissional, limpamos o tipo de serviço para evitar combinação inválida.
      if (name === "professional") {
        return { ...prev, professional: value, typeOfService: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const selectedProfessional = filtros.professional;
  const serviceTypeOptions = selectedProfessional
    ? (MOCK_SERVICE_TYPES_BY_PROFESSIONAL[selectedProfessional] ?? [])
    : Array.from(new Set(Object.values(MOCK_SERVICE_TYPES_BY_PROFESSIONAL).flat()));
  const serviceOptions = services.length > 0 ? services : serviceTypeOptions.map((name, i) => ({ id: i + 1, name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filtros);
  };

  const handleReset = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const resetFiltros: Filters = {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      service: '',
      professional: '',
      typeOfService: '',
      type_appointment: '',
      status: '',
      local: '',
    };
    setFiltros(resetFiltros);
    onApply(resetFiltros);
  }

  return (
    <ContainerFilters>
      <Title>Filtros de Agendamentos</Title>
      <form onSubmit={handleSubmit}>
        <FormGrid>
            <FormGroup>
                <Label htmlFor="startDate">Data Início</Label>
                <Input type="date" id="startDate" name="startDate" value={filtros.startDate} onChange={handleChange} />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="endDate">Data Fim</Label>
                <Input type="date" id="endDate" name="endDate" value={filtros.endDate} onChange={handleChange} />
            </FormGroup>
            
            <FormGroup>
                <Label htmlFor="service">Serviço</Label>
                <Select id="service" name="service" value={filtros.service} onChange={handleChange}>
                    <option value="">Todos</option>
                    {serviceOptions.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="professional">Profissional</Label>
                <Select id="professional" name="professional" value={filtros.professional} onChange={handleChange}>
                    <option value="">Todos</option>
                    {professionalOptions.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="typeOfService">Tipo de Serviço (por profissional)</Label>
                <Select id="typeOfService" name="typeOfService" value={filtros.typeOfService } onChange={handleChange}>
                    <option value="">Todos</option>
                    {serviceTypeOptions.map((serviceType) => (
                        <option key={serviceType} value={serviceType}>{serviceType}</option>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="type_appointment">Tipo de Agendamento</Label>
                <Select id="type_appointment" name="type_appointment" value={filtros.type_appointment} onChange={handleChange}>
                    <option value="">Todos</option>
                    {APPOINTMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" value={filtros.status} onChange={handleChange}>
                    <option value="">Todos</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="local">Unidade</Label>
                <Select id="local" name="local" value={filtros.local} onChange={handleChange}>
                    <option value="">Todos</option>
                    {localOptions.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                </Select>
            </FormGroup>
        </FormGrid>

        <ButtonGroup>
            <Button type="button" variant="secondary" onClick={handleReset}>Limpar</Button>
            <Button type="submit" variant="primary">Aplicar</Button>
        </ButtonGroup>
      </form>
    </ContainerFilters>
  );
};

export default AppointmentsFilters;