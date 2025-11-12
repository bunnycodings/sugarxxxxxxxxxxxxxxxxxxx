import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en'
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n for API routes, admin routes, and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next()
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames, but exclude API and admin routes
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/admin`
    // - … the ones containing a dot (e.g. favicon.ico)
    '/((?!api|_next|admin|uploads|.*\\..*).*)'
  ]
}
