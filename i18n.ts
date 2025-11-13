import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'th', 'zh', 'ja'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound()
  }

  // At this point, TypeScript knows locale is a valid Locale
  const validLocale = locale as Locale

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  }
})

