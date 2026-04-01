"use client";

import styled from "styled-components";
import { PatientDashboardData } from "@/app/types/patient";
import { theme } from "@/app/styles/theme";

interface PatientHeaderProps {
  patient: PatientDashboardData;
}

const HeaderCard = styled.div`
  background: #ffffff;
  border-radius: ${theme.radius.lg};
  padding: 24px;
  box-shadow: ${theme.shadow.md};
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PatientName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.dark};
  margin: 0;
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const InfoText = styled.span`
  font-size: 14px;
  color: ${theme.colors.gray};
`;

const StatusBadge = styled.span<{ $status: "Ativo" | "Inativo" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ $status }) => ($status === "Ativo" ? "#dcfce7" : "#fee2e2")};
  color: ${({ $status }) => ($status === "Ativo" ? "#166534" : "#991b1b")};
`;

export default function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <HeaderCard>
      <TopRow>
        <PatientInfo>
          <PatientName>{patient.nome}</PatientName>
          <InfoRow>
            <InfoText>Idade: {patient.idade} anos</InfoText>
            <InfoText>Telefone: {patient.telefone}</InfoText>
            <InfoText>Email: {patient.email}</InfoText>
          </InfoRow>
        </PatientInfo>

        <StatusBadge $status={patient.status}>{patient.status}</StatusBadge>
      </TopRow>
    </HeaderCard>
  );
}