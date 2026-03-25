#!/usr/bin/env node
/**
 * Teste smoke de todas as rotas /api existentes no app (Next).
 *
 * Uso:
 *   BASE_URL=http://localhost:3040 node scripts/test-all-routes.mjs
 *
 * Observação:
 *   Algumas rotas de "admin/appoiments/*" dependem de endpoints equivalentes no
 *   backend (backend-edge). Se o backend não implementar, o teste pode retornar
 *   404/500 (mas não deve retornar 404 de rota do Next).
 */

const base = (process.env.BASE_URL || 'http://localhost:3040').replace(/\/$/, '')

function toPreview(str, max = 220) {
  const s = typeof str === 'string' ? str : JSON.stringify(str)
  return s.length > max ? s.slice(0, max) + '…' : s
}

async function fetchWithBody(method, path, init = {}) {
  const url = `${base}${path}`
  const res = await fetch(url, {
    method,
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const contentType = res.headers.get('content-type') || ''
  let bodyPreview = ''
  if (contentType.includes('application/json')) {
    try {
      const json = await res.json()
      bodyPreview = toPreview(json)
    } catch {
      bodyPreview = `failed-json-parse (HTTP ${res.status})`
    }
  } else {
    try {
      const text = await res.text()
      bodyPreview = toPreview(text)
    } catch {
      bodyPreview = `failed-text-read (HTTP ${res.status})`
    }
  }
  return { method, url, status: res.status, bodyPreview }
}

function extractCookieValue(setCookieHeaders, cookieName) {
  if (!setCookieHeaders) return null
  const raw = Array.isArray(setCookieHeaders) ? setCookieHeaders.join('\n') : String(setCookieHeaders)
  // captura: cookieName=<value>; ...
  const re = new RegExp(`${cookieName}=([^;]+);?`, 'i')
  const m = raw.match(re)
  return m ? decodeURIComponent(m[1]) : null
}

async function loginIfPossible() {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (!email || !password) return { ok: false, accessToken: null }

  // login via proxy Next (Set-Cookie access_token)
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const setCookie = res.headers.get('set-cookie')
  const accessToken = extractCookieValue(setCookie, 'access_token')

  if (!res.ok) return { ok: false, accessToken }
  return { ok: true, accessToken }
}

async function main() {
  const results = []

  // Saúde do backend (proxy)
  results.push(await fetchWithBody('GET', '/api/health/backend'))

  // Auth
  results.push(await fetchWithBody('GET', '/api/auth/check-session'))
  results.push(
    await fetchWithBody('POST', '/api/auth/login', {
      body: JSON.stringify({}),
    })
  )
  results.push(await fetchWithBody('POST', '/api/auth/logout'))

  // Tentativa opcional de login real (para conseguir testar admin com cookie)
  const login = await loginIfPossible()
  const cookieHeader = login.accessToken ? `access_token=${login.accessToken}` : null

  const adminHeaders = cookieHeader ? { headers: { cookie: cookieHeader } } : {}

  // Admin - agendamentos
  results.push(await fetchWithBody('GET', '/api/admin/appoiments/list?page=1&per_page=5', adminHeaders))
  results.push(await fetchWithBody('GET', '/api/admin/appoiments/kpis', adminHeaders))
  results.push(await fetchWithBody('GET', '/api/admin/appoiments/status', { ...adminHeaders, cache: 'no-store' }))

  // Admin - dynamic routes
  results.push(
    await fetchWithBody('DELETE', '/api/admin/test-id/delete', adminHeaders)
  )
  results.push(
    await fetchWithBody('PUT', '/api/admin/test-id/update', {
      ...adminHeaders,
      body: JSON.stringify({ id: 'test-id' }),
    })
  )

  // Print
  console.log(`Route test — ${base}`)
  for (const r of results) {
    console.log(`${r.status}\t${r.method}\t${r.url}\n  ${r.bodyPreview}`)
  }

  const status404 = results.filter((r) => r.status === 404).length
  if (status404) {
    console.log(
      `\nTeste concluído com ${status404} resposta(s) HTTP 404 (geralmente quando o backend ainda não implementou os endpoints esperados).`
    )
  } else {
    console.log('\nTeste concluído (sem 404).')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

