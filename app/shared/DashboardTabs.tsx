'use client'

import { useMemo, useRef, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import {
  Calendar,
  BarChart2,
  Zap,
  DoorOpen,
  Bot,
  ClipboardList,
  MessageSquare,
  Mail,
  Users,
  FileText,
  Wifi,
  UserCog,
  LucideIcon,
} from 'lucide-react'

export interface TabItem {
  id: string
  label: string
  adminOnly?: boolean
  icon?: LucideIcon
}

interface DashboardTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  userRole?: string
}

const TAB_ICONS: Record<string, LucideIcon> = {
  agendamentos: Calendar,
  kpis: BarChart2,
  integracoes: Zap,
  salas: DoorOpen,
  chatbot: Bot,
  'chatbot-cadastros': ClipboardList,
  'whatsapp-chat': MessageSquare,
  'whatsapp-mensagens': Mail,
  'whatsapp-contatos': Users,
  'whatsapp-templates': FileText,
  'whatsapp-conexao': Wifi,
  usuarios: UserCog,
}

export const SIDEBAR_COLLAPSED = '64px'
export const SIDEBAR_EXPANDED = '250px'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
`

const SidebarWrapper = styled.aside<{ $expanded: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${p => (p.$expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)};
  background: #0f172a;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 100;
  box-shadow: 2px 0 16px rgba(0,0,0,0.18);
`

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 20px;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 8px;
  min-height: 48px;
`

const LogoDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 16px;
`

const LogoLabel = styled.span<{ $visible: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  opacity: ${p => (p.$visible ? 1 : 0)};
  transition: opacity 0.15s;
  ${p => p.$visible && css`animation: ${fadeIn} 0.18s ease;`}
`

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 0; }
`

const NavItem = styled.li``

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: ${p => (p.$active ? 'rgba(59,130,246,0.18)' : 'transparent')};
  border-left: 3px solid ${p => (p.$active ? '#3b82f6' : 'transparent')};
  color: ${p => (p.$active ? '#93c5fd' : '#94a3b8')};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
  min-height: 44px;

  &:hover {
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
  }

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`

const NavLabel = styled.span<{ $visible: boolean }>`
  font-size: 13.5px;
  font-weight: 600;
  opacity: ${p => (p.$visible ? 1 : 0)};
  transition: opacity 0.12s;
  ${p => p.$visible && css`animation: ${fadeIn} 0.18s ease;`}
`

const BadgeAdmin = styled.span<{ $visible: boolean }>`
  display: ${p => (p.$visible ? 'inline-flex' : 'none')};
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  background: #1e3a8a;
  color: #93c5fd;
  margin-left: auto;
  white-space: nowrap;
`

const Tooltip = styled.div`
  position: fixed;
  left: calc(${SIDEBAR_COLLAPSED} + 8px);
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 200;
  animation: ${fadeIn} 0.12s ease;
`

export default function DashboardTabs({ tabs, activeTab, onTabChange, userRole }: DashboardTabsProps) {
  const [expanded, setExpanded] = useState(false)
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibleTabs = useMemo(
    () =>
      tabs.filter(t => {
        if (t.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') return false
        return true
      }),
    [tabs, userRole]
  )

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setExpanded(true)
    setTooltip(null)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setExpanded(false)
    }, 120)
  }

  const handleNavMouseEnter = (label: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (expanded) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, y: rect.top + rect.height / 2 - 14 })
  }

  const handleNavMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <SidebarWrapper
      $expanded={expanded}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LogoArea>
        <LogoDot>P</LogoDot>
        <LogoLabel $visible={expanded}>Painel</LogoLabel>
      </LogoArea>

      <NavList>
        {visibleTabs.map(tab => {
          const Icon = TAB_ICONS[tab.id] || Calendar
          return (
            <NavItem key={tab.id}>
              <NavButton
                $active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                data-tab-id={tab.id}
                onMouseEnter={e => handleNavMouseEnter(tab.label, e)}
                onMouseLeave={handleNavMouseLeave}
              >
                <Icon strokeWidth={2} />
                <NavLabel $visible={expanded}>{tab.label}</NavLabel>
                {tab.adminOnly && (
                  <BadgeAdmin $visible={expanded}>Admin</BadgeAdmin>
                )}
              </NavButton>
            </NavItem>
          )
        })}
      </NavList>

      {tooltip && !expanded && (
        <Tooltip style={{ top: tooltip.y }}>{tooltip.label}</Tooltip>
      )}
    </SidebarWrapper>
  )
}