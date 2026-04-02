import styled from 'styled-components';
import { KPI } from '../types/kpi';
import { 
  Calendar,
  DollarSign,
  Hourglass,
  TrendingUp,
  Mail,
  UserX,
  Target,
  XCircle
} from 'lucide-react';  

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 32px 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ color }) => color || '#1f2937'};
  margin: 8px 0;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #9ca3af;
`;

const IconWrapper = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const SkeletonBar = styled.div`
  height: 120px;
  background: #f3f4f6;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

interface KPICardsProps {
  kpis: KPI | null;
  loading?: boolean;
}

export default function KPICards({ kpis, loading = false }: KPICardsProps) {
  if (loading) {
    return (
      <CardsGrid>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <SkeletonBar />
          </Card>
        ))}
      </CardsGrid>
    );
  }

  if (!kpis) {
    return <EmptyState>Nenhum dado de KPI disponível</EmptyState>;
  }

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <CardsGrid>
      <Card>
        <IconWrapper><Calendar /></IconWrapper>
        <Title>Total Agendamentos</Title>
        <Value>{kpis.total_appointments.toLocaleString('pt-BR')}</Value>
        <Subtitle>período selecionado</Subtitle>
      </Card>

      <Card>
        <IconWrapper><DollarSign /></IconWrapper>
        <Title>Receita Total</Title>
        <Value color="#10b981">{formatCurrency(kpis.total_revenue)}</Value>
        <Subtitle>valor bruto</Subtitle>
      </Card>

      <Card>
        <IconWrapper><Hourglass />  </IconWrapper>
        <Title>Receita Pendente</Title>
        <Value color="#f59e0b">{formatCurrency(kpis.pending_revenue)}</Value>
        <Subtitle>aguardando pagamento</Subtitle>
      </Card>

      <Card>
        <IconWrapper><TrendingUp /></IconWrapper>
        <Title>Taxa de Conversão</Title>
        <Value color="#3b82f6">{formatPercent(kpis.conversion_rate)}</Value>
        <Subtitle>leads → agendamentos</Subtitle>
      </Card>

      <Card>
        <IconWrapper><Mail /></IconWrapper>
        <Title>Emails Enviados</Title>
        <Value>{kpis.emails_send.toLocaleString('pt-BR')}</Value>
        <Subtitle>total no período</Subtitle>
      </Card>

      <Card>
        <IconWrapper><UserX /></IconWrapper>
        <Title>Taxa de Abandono</Title>
        <Value color="#ef4444">{formatPercent(kpis.showOffRate)}</Value>
        <Subtitle>agendamentos não confirmados</Subtitle>
      </Card>

      <Card>
        <IconWrapper><Target /></IconWrapper>
        <Title>Ticket Médio</Title>
        <Value color="#8b5cf6">{formatCurrency(kpis.medium_ticket_value)}</Value>
        <Subtitle>valor médio por agendamento</Subtitle>
      </Card>

      <Card>
        <IconWrapper><XCircle /></IconWrapper>
        <Title>Cancelamentos</Title>
        <Value color="#991b1b">{kpis.cancellations.toLocaleString('pt-BR')}</Value>
        <Subtitle>total no período</Subtitle>
      </Card>
    </CardsGrid>
  );
}