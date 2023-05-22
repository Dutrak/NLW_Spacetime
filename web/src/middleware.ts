import { NextRequest, NextResponse } from 'next/server'

const SignInURL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`

// Função Middleware que controla o acesso a rota
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Se não tiver token, redireciona para a página de login e guarda a url atual em um cookie
  if (!token) {
    return NextResponse.redirect(SignInURL, {
      headers: {
        'Set-Cookie': `redirectTo=${request.url}; Path=/; httpOnly max-age=20`,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/memories/:path*', // Match all paths starting with /memories
}
