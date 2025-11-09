/**
 * Generate SQL INSERT statement for new admin account
 * 
 * This script generates a bcrypt hash and creates SQL INSERT statement
 * Run: node scripts/generate-admin-sql.js email password
 */

const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function generateSQL() {
  let email, password

  try {
    // Get email and password from command line or prompt
    if (process.argv[2] && process.argv[3]) {
      email = process.argv[2]
      password = process.argv[3]
    } else {
      console.log('📝 Generate SQL for New Admin Account\n')
      email = await question('Enter admin email: ')
      password = await question('Enter admin password: ')
    }

    if (!email || !password) {
      console.error('❌ Email and password are required!')
      process.exit(1)
    }

    // Validate email format
    if (!email.includes('@')) {
      console.error('❌ Invalid email format!')
      process.exit(1)
    }

    // Validate password length
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!')
      process.exit(1)
    }

    // Generate bcrypt hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate SQL
    console.log('\n✅ Generated SQL INSERT statement:\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('-- Copy and paste this into phpMyAdmin SQL tab:')
    console.log('')
    console.log(`INSERT INTO admins (email, password) VALUES (`)
    console.log(`  '${email}',`)
    console.log(`  '${hashedPassword}'`)
    console.log(`);`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n   ⚠️  IMPORTANT: Change this password after first login!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

generateSQL()

