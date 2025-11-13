import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple middleware - just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/admin`
    // - … the ones containing a dot (e.g. favicon.ico)
    '/((?!api|_next|admin|uploads|.*\\..*).*)'
  ]
}
