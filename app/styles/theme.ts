export const theme = {
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#1f2937',
    light: '#f8fafc',
    gray: '#6b7280',
    border: '#e5e7eb',
    /** Fundo do painel (slate corporativo) */
    panelSlate: '#e2e8f0',
    panelSlateSoft: '#f1f5f9',
    panelAccent: '#dbeafe',
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
  },
  shadow: {
    sm: '0 1px 3px rgba(15, 23, 42, 0.08)',
    md: '0 4px 12px rgba(15, 23, 42, 0.08)',
    /** Cartões e tabelas — leitura clara em fundo tintado */
    table:
      '0 8px 32px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.04)',
  },
  panel: {
    pageBackground:
      'linear-gradient(165deg, #eef2f7 0%, #e2e8f0 38%, #f1f5f9 72%, #f8fafc 100%)',
  },
} as const