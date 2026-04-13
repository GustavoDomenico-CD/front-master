'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'

import PatientDashboard from '@/app/shared/PatientDashboard'
import LoadingSpinner from '@/app/shared/LoadingSpinner'
import { checkSession, postLogout } from '@/app/lib/backend'
import { fetchPatientDashboard } from '@/app/lib/patient-api'
import { can } from '@/app/lib/authz'
import type { PatientDashboardData } from '@/app/types/patient'

const Shell = styled.div`
  min-height: 100dvh;
  background: #f1f5f9;
`

const TopBar = styled.header`
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`

const LogoutBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #f8fafc;
  }
`

const ErrorBox = styled.div`
  max-width: 560px;
  margin: 48px auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #fecaca;
  color: #991b1b;
  text-align: center;
`

export default function PacientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<PatientDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dash = await fetchPatientDashboard()
      setPatient(dash)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar.'
      setError(msg)
      setPatient(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const u = await checkSession()
        if (!can(u, 'patient:access')) {
          if (!cancelled) setLoading(false)
          router.replace('/painel-agendamento')
          return
        }
      } catch {
        if (!cancelled) setLoading(false)
        router.replace('/painel-login')
        return
      }
      if (!cancelled) await load()
    })()
    return () => {
      cancelled = true
    }
  }, [router, load])

  const handleLogout = async () => {
    await postLogout().catch(() => {})
    router.replace('/painel-login')
  }

  if (loading) return <LoadingSpinner fullScreen text="Carregando sua área..." />

  if (error || !patient) {
    const isForbidden = error?.includes('exclusiva')
    return (
      <Shell>
        <TopBar>
          <LogoutBtn type="button" onClick={handleLogout}>
            Sair
          </LogoutBtn>
        </TopBar>
        <ErrorBox>
          <p>{error ?? 'Não foi possível carregar os dados.'}</p>
          {!isForbidden && (
            <LogoutBtn type="button" onClick={() => load()} style={{ marginTop: 16 }}>
              Tentar novamente
            </LogoutBtn>
          )}
        </ErrorBox>
      </Shell>
    )
  }

  return (
    <Shell>
      <TopBar>
        <LogoutBtn type="button" onClick={handleLogout}>
          Sair
        </LogoutBtn>
      </TopBar>
      <PatientDashboard patient={patient} />
    </Shell>
  )
}
