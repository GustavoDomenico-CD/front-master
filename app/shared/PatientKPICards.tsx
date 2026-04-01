"use client";

import styled from "styled-components";
import { PatientDashboardData } from "@/app/types/patient";
import { theme } from "@/app/styles/theme";

interface PatientKPICardsProps {
  patient: PatientDashboardData;
}

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
`;


const Card = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  padding: 24px;
  box-shadow: ${theme.shadow.md};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;


const IconWrapper = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.gray};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`;

const Value = styled.div<{ $color?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${({ $color }) => $color || theme.colors.dark};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

export default function PatientKPICards({ patient }: PatientKPICardsProps) {
  return (
    <CardsGrid>
      <Card>
        <IconWrapper>🗓️</IconWrapper>
        <Title>Scheduled Appointments</Title>
        <Value $color={theme.colors.primary}>{patient.scheduledAppointments}</Value>
        <Subtitle>Total scheduled appointments</Subtitle>
      </Card>

      <Card>
        <IconWrapper>✅</IconWrapper>
        <Title>Completed Appointments</Title>
        <Value $color={theme.colors.success}>{patient.completedAppointments}</Value>
        <Subtitle>Total completed appointments</Subtitle>
      </Card>

      <Card>
        <IconWrapper>❌</IconWrapper>
        <Title>Canceled Appointments</Title>
        <Value $color={theme.colors.danger}>{patient.canceledAppointments}</Value>
        <Subtitle>Total canceled appointments</Subtitle>
      </Card>
    </CardsGrid>
  );
}