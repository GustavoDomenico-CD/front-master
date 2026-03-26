'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ChartsResponse, ChartData } from '../types/Appoiments';
import { theme } from '../styles/theme';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ────────────────────────────────────────────────────────────────────

const Section = styled.section`
  margin: 32px 0;
  animation: ${fadeIn} 0.4s ease both;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.dark};
  margin: 0 0 24px 0;
  padding-left: 12px;
  border-left: 4px solid ${theme.colors.primary};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
`;

// ─── Card ──────────────────────────────────────────────────────────────────────

const ChartCard = styled.div`
  background: white;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
  padding: 24px;
  overflow: hidden;
`;

const ChartTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${theme.colors.gray};
  margin: 0 0 20px 0;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  color: ${theme.colors.gray};
  font-size: 14px;
  background: ${theme.colors.light};
  border-radius: ${theme.radius.sm};
`;

const ChartCanvas = styled.div`
  height: 280px;
`;

// ─── Constants ─────────────────────────────────────────────────────────────────

const PALETTE = [
  theme.colors.primary,
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function HorizontalBarChart({ data, title }: { data: ChartData; title: string }) {
  if (!data?.labels?.length) return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <EmptyState>Sem dados disponíveis</EmptyState>
    </ChartCard>
  );

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.data,
        backgroundColor: data.labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { ticks: { color: '#374151' } },
    },
  };

  return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <ChartCanvas>
        <Bar data={chartData} options={options} />
      </ChartCanvas>
    </ChartCard>
  );
}

function DonutChart({ data, title }: { data: ChartData; title: string }) {
  if (!data?.labels?.length) return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <EmptyState>Sem dados disponíveis</EmptyState>
    </ChartCard>
  );

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.data,
        backgroundColor: data.labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
    },
  };

  return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <ChartCanvas>
        <Doughnut data={chartData} options={options} />
      </ChartCanvas>
    </ChartCard>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface GraficosDashboardProps {
  chartsData?: ChartsResponse | null;
}

export default function GraficosDashboard({ chartsData }: GraficosDashboardProps) {
  if (!chartsData) return null;

  return (
    <Section>
      <SectionTitle>Análise Visual</SectionTitle>
      <ChartsGrid>
        <HorizontalBarChart
          data={chartsData.appointmentsByService}
          title="Agendamentos por Serviço"
        />
        <DonutChart
          data={chartsData.appointmentsByType}
          title="Distribuição por Tipo"
        />
        <HorizontalBarChart
          data={chartsData.appointmentsByProfessional}
          title="Agendamentos por Profissional"
        />
        <DonutChart
          data={chartsData.appointmentsByTypeOfService}
          title="Tipo de Atendimento"
        />
      </ChartsGrid>
    </Section>
  );
}
