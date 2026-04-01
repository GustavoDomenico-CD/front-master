"use client";

import styled from "styled-components";
import { PatientDashboardData } from "@/app/types/patient";
import PatientHeader from "@/app/shared/PatientHeader";
import PatientKPICards from "@/app/shared/PatientKPICards";
import PatientTabs from "@/app/shared/PatientTabs";

interface PatientDashboardProps {
  patient: PatientDashboardData;
}


const PageWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 16px;
`;

const Section = styled.section<{ $marginTop?: number }>`
  margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : "0")};
`;

export default function PatientDashboard({ patient }: PatientDashboardProps) {
  return (
    <PageWrapper>
      <PatientHeader patient={patient} />

      <Section $marginTop={24}>
        <PatientKPICards patient={patient} />
      </Section>

      <Section $marginTop={24}>
        <PatientTabs
          appointments={patient.appointments}
          medicalRecord={patient.medicalRecord}
        />
      </Section>
    </PageWrapper>
  );
}