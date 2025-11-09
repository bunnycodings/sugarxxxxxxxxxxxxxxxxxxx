import pool, { initializeDatabase } from '../lib/db'
import { createAdmin } from '../lib/auth'

async function init() {
  try {
    console.log('Initializing database...')
    await initializeDatabase()
    
    // Create default admin account if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sugarbunny.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    const { getAdminByEmail } = await import('../lib/auth')
    const existingAdmin = await getAdminByEmail(adminEmail)
    
    if (!existingAdmin) {
      console.log('Creating default admin account...')
      await createAdmin(adminEmail, adminPassword)
      console.log(`Admin account created: ${adminEmail} / ${adminPassword}`)
      console.log('⚠️  Please change the default password after first login!')
    } else {
      console.log('Admin account already exists')
    }
    
    console.log('Database initialization complete!')
    process.exit(0)
  } catch (error) {
    console.error('Initialization error:', error)
    process.exit(1)
  }
}

init()

