const base = process.env.BASE_URL || 'http://127.0.0.1:3001'

async function main() {
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'edgemachine', password: '072025' }),
  })
  const loginData = await loginRes.json().catch(() => ({}))
  console.log('login', loginRes.status, loginData?.user?.role ?? '(no-role)')
  const token = loginData?.access_token
  if (!token) return

  const byBearer = await fetch(`${base}/users/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const bearerBody = await byBearer.text()
  console.log('users/roles by bearer', byBearer.status, bearerBody.slice(0, 200))

  const byCookie = await fetch(`${base}/users/roles`, {
    headers: { Cookie: `access_token=${token}` },
  })
  const cookieBody = await byCookie.text()
  console.log('users/roles by cookie', byCookie.status, cookieBody.slice(0, 200))

  const waBearer = await fetch(`${base}/admin/whatsapp/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const waBearerBody = await waBearer.text()
  console.log('whatsapp/status by bearer', waBearer.status, waBearerBody.slice(0, 200))

  const waCookie = await fetch(`${base}/admin/whatsapp/status`, {
    headers: { Cookie: `access_token=${token}` },
  })
  const waCookieBody = await waCookie.text()
  console.log('whatsapp/status by cookie', waCookie.status, waCookieBody.slice(0, 200))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

