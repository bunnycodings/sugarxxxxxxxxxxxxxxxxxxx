import db from './db'

export interface BlockedCountry {
  id: number
  country_code: string
  country_name: string
  expires_at: string | null
  created_at: string
  updated_at?: string
}

export type BlockDuration = 
  | '30s' | '1m' | '5m' | '1h' | '24h' 
  | '7d' | '14d' | '30d' | '3month' | '6month' | '1year' | 'permanent'

export function calculateExpiration(duration: BlockDuration): Date | null {
  if (duration === 'permanent') {
    return null
  }

  const now = new Date()
  let milliseconds = 0

  switch (duration) {
    case '30s':
      milliseconds = 30 * 1000
      break
    case '1m':
      milliseconds = 60 * 1000
      break
    case '5m':
      milliseconds = 5 * 60 * 1000
      break
    case '1h':
      milliseconds = 60 * 60 * 1000
      break
    case '24h':
      milliseconds = 24 * 60 * 60 * 1000
      break
    case '7d':
      milliseconds = 7 * 24 * 60 * 60 * 1000
      break
    case '14d':
      milliseconds = 14 * 24 * 60 * 60 * 1000
      break
    case '30d':
      milliseconds = 30 * 24 * 60 * 60 * 1000
      break
    case '3month':
      milliseconds = 90 * 24 * 60 * 60 * 1000
      break
    case '6month':
      milliseconds = 180 * 24 * 60 * 60 * 1000
      break
    case '1year':
      milliseconds = 365 * 24 * 60 * 60 * 1000
      break
  }

  return new Date(now.getTime() + milliseconds)
}

export function formatExpiration(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'Permanent'
  }

  const expires = new Date(expiresAt)
  const now = new Date()
  
  if (expires <= now) {
    return 'Expired'
  }

  const diff = expires.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`
  } else {
    return `${seconds}s remaining`
  }
}

// Complete ISO 3166-1 alpha-2 country code to name mapping
export const ALL_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos Islands' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard Island' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SY', name: 'Syria' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'U.S. Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
]

// Create a map for quick lookup
const COUNTRY_MAP: Record<string, string> = {}
ALL_COUNTRIES.forEach(country => {
  COUNTRY_MAP[country.code] = country.name
})

export function getCountryName(countryCode: string): string {
  return COUNTRY_MAP[countryCode.toUpperCase()] || countryCode
}

export async function getAllBlockedCountries(): Promise<BlockedCountry[]> {
  const pool = db
  const [rows] = await pool.query(
    'SELECT * FROM blocked_countries WHERE expires_at IS NULL OR expires_at > NOW() ORDER BY country_name ASC'
  )
  return rows as BlockedCountry[]
}

export async function getAllBlockedCountriesIncludingExpired(): Promise<BlockedCountry[]> {
  const pool = db
  const [rows] = await pool.query(
    'SELECT * FROM blocked_countries ORDER BY country_name ASC'
  )
  return rows as BlockedCountry[]
}

export async function getBlockedCountryCodes(): Promise<string[]> {
  const pool = db
  // Only get countries that are not expired
  const [rows] = await pool.query(
    'SELECT country_code FROM blocked_countries WHERE (expires_at IS NULL OR expires_at > NOW())'
  )
  return (rows as BlockedCountry[]).map(c => c.country_code.toUpperCase())
}

export async function addBlockedCountry(
  countryCode: string, 
  expiresAt: Date | null = null
): Promise<BlockedCountry> {
  const pool = db
  const countryName = getCountryName(countryCode)
  
  await pool.query(
    'INSERT INTO blocked_countries (country_code, country_name, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE country_name = ?, expires_at = ?',
    [
      countryCode.toUpperCase(), 
      countryName, 
      expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null,
      countryName,
      expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null
    ]
  )
  
  const [rows] = await pool.query(
    'SELECT * FROM blocked_countries WHERE country_code = ?',
    [countryCode.toUpperCase()]
  )
  
  return (rows as BlockedCountry[])[0]
}

export async function addBlockedCountries(
  countryCodes: string[], 
  expiresAt: Date | null = null
): Promise<BlockedCountry[]> {
  const pool = db
  const countries: BlockedCountry[] = []
  
  for (const code of countryCodes) {
    try {
      const country = await addBlockedCountry(code, expiresAt)
      countries.push(country)
    } catch (error: any) {
      // Skip duplicates
      if (error.code !== 'ER_DUP_ENTRY') {
        throw error
      }
    }
  }
  
  return countries
}

export async function updateBlockedCountryExpiration(
  countryCode: string,
  expiresAt: Date | null
): Promise<BlockedCountry | null> {
  const pool = db
  
  await pool.query(
    'UPDATE blocked_countries SET expires_at = ? WHERE country_code = ?',
    [
      expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null,
      countryCode.toUpperCase()
    ]
  )
  
  const [rows] = await pool.query(
    'SELECT * FROM blocked_countries WHERE country_code = ?',
    [countryCode.toUpperCase()]
  )
  
  return (rows as BlockedCountry[])[0] || null
}

export async function removeBlockedCountry(countryCode: string): Promise<boolean> {
  const pool = db
  const [result] = await pool.query(
    'DELETE FROM blocked_countries WHERE country_code = ?',
    [countryCode.toUpperCase()]
  )
  
  return (result as any).affectedRows > 0
}

export async function removeBlockedCountries(countryCodes: string[]): Promise<number> {
  const pool = db
  if (countryCodes.length === 0) return 0
  
  const placeholders = countryCodes.map(() => '?').join(',')
  const [result] = await pool.query(
    `DELETE FROM blocked_countries WHERE country_code IN (${placeholders})`,
    countryCodes.map(c => c.toUpperCase())
  )
  
  return (result as any).affectedRows
}

export async function setBlockedCountries(
  countryCodes: string[], 
  expiresAt: Date | null = null
): Promise<void> {
  const pool = db
  
  // Get current blocked countries
  const current = await getBlockedCountryCodes()
  const newCodes = countryCodes.map(c => c.toUpperCase())
  
  // Find countries to add and remove
  const toAdd = newCodes.filter(c => !current.includes(c))
  const toRemove = current.filter(c => !newCodes.includes(c))
  
  // Remove countries that are no longer blocked
  if (toRemove.length > 0) {
    await removeBlockedCountries(toRemove)
  }
  
  // Add new blocked countries
  if (toAdd.length > 0) {
    await addBlockedCountries(toAdd, expiresAt)
  }
  
  // Update expiration for existing countries
  const toUpdate = newCodes.filter(c => current.includes(c))
  if (toUpdate.length > 0) {
    for (const code of toUpdate) {
      await updateBlockedCountryExpiration(code, expiresAt)
    }
  }
}

export async function isCountryBlocked(countryCode: string): Promise<boolean> {
  const pool = db
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM blocked_countries WHERE country_code = ? AND (expires_at IS NULL OR expires_at > NOW())',
    [countryCode.toUpperCase()]
  )
  
  return (rows as { count: number }[])[0].count > 0
}

// Clean up expired entries (optional, can be run periodically)
export async function cleanupExpiredBlocks(): Promise<number> {
  const pool = db
  const [result] = await pool.query(
    'DELETE FROM blocked_countries WHERE expires_at IS NOT NULL AND expires_at <= NOW()'
  )
  
  return (result as any).affectedRows
}
