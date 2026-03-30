/**
 * Proxy para o backend (NestJS etc.). Usar apenas em Route Handlers / Server Components.
 *
 * Preferir BACKEND_URL (só no servidor). NEXT_PUBLIC_* só se precisar expor ao browser.
 * Repositório irmão típico: ../backend-edge — rode o Nest com PORT=3001 para não conflitar com o Next (3000).
 */

export function getBackendUrl(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://127.0.0.1:3001'
  )
}

export async function getCookieHeader(request?: Request): Promise<string | null> {
  let cookieString = ''

  if (request) {
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) cookieString = cookieHeader
  } else {
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      cookieString = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ')
    } catch (err) {
      console.warn('Não foi possível ler cookies com next/headers', err)
    }
  }

  return cookieString || null
}

export async function backendFetch(
  endpoint: string,
  options: RequestInit & { forwardCookies?: string | null } = {}
): Promise<Response> {
  const { forwardCookies, ...fetchOptions } = options

  const url = `${getBackendUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const headers = new Headers(fetchOptions.headers)
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (forwardCookies) {
    headers.set('Cookie', forwardCookies)
    // Backend Nest uses JWT guard (Bearer). When the browser session is cookie-based
    // in Next routes, propagate Authorization transparently.
    if (!headers.has('Authorization')) {
      const match = forwardCookies.match(/(?:^|;\s*)access_token=([^;]+)/)
      if (match?.[1]) {
        headers.set('Authorization', `Bearer ${decodeURIComponent(match[1])}`)
      }
    }
  }

  try {
    return await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    })
  } catch (error) {
    console.error(`[backendFetch] Erro ao chamar ${url}:`, error)
    throw error
  }
}

export async function getSessionCookie(request?: Request): Promise<string | undefined> {
  const cookieHeader = await getCookieHeader(request)
  if (!cookieHeader) return undefined
  const match = cookieHeader.match(/session=([^;]+)/)
  return match ? match[1] : undefined
}
