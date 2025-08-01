import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Por enquanto, apenas passa todas as requisições
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}