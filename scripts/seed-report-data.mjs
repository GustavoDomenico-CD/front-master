#!/usr/bin/env node
/**
 * Gera dados de teste para relatórios (pacientes + agendamentos odontológicos).
 *
 * Uso:
 *   BASE_URL=http://localhost:3000 TEST_EMAIL=admin@email.com TEST_PASSWORD=senha123 \
 *   node scripts/seed-report-data.mjs
 *
 * Variáveis opcionais:
 *   SEED_COUNT=40        -> quantidade de agendamentos (default 40)
 *   SEED_REGISTER_USERS=1 -> tenta criar pacientes via /api/auth/register
 */

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const count = Number(process.env.SEED_COUNT || 40)
const registerUsers = process.env.SEED_REGISTER_USERS === '1'

const adminEmail = process.env.TEST_EMAIL
const adminPassword = process.env.TEST_PASSWORD

const firstNames = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'Joao', 'Karen', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Paulo',
  'Quezia', 'Rafael', 'Sofia', 'Tiago', 'Vivian', 'William', 'Yasmin', 'Zeca',
]

const lastNames = [
  'Silva', 'Souza', 'Oliveira', 'Santos', 'Costa', 'Pereira', 'Rodrigues',
  'Almeida', 'Nascimento', 'Gomes', 'Martins', 'Araujo',
]

const professionals = [
  'Dra. Ana Ortiz',
  'Dr. Bruno Mendes',
  'Dra. Carla Freitas',
  'Dr. Diego Prado',
]

const services = [
  'Consulta odontologica de avaliacao',
  'Limpeza dental (profilaxia)',
  'Clareamento dental',
  'Restauracao (obturacao)',
  'Tratamento de canal',
  'Extracao simples',
  'Implante dentario',
  'Aparelho ortodontico',
  'Manutencao ortodontica',
  'Urgencia odontologica',
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)]
}

function toIsoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function randomFutureDate() {
  const now = new Date()
  const daysAhead = rand(1, 90)
  const date = new Date(now)
  date.setDate(date.getDate() + daysAhead)
  return toIsoDate(date)
}

function randomHour() {
  const hour = rand(8, 18)
  const minute = pick([0, 30])
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function randomPhone() {
  return `(${rand(11, 99)}) 9${rand(1000, 9999)}-${rand(1000, 9999)}`
}

function randomPatient(i) {
  const first = pick(firstNames)
  const last = pick(lastNames)
  const id = `${Date.now()}${i}${rand(100, 999)}`
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}.${id}@teste.local`,
    phone: randomPhone(),
    password: 'Teste@12345',
  }
}

function parseSetCookieToCookieHeader(setCookie) {
  if (!setCookie) return ''
  return setCookie
    .split(',')
    .map((part) => part.trim().split(';')[0])
    .join('; ')
}

async function loginAndGetCookie() {
  if (!adminEmail || !adminPassword) {
    throw new Error('Defina TEST_EMAIL e TEST_PASSWORD para autenticar e criar dados.')
  }
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Falha no login (${res.status}): ${txt || 'sem corpo'}`)
  }
  const setCookie = res.headers.get('set-cookie')
  const cookie = parseSetCookieToCookieHeader(setCookie)
  if (!cookie) throw new Error('Login ok, mas sem set-cookie de sessao.')
  return cookie
}

async function createPatient(patient, cookie) {
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body: JSON.stringify({
      email: patient.email,
      password: patient.password,
      name: patient.name,
      phone: patient.phone,
      role: 'paciente',
      consultationCategory: 'odontologia',
      consultationType: pick(services),
    }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok && data?.success === true, status: res.status, data }
}

async function createAppointment(patient, cookie) {
  const date = randomFutureDate()
  const hour = randomHour()
  const service = pick(services)

  const res = await fetch(`${base}/api/admin/appoiments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body: JSON.stringify({
      date,
      hour: Number(hour.split(':')[0]),
      duration: pick([30, 45, 60]),
      username: patient.name,
      email: patient.email,
      telephone: patient.phone,
      service,
      professional: pick(professionals),
      typeOfService: 'odontologia',
      type_appointment: 'consulta',
      local: 'clinica odontologica',
      observations: 'Registro de teste para relatorios.',
      lgpd: {
        consentGiven: true,
        consentAt: new Date().toISOString(),
        purpose: 'agendamento_consulta_odontologica',
        policyVersion: '1.0',
        legalBasis: 'consentimento_titular',
        dataMinimization: true,
      },
    }),
  })
  const data = await res.json().catch(() => ({}))
  const ok = res.ok && (data?.success === true || data?.status === 'sucesso' || data?.status === 'success')
  return { ok, status: res.status, data }
}

async function main() {
  console.log(`Seed de relatorios -> ${base}`)
  const cookie = await loginAndGetCookie()

  let usersCreated = 0
  let appointmentsCreated = 0
  let failures = 0

  for (let i = 0; i < count; i++) {
    const patient = randomPatient(i + 1)

    if (registerUsers) {
      const reg = await createPatient(patient, cookie)
      if (reg.ok) usersCreated++
      else failures++
    }

    const ap = await createAppointment(patient, cookie)
    if (ap.ok) appointmentsCreated++
    else failures++
  }

  console.log('\nResultado do seed:')
  console.log(`- Pacientes criados: ${usersCreated}`)
  console.log(`- Agendamentos criados: ${appointmentsCreated}`)
  console.log(`- Falhas: ${failures}`)
}

main().catch((err) => {
  console.error('Erro no seed:', err.message || err)
  process.exit(1)
})

