"use client";

import styled from "styled-components";
import { useState } from "react";
import DashboardTabs, { TabItem } from "./DashboardTabs";
import { theme } from "@/app/styles/theme";
import { Appointment, PatientMedicalRecord } from "@/app/types/patient";

type PatientTabsProps = {
  appointments: Appointment[];
  medicalRecord: PatientMedicalRecord;
};

type TabKey = "scheduled" | "completed" | "canceled" | "medicalRecord";

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

const AppointmentDate = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const AppointmentDoctor = styled.span`
  font-size: 14px;
  color: #475569;
`;

const AppointmentSpecialty = styled.span`
  font-size: 12px;
  color: #94a3b8;
  background: ${theme.colors.border};
  padding: 2px 8px;
  border-radius: 999px;
`;

const AppointmentNotes = styled.p`
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

const MedicalRecordContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MedicalRecordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MedicalRecordCard = styled.div`
  background: #f8fafc;
  border-radius: ${theme.radius.md};
  padding: 16px;
  border: 1px solid ${theme.colors.border};
`;

const MedicalRecordCardTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;
`;

const MedicalRecordText = styled.p`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
`;

const MedicalRecordMuted = styled.p`
  font-size: 13px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
`;

const MedicalRecordUpdated = styled.p`
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

// Tab configuration

const TAB_CONFIG: Record<TabKey, { accent: string; badgeLabel: string }> = {
  scheduled:   { accent: theme.colors.primary, badgeLabel: "Scheduled"  },
  completed:   { accent: theme.colors.success,  badgeLabel: "Completed" },
  canceled:    { accent: theme.colors.danger,   badgeLabel: "Canceled" },
  medicalRecord: { accent: "#a855f7", badgeLabel: "" },
};

// Sub-components
function AppointmentsList({
  appointments,
  emptyMessage,
  accentColor,
  badgeColor,
  badgeLabel,
}: {
  appointments: Appointment[];
  emptyMessage: string;
  accentColor: string;
  badgeColor: string;
  badgeLabel: string;
}) {
  if (appointments.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>📋</EmptyIcon>
        <EmptyText>{emptyMessage}</EmptyText>
      </EmptyState>
    );
  }

  return (
    <List>
      {appointments.map((appointment) => (
        <ListItem key={appointment.id} $accentColor={accentColor}>
          <ListItemTop>
            <ListItemInfo>
              <AppointmentDate>📅 {formatDate(appointment.date)} at {appointment.time}</AppointmentDate>
              <AppointmentDoctor>👨‍⚕️ {appointment.doctor}</AppointmentDoctor>
              <AppointmentSpecialty>{appointment.specialty}</AppointmentSpecialty>
            </ListItemInfo>
            <BadgeTag $color={badgeColor}>{badgeLabel}</BadgeTag>
          </ListItemTop>
          {appointment.notes && <AppointmentNotes>💬 {appointment.notes}</AppointmentNotes>}
        </ListItem>
      ))}
    </List>
  );
}

function MedicalRecordView({ medicalRecord }: { medicalRecord: PatientMedicalRecord }) {
  return (
    <MedicalRecordContainer>
      <MedicalRecordCard>
        <MedicalRecordCardTitle>📝 Clinical Summary</MedicalRecordCardTitle>
        <MedicalRecordText>{medicalRecord.summary}</MedicalRecordText>
      </MedicalRecordCard>

      <MedicalRecordGrid>
        <MedicalRecordCard>
          <MedicalRecordCardTitle>⚠️ Allergies</MedicalRecordCardTitle>
          {medicalRecord.allergies.length === 0 ? (
            <MedicalRecordMuted>No allergies registered.</MedicalRecordMuted>
          ) : (
            <TagList>
              {medicalRecord.allergies.map((a) => <TagRed key={a}>{a}</TagRed>)}
            </TagList>
          )}
        </MedicalRecordCard>

        <MedicalRecordCard>
          <MedicalRecordCardTitle>💊 Medications</MedicalRecordCardTitle>
          {medicalRecord.medications.length === 0 ? (
            <MedicalRecordMuted>No medications registered.</MedicalRecordMuted>
          ) : (
            <TagList>
              {medicalRecord.medications.map((m) => <TagBlue key={m}>{m}</TagBlue>)}
            </TagList>
          )}
        </MedicalRecordCard>
      </MedicalRecordGrid>

      <MedicalRecordCard>
        <MedicalRecordCardTitle>🗒️ Notes</MedicalRecordCardTitle>
        {medicalRecord.notes.length === 0 ? (
          <MedicalRecordMuted>No notes registered.</MedicalRecordMuted>
        ) : (
          <ObsList>
            {medicalRecord.notes.map((obs, i) => (
              <ObsItem key={i}>{obs}</ObsItem>
            ))}
          </ObsList>
        )}
      </MedicalRecordCard>

      <MedicalRecordUpdated>
        🕐 Last update: {formatDate(medicalRecord.lastUpdated)}
      </MedicalRecordUpdated>
    </MedicalRecordContainer>
  );
}

// PatientTabs (main)
export default function PatientTabs({ appointments, medicalRecord }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("scheduled");

  const scheduledAppointments = appointments.filter((c) => c.status === "scheduled");
  const completedAppointments = appointments.filter((c) => c.status === "completed");
  const canceledAppointments = appointments.filter((c) => c.status === "canceled");

  
  const TABS: TabItem[] = [
    { id: "scheduled",   label: `🗓️ Scheduled (${scheduledAppointments.length})`     },
    { id: "completed",   label: `✅ Completed (${completedAppointments.length})`      },
    { id: "canceled", label: `❌ Canceled (${canceledAppointments.length})`  },
    { id: "medicalRecord", label: "📁 Medical Record"                         },
  ];

  const config = TAB_CONFIG[activeTab as TabKey] ?? TAB_CONFIG.scheduled;

  return (
    <Wrapper>
      <DashboardTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TabContent>
        {activeTab === "scheduled" && (
          <AppointmentsList
            appointments={scheduledAppointments}
            emptyMessage="No scheduled appointments."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "completed" && (
          <AppointmentsList
            appointments={completedAppointments}
            emptyMessage="No completed appointments recorded."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "canceled" && (
          <AppointmentsList
            appointments={canceledAppointments}
            emptyMessage="No canceled appointments."
            accentColor={config.accent}
            badgeColor={config.accent}
            badgeLabel={config.badgeLabel}
          />
        )}
        {activeTab === "medicalRecord" && (
          <MedicalRecordView medicalRecord={medicalRecord} />
        )}
      </TabContent>
    </Wrapper>
  );
}