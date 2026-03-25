'use client';

import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChartsResponse, ChartData } from '../types/Appoiments';
import { theme } from '../styles/theme';

// ─── Animations ────────────────────────────────────────────────────────────────

const growUp = keyframes`
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
`;

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

// ─── Bar Chart ─────────────────────────────────────────────────────────────────

const BarChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr 44px;
  align-items: center;
  gap: 10px;
`;

const BarLabel = styled.span`
  font-size: 13px;
  color: ${theme.colors.dark};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BarTrack = styled.div`
  height: 12px;
  background: ${theme.colors.light};
  border-radius: 999px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $color: string; $delay: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 999px;
  transform-origin: left;
  animation: ${growUp} 0.5s ease ${({ $delay }) => $delay}s both;
`;

const BarValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.dark};
  text-align: right;
`;

// ─── Donut Chart (SVG) ─────────────────────────────────────────────────────────

const DonutWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const DonutLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 120px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${theme.colors.dark};
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
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

  const max = Math.max(...data.data, 1);

  return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <BarChartWrapper>
        {data.labels.map((label, i) => {
          const pct = (data.data[i] / max) * 100;
          return (
            <BarRow key={label}>
              <BarLabel title={label}>{label}</BarLabel>
              <BarTrack>
                <BarFill $pct={pct} $color={PALETTE[i % PALETTE.length]} $delay={i * 0.05} />
              </BarTrack>
              <BarValue>{data.data[i]}</BarValue>
            </BarRow>
          );
        })}
      </BarChartWrapper>
    </ChartCard>
  );
}

function DonutChart({ data, title }: { data: ChartData; title: string }) {
  const segments = useMemo(() => {
    if (!data?.labels?.length) return [];
    const total = data.data.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const r = 54;
    const cx = 70;
    const cy = 70;
    const circumference = 2 * Math.PI * r;

    return data.labels.map((label, i) => {
      const pct = data.data[i] / total;
      const offset = circumference * (1 - pct);
      const rotate = cumulative * 360;
      cumulative += pct;
      return {
        label,
        value: data.data[i],
        pct: (pct * 100).toFixed(1),
        color: PALETTE[i % PALETTE.length],
        offset,
        rotate,
        circumference,
        r,
        cx,
        cy,
      };
    });
  }, [data]);

  if (!segments.length) return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <EmptyState>Sem dados disponíveis</EmptyState>
    </ChartCard>
  );

  return (
    <ChartCard>
      <ChartTitle>{title}</ChartTitle>
      <DonutWrapper>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={seg.cx}
              cy={seg.cy}
              r={seg.r}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={`${seg.circumference * (parseFloat(seg.pct) / 100)} ${seg.circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${seg.rotate - 90} ${seg.cx} ${seg.cy})`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          ))}
          <circle cx={70} cy={70} r={44} fill="white" />
        </svg>
        <DonutLegend>
          {segments.map((seg, i) => (
            <LegendItem key={i}>
              <LegendDot $color={seg.color} />
              <span style={{ flex: 1 }}>{seg.label}</span>
              <span style={{ fontWeight: 600, fontSize: '12px', color: theme.colors.gray }}>
                {seg.pct}%
              </span>
            </LegendItem>
          ))}
        </DonutLegend>
      </DonutWrapper>
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
