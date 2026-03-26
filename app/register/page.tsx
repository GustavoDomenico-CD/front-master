'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/Login')
  }, [router])

  return null
}
