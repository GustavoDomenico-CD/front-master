#!/usr/bin/env node
/**
 * Smoke test: chama rotas /api e imprime status HTTP.
 * Requer o servidor Next em execução (ex.: npm run dev) e, para pipelines felizes
 * com login, opcionalmente BACKEND rodando em BACKEND_URL + env TEST_EMAIL/TEST_PASSWORD.
 *
 * Uso: BASE_URL=http://localhost:3000 node scripts/smoke-routes.mjs
 */

const base = process.env.BASE_URL || 'http://localhost:3000'

async function hit(method, path, init = {}) {
  const url = `${base.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    method,
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  return { url, status: res.status }
}

async function main() {
  const results = []

  results.push(await hit('GET', '/api/auth/check-session'))

  results.push(
    await hit('POST', '/api/auth/login', {
      body: JSON.stringify({}),
    })
  )

  results.push(await hit('POST', '/api/auth/logout'))

  results.push(await hit('GET', '/api/admin/appoiments/list?page=1&per_page=5'))

  results.push(await hit('GET', '/api/admin/appoiments/kpis'))

  results.push(await hit('GET', '/api/admin/appoiments/status'))

  results.push(
    await hit('DELETE', '/api/admin/test-id/delete')
  )

  results.push(
    await hit('PUT', '/api/admin/test-id/update', {
      body: JSON.stringify({ id: 'test-id' }),
    })
  )

  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (email && password) {
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirect: 'manual',
    })
    const cookie = loginRes.headers.get('set-cookie')
    results.push({
      url: `${base}/api/auth/login (with credentials)`,
      status: loginRes.status,
    })
    if (cookie) {
      const r2 = await hit('GET', '/api/auth/check-session', {
        headers: { cookie: cookie.split(',').map((c) => c.trim().split(';')[0]).join('; ') },
      })
      results.push({ url: `${r2.url} (after login)`, status: r2.status })
    }
  }

  console.log('Smoke routes —', base)
  for (const r of results) {
    console.log(`  ${r.status}\t${r.url}`)
  }

  const failed = results.filter((r) => r.status === 404)
  if (failed.length) {
    console.error('\n404 em rotas esperadas — falha.')
    process.exit(1)
  }
  console.log('\nNenhum 404. (Outros status dependem do backend e da autenticação.)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
