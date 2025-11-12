import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'
import { locales } from '@/i18n'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales,
  defaultLocale: 'en'
})

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation(routing)

