/**
 * Create New Admin Account
 * 
 * This script creates a new admin account in the database
 * Run: node scripts/create-admin.js
 * Or: npm run create-admin email password
 */

const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const readline = require('readline')
require('dotenv').config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdmin() {
  let connection
  let email, password

  try {
    // Get email and password from command line or prompt
    if (process.argv[2] && process.argv[3]) {
      email = process.argv[2]
      password = process.argv[3]
    } else {
      console.log('📝 Create New Admin Account\n')
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

    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sugarbunny_stores',
    })

    console.log('✓ Connected to database')

    // Check if admin already exists
    const [existingAdmins] = await connection.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    )

    if (existingAdmins.length > 0) {
      console.error(`❌ Admin with email "${email}" already exists!`)
      console.log('   Use a different email or update the existing admin.')
      process.exit(1)
    }

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10)
    await connection.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    )

    console.log('\n✅ Admin account created successfully!')
    console.log(`\n   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n   ⚠️  You can now login with these credentials at /admin/login')
    console.log('   ⚠️  IMPORTANT: Change this password after first login!')

  } catch (error) {
    console.error('\n❌ Error creating admin account:', error.message)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.errno === 1045) {
      console.error('\n   Database connection failed. Check your .env.local file:')
      console.error('   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME')
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n   Database tables not found. Run: npm run setup-db')
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error(`\n   Admin with email "${email}" already exists!`)
    }
    
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
    rl.close()
  }
}

createAdmin()

