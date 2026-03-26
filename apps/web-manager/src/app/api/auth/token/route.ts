import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const cookieName =
    process.env.NEXTAUTH_COOKIE_NAME || 'next-auth.session-token'

  const token = await getToken({
    req: req as any,
    raw: true,
    cookieName,
  })

  return NextResponse.json(token || '')
}
