'use client'

import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

export interface TabItem {
  id: string
  label: string
  adminOnly?: boolean
}

interface DashboardTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  userRole?: string
}

const TabsContainer = styled.nav`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  touch-action: pan-x;

  &::-webkit-scrollbar {
    height: 0;
  }
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  scroll-snap-align: center;

  background: ${p => p.$active ? '#ffffff' : 'transparent'};
  color: ${p => p.$active ? '#1f2937' : '#6b7280'};
  box-shadow: ${p => p.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #1f2937;
    background: ${p => p.$active ? '#ffffff' : '#e2e8f0'};
  }
`

const AdminBadge = styled.span`
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: #dbeafe;
  color: #1d4ed8;
  margin-left: 6px;
  vertical-align: middle;
`

export default function DashboardTabs({ tabs, activeTab, onTabChange, userRole }: DashboardTabsProps) {
  const containerRef = useRef<HTMLElement | null>(null)

  const visibleTabs = useMemo(() => {
    return tabs.filter(t => {
      if (t.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') return false
      return true
    })
  }, [tabs, userRole])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeEl = container.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`)
    if (!activeEl) return
    activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeTab])

  const handleWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    const el = containerRef.current
    if (!el) return
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return

    // Turn vertical wheel into horizontal scroll for overflowed tabs.
    e.preventDefault()
    el.scrollBy({ left: e.deltaY, behavior: 'smooth' })
  }

  return (
    <TabsContainer ref={containerRef} onWheel={handleWheel}>
      {visibleTabs.map(tab => (
        <TabButton
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          data-tab-id={tab.id}
        >
          {tab.label}
          {tab.adminOnly && <AdminBadge>Admin</AdminBadge>}
        </TabButton>
      ))}
    </TabsContainer>
  )
}
