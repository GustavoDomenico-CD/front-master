import { NextResponse } from 'next/server'
import { backendFetch, getBackendUrl } from '@/app/lib/backend-server'

/**
 * Diagnóstico: o servidor Next consegue falar com BACKEND_URL?
 * GET /api/health/backend — faz um GET na raiz do backend (ex.: "Hello World!" no Nest).
 */
export async function GET() {
  const base = getBackendUrl()
  const started = Date.now()
  try {
    const res = await backendFetch('/', { method: 'GET' })
    const body = await res.text()
    const latencyMs = Date.now() - started
    return NextResponse.json({
      ok: res.ok,
      backendBase: base,
      probe: { path: '/', status: res.status, latencyMs },
      bodyPreview: body.slice(0, 120),
    })
  } catch (e) {
    const latencyMs = Date.now() - started
    return NextResponse.json(
      {
        ok: false,
        backendBase: base,
        probe: { path: '/', status: 0, latencyMs },
        error: e instanceof Error ? e.message : 'fetch failed',
      },
      { status: 503 }
    )
  }
}
