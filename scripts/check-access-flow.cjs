const base = 'http://localhost:3000'
const cookieJar = new Map()

function buildCookieHeader() {
  return Array.from(cookieJar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

function storeSetCookie(setCookieHeader) {
  if (!setCookieHeader) return
  const [pair] = setCookieHeader.split(';')
  const eq = pair.indexOf('=')
  if (eq <= 0) return
  const name = pair.slice(0, eq).trim()
  const value = pair.slice(eq + 1).trim()
  if (!name) return
  if (!value) cookieJar.delete(name)
  else cookieJar.set(name, value)
}

async function req(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const cookie = buildCookieHeader()
  if (cookie) headers.cookie = cookie

  const res = await fetch(base + path, { ...options, headers })
  const setCookies =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : [])
  for (const setCookie of setCookies) {
    if (setCookie) storeSetCookie(setCookie)
  }

  let body = ''
  try {
    body = await res.text()
  } catch {
    body = ''
  }

  console.log(`${path} -> ${res.status} | ${body.slice(0, 220)}`)
  return { status: res.status, body }
}

async function main() {
  await req('/api/auth/logout', { method: 'POST' })
  await req('/api/auth/check-session')
  await req('/api/users/roles')

  await req('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'edgemachine', password: '072025' }),
  })

  await req('/api/auth/check-session')
  await req('/api/users/roles')
  await req('/api/admin/whatsapp/status')
  await req('/api/admin/whatsapp/config')
  await req('/api/admin/whatsapp/kpis')
  await req('/api/admin/whatsapp/contacts?page=1&per_page=20')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

