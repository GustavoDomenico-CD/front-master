'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import {useIntegrationsStatus} from "./../hooks/useIntegrationStatus"

const StatusContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin: 24px 0;
`

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1f2937;
`

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`

const StatusCard = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`

const ServiceName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #374151;
`

const StatusBadge = styled.span<{ $status: 'Online' | 'Offline' | 'Desconhecido' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;

  background: ${props => {
    if (props.$status === 'Online') return '#d1fae5'
    if (props.$status === 'Offline') return '#fee2e2'
    return '#f3f4f6'
  }};

  color: ${props => {
    if (props.$status === 'Online') return '#065f46'
    if (props.$status === 'Offline') return '#991b1b'
    return '#4b5563'
  }};
`

const Dot = styled.span<{ $status: 'Online' | 'Offline' | 'Desconhecido' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    if (props.$status === 'Online') return '#10b981'
    if (props.$status === 'Offline') return '#ef4444'
    return '#9ca3af'
  }};
`

const LastCheck = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 12px;
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
`

export default function IntegrationsStatus(){
    const {status, loading, error, refetch, isPolling,togglePolling} = useIntegrationsStatus({
        autoFetch: true,
        pollingIntervalMs: 180000,
    })


const services = [
    {name: 'Google Sheets', key: 'sheets' as const },
    {name: 'Google Calendar', key: 'calendar' as const},
    {name: 'Gmail', key: 'gmail' as const}
]

return (
   <StatusContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title>Status das Integrações</Title>
        <div>
          <button
            onClick={() => togglePolling()}
            style={{
              marginRight: '12px',
              padding: '6px 12px',
              fontSize: '13px',
              background: isPolling ? '#dcfce7' : '#fee2e2',
              color: isPolling ? '#166534' : '#991b1b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {isPolling ? 'Polling: ON' : 'Polling: OFF'}
          </button>

          <button
            onClick={refetch}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Atualizando...' : 'Atualizar agora'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>}

      <StatusGrid>
        {services.map(service => {
          const current = status[service.key]

          return (
            <StatusCard key={service.key}>
              <ServiceName>{service.name}</ServiceName>
              <StatusBadge $status={current}>
                <Dot $status={current} />
                {current}
              </StatusBadge>
            </StatusCard>
          )
        })}
      </StatusGrid>

      {status.lastCheck && (
        <LastCheck>Última verificação: {status.lastCheck}</LastCheck>
      )}
    </StatusContainer>
)

}
