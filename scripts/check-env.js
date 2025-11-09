/**
 * Check .env.local configuration
 * Run: node scripts/check-env.js
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')

console.log('📋 Checking .env.local configuration...\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  console.log('\nPlease create .env.local with the following:')
  console.log('\nDB_HOST=localhost')
  console.log('DB_USER=your_mysql_username')
  console.log('DB_PASSWORD=your_mysql_password')
  console.log('DB_NAME=your_database_name')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      envVars[match[1].trim()] = match[2].trim()
    }
  }
})

console.log('Current configuration:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`DB_HOST: ${envVars.DB_HOST || '❌ NOT SET'}`)
console.log(`DB_USER: ${envVars.DB_USER || '❌ NOT SET'}`)
console.log(`DB_PASSWORD: ${envVars.DB_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET'}`)
console.log(`DB_NAME: ${envVars.DB_NAME || '❌ NOT SET'}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const issues = []

if (!envVars.DB_HOST) {
  issues.push('❌ DB_HOST is not set')
} else if (envVars.DB_HOST !== 'localhost' && envVars.DB_HOST !== '127.0.0.1') {
  issues.push(`⚠️  DB_HOST is "${envVars.DB_HOST}" - for shared hosting, it should be "localhost"`)
}

if (!envVars.DB_USER) {
  issues.push('❌ DB_USER is not set')
}

if (!envVars.DB_PASSWORD) {
  issues.push('❌ DB_PASSWORD is not set (this is required!)')
}

if (!envVars.DB_NAME) {
  issues.push('❌ DB_NAME is not set')
}

if (issues.length === 0) {
  console.log('✅ All required database variables are set!')
  console.log('\nNext steps:')
  console.log('1. Verify your credentials are correct')
  console.log('2. Make sure DB_HOST is "localhost" for shared hosting')
  console.log('3. Run: npm run setup-db')
  console.log('4. Restart your dev server: npm run dev')
} else {
  console.log('⚠️  Issues found:')
  issues.forEach(issue => console.log(`   ${issue}`))
  console.log('\n📝 To fix:')
  console.log('1. Open .env.local in the root directory')
  console.log('2. Update the values with your actual database credentials')
  console.log('3. For shared hosting:')
  console.log('   - DB_HOST should be "localhost"')
  console.log('   - Get DB_USER, DB_PASSWORD, and DB_NAME from your hosting control panel')
  console.log('   - Go to MySQL Databases section to find these values')
}

