import { extractApiMessage, normalizeIntegrationStatus } from '@/app/lib/backend'

describe('backend helpers', () => {
  it('normaliza status de integração', () => {
    expect(normalizeIntegrationStatus('ONLINE')).toBe('Online')
    expect(normalizeIntegrationStatus('disconnected')).toBe('Offline')
    expect(normalizeIntegrationStatus(undefined)).toBe('Desconhecido')
  })

  it('extrai mensagem padronizada em payload heterogêneo', () => {
    expect(extractApiMessage({ message: 'erro A' }, 'fallback')).toBe('erro A')
    expect(extractApiMessage({ mensagem: 'erro B' }, 'fallback')).toBe('erro B')
    expect(extractApiMessage({ error: 'erro C' }, 'fallback')).toBe('erro C')
    expect(extractApiMessage({}, 'fallback')).toBe('fallback')
  })
})
