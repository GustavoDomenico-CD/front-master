"use client";

import styled from "styled-components";
import { useState } from "react";
import DashboardTabs, { TabItem } from "./DashboardTabs";
import { theme } from "@/app/styles/theme";
import { Consulta, PatientProntuario } from "@/app/types/patient";

type PatientTabsProps = {
  consultas: Consulta[];
  prontuario: PatientProntuario;
};

type TabKey = "marcadas" | "feitas" | "canceladas" | "prontuario";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}



const Wrapper = styled.div`
  background: #ffffff;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.sm};
  overflow: hidden;
`;

const TabContent = styled.div`
  padding: 24px;
  min-height: 200px;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.li<{ $accentColor: string }>`
  padding: 16px;
  border-left: 3px solid ${({ $accentColor }) => $accentColor};
  border-radius: ${theme.radius.md};
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ListItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
`;

const ListItemInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const ConsultaDate = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ConsultaMedico = styled.span`
  font-size: 14px;
  color: #475569;
`;

const ConsultaEspecialidade = styled.span`
  font-size: 12px;
  color: #94a3b8;
  background: ${theme.colors.border};
  padding: 2px 8px;
  border-radius: 999px;
`;

const ConsultaObs = styled.p`
  font-size: 13px;
  color: ${theme.colors.gray};
  margin: 0;
  font-style: italic;
`;

const BadgeTag = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid ${({ $color }) => $color + "55"};
  background: ${({ $color }) => $color + "22"};
  color: ${({ $color }) => $color};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
`;

const EmptyIcon = styled.span`
  font-size: 36px;
`;

const EmptyText = styled.p`
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
`;

const ProntuarioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProntuarioGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ProntuarioCard = styled.div`
  background: #f8fafc;
  border-radius: ${theme.radius.md};
  padding: 16px;
  border: 1px solid ${theme.colors.border};
`;

const ProntuarioCardTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;
`;

const ProntuarioText = styled.p`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
`;

const ProntuarioMuted = styled.p`
  font-size: 13px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
`;

const ProntuarioUpdated = styled.p`
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  text-align: right;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagRed = styled.span`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: ${theme.radius.sm};
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
`;

const TagBlue = styled.span`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: ${theme.radius.sm};
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
`;

const ObsList = styled.ol`
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ObsItem = styled.li`
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
`;

//Tab Config 

const TAB_CONFIG: Record<TabKey, { accent: string; badgeLabel: string }> = {
  marcadas:   { accent: theme.colors.primary, badgeLabel: "Agendada"  },
  feitas:     { accent: theme.colors.success,  badgeLabel: "Realizada" },
  canceladas: { accent: theme.colors.danger,   badgeLabel: "Cancelada" },
  prontuario: { accent: "#a855f7",              badgeLabel: ""          },
};

// Sub-components
function AppointmentsList({
  consultas,
  emptyMessage,
  accentColor,
  badgeColor,
  badgeLabel,
}: {
  consultas: Consulta[];
  emptyMessage: string;
  accentColor: string;
  badgeColor: string;
  badgeLabel: string;
}) {
  if (consultas.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>📋</EmptyIcon>
        <EmptyText>{emptyMessage}</EmptyText>
      </EmptyState>
    );
  }

  return (
    <List>
      {consultas.map((c) => (
        <ListItem key={c.id} $accentColor={accentColor}>
          <ListItemTop>
            <ListItemInfo>
              <ConsultaDate>📅 {formatDate(c.data)} às {c.hora}</ConsultaDate>
              <ConsultaMedico>👨‍⚕️ {c.medico}</ConsultaMedico>
              <ConsultaEspecialidade>{c.especialidade}</ConsultaEspecialidade>
            </ListItemInfo>
            <BadgeTag $color={badgeColor}>{badgeLabel}</BadgeTag>
          </ListItemTop>
          {c.observacao && <ConsultaObs>💬 {c.observacao}</ConsultaObs>}
        </ListItem>
      ))}
    </List>
  );
}

function ProntuarioView({ prontuario }: { prontuario: PatientProntuario }) {
  return (
    <ProntuarioContainer>
      <ProntuarioCard>
        <ProntuarioCardTitle>📝 Resumo Clínico</ProntuarioCardTitle>
        <ProntuarioText>{prontuario.resumo}</ProntuarioText>
      </ProntuarioCard>

      <ProntuarioGrid>
        <ProntuarioCard>
          <ProntuarioCardTitle>⚠️ Alergias</ProntuarioCardTitle>
          {prontuario.alergias.length === 0 ? (
            <ProntuarioMuted>Nenhuma alergia registrada.</ProntuarioMuted>
          ) : (
            <TagList>
              {prontuario.alergias.map((a) => <TagRed key={a}>{a}</TagRed>)}
            </TagList>
          )}
        </ProntuarioCard>

        <ProntuarioCard>
          <ProntuarioCardTitle>💊 Medicamentos</ProntuarioCardTitle>
          {prontuario.medicamentos.length === 0 ? (
            <ProntuarioMuted>Nenhum medicamento registrado.</ProntuarioMuted>
          ) : (
            <TagList>
              {prontuario.medicamentos.map((m) => <TagBlue key={m}>{m}</TagBlue>)}
            </TagList>
          )}
        </ProntuarioCard>
      </ProntuarioGrid>

      <ProntuarioCard>
        <ProntuarioCardTitle>🗒️ Observações</ProntuarioCardTitle>
        {prontuario.observacoes.length === 0 ? (
          <ProntuarioMuted>Nenhuma observação registrada.</ProntuarioMuted>
        ) : (
          <ObsList>
            {prontuario.observacoes.map((obs, i) => (
              <ObsItem key={i}>{obs}</ObsItem>
            ))}
          </ObsList>
        )}
      </ProntuarioCard>

      <ProntuarioUpdated>
        🕐 Última atualização: {formatDate(prontuario.ultimaAtualizacao)}
      </ProntuarioUpdated>
    </ProntuarioContainer>
  );
}

// PatientTabs (main)
export default function PatientTabs({ consultas, prontuario }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("marcadas");

  const marcadas   = consultas.filter((c) => c.status === "marcada");
  const feitas     = consultas.filter((c) => c.status === "feita");
  const canceladas = consultas.filter((c) => c.status === "cancelada");

  
  const TABS: TabItem[] = [
    { id: "marcadas",   label: `🗓️ Marcadas (${marcadas.length})`     },
    { id: "feitas",     label: `✅ Realizadas (${feitas.length})`      },
    { id: "canceladas", label: `❌ Canceladas (${canceladas.length})`  },
    { id: "prontuario", label: "📁 Prontuário"                         },
  ];

  const config = TAB_CONFIG[activeTab as TabKey] ?? TAB_CONFIG.marcadas;

  return (
    <Wrapper>
      <DashboardTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TabContent>
        {activeTab === "marcadas" && (
          <AppointmentsList
            consultas={marcadas}
            emptyMessage="Nenhuma consulta agendada."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "feitas" && (
          <AppointmentsList
            consultas={feitas}
            emptyMessage="Nenhuma consulta realizada registrada."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "canceladas" && (
          <AppointmentsList
            consultas={canceladas}
            emptyMessage="Nenhuma consulta cancelada."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "prontuario" && (
          <ProntuarioView prontuario={prontuario} />
        )}
      </TabContent>
    </Wrapper>
  );
}