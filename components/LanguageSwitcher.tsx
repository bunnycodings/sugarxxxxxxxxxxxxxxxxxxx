'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return
    
    // Get pathname without locale prefix
    const segments = pathname.split('/').filter(Boolean)
    const currentLocaleIndex = locales.findIndex(l => l === segments[0])
    
    let pathWithoutLocale = '/'
    if (currentLocaleIndex >= 0 && segments.length > 1) {
      // Remove locale from path
      pathWithoutLocale = '/' + segments.slice(1).join('/')
    } else if (currentLocaleIndex < 0) {
      // No locale in path, use current path
      pathWithoutLocale = pathname
    }
    
    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    router.push(newPath)
    router.refresh()
  }

  const languages = [
    { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
    { code: 'th' as Locale, name: 'ไทย', flag: '🇹🇭' },
    { code: 'zh' as Locale, name: '中文', flag: '🇨🇳' },
    { code: 'ja' as Locale, name: '日本語', flag: '🇯🇵' },
  ]

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-pink-500 dark:hover:border-pink-500 transition-colors">
        <span className="text-lg">
          {languages.find(l => l.code === locale)?.flag || '🌐'}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {languages.find(l => l.code === locale)?.name || locale.toUpperCase()}
        </span>
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              locale === lang.code ? 'bg-pink-50 dark:bg-pink-900/20 font-medium' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto text-pink-600 dark:text-pink-400">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

