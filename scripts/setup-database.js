/**
 * Database Setup Script
 * 
 * This script helps you set up the database with initial configuration
 * Run: node scripts/setup-database.js
 */

const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function setupDatabase() {
  let connection

  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })

    console.log('Connected to MySQL server')

    const dbName = process.env.DB_NAME || 'sugarbunny_stores'
    
    // Try to create database, but handle permission errors gracefully
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
      console.log(`Database '${dbName}' created or already exists`)
    } catch (error) {
      // Error 1044 = ER_DBACCESS_DENIED_ERROR
      // Error 1045 = ER_ACCESS_DENIED_ERROR
      if (error.code === 'ER_DBACCESS_DENIED_ERROR' || 
          error.code === 'ER_ACCESS_DENIED_ERROR' ||
          error.errno === 1044 ||
          error.errno === 1045 ||
          error.message.includes('Access denied')) {
        console.log(`⚠️  Cannot create database (insufficient privileges)`)
        console.log(`   Assuming database '${dbName}' already exists`)
        console.log(`   This is normal for shared hosting accounts`)
        console.log(`   Please create the database through your hosting control panel if it doesn't exist`)
      } else {
        throw error
      }
    }

    // Switch to the database
    try {
      await connection.query(`USE ${dbName}`)
    } catch (error) {
      console.error(`❌ Cannot access database '${dbName}'`)
      console.error(`   Please make sure the database exists`)
      console.error(`   Error: ${error.message}`)
      throw error
    }

    // Create tables
    console.log('Creating tables...')

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Users table created')

    // Admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Admins table created')

    // Admin sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Admin sessions table created')

    // Create default admin account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sugarbunny.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    // Check if admin already exists
    const [existingAdmins] = await connection.query(
      'SELECT * FROM admins WHERE email = ?',
      [adminEmail]
    )

    if (existingAdmins.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      await connection.query(
        'INSERT INTO admins (email, password) VALUES (?, ?)',
        [adminEmail, hashedPassword]
      )
      console.log(`✓ Default admin account created`)
      console.log(`  Email: ${adminEmail}`)
      console.log(`  Password: ${adminPassword}`)
      console.log(`  ⚠️  IMPORTANT: Change this password after first login!`)
    } else {
      console.log(`✓ Admin account already exists (${adminEmail})`)
    }

    console.log('\n✅ Database setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Make sure your .env.local file is configured')
    console.log('2. Run: npm run dev')
    console.log('3. Navigate to /admin/login and use the admin credentials')

  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.error('\nMake sure:')
    console.error('1. MySQL server is running')
    console.error('2. Database credentials in .env.local are correct')
    console.error('3. User has CREATE DATABASE and CREATE TABLE permissions')
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\nDatabase connection closed')
    }
  }
}

setupDatabase()

