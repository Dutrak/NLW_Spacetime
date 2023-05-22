import { api } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Verifica se existe o cookie redirectTo, gerado pelo middleware
  const redirectTo = request.cookies.get('redirectTo')?.value

  const registerResponse = await api.post('/register', { code })
  const { token } = registerResponse.data

  // Se existir o cookie redirectTo, redireciona para a url guardada nele senão redireciona para a raiz"""
  const redirectURL = redirectTo ?? new URL('/', request.url)

  const cookieExpirationTime = 60 * 60 * 24 * 30 // 30 days

  return NextResponse.redirect(redirectURL, {
    headers: {
      'Set-Cookie': `token=${token}; Path=/; max-age=${cookieExpirationTime}`,
    },
  })
}
