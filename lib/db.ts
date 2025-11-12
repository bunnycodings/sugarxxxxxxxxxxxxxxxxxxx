import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

// Database configuration - reads from environment variables
// Make sure to set these in your .env.local file
// Note: For shared hosting, try "localhost" first if remote connection fails
const dbConfig = {
  // For shared hosting, use 'localhost' if app and MySQL are on same server
  // Only use remote IP if you're connecting from a different server
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sugarbunny_stores',
  waitForConnections: true,
  connectionLimit: 1, // Absolute minimum - use single connection for shared hosting
  queueLimit: 10, // Allow queuing of requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000, // 10 seconds connection timeout
  // For shared hosting, use 'localhost' (not remote IP)
  // Some hosts require 127.0.0.1 instead
  // Enable SSL in production (undefined for local development)
  ...(process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : {}),
}

// Create connection pool with singleton pattern to prevent multiple pools
let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  // Don't create pool during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database pool should not be accessed during build phase')
  }
  
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Export the pool with lazy initialization using Proxy
// This prevents pool creation during build phase
export default new Proxy({} as mysql.Pool, {
  get(target, prop) {
    // During build, return no-op functions
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      if (typeof prop === 'string' && (prop === 'execute' || prop === 'getConnection')) {
        return () => Promise.resolve([])
      }
      return undefined
    }
    
    // At runtime, get the actual pool and return the property
    const poolInstance = getPool()
    const value = (poolInstance as any)[prop]
    return typeof value === 'function' ? value.bind(poolInstance) : value
  }
})

// Note: mysql2/promise pool doesn't support event handlers like 'error'
// Errors are handled at the query/connection level via try/catch blocks

// Test connection on startup (skip during build)
// Only run in server environment, not during build or in browser
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  // Only test connection in runtime, not during build
  // Use setTimeout to avoid blocking module initialization
  setTimeout(() => {
    try {
      const poolInstance = getPool()
      poolInstance.getConnection()
        .then((connection) => {
          console.log('✅ Database connection successful')
          connection.release()
        })
        .catch((error) => {
          console.error('❌ Database connection failed:', error.message)
    console.error('')
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.errno === 1045) {
      // Extract IP from error message if available
      const ipMatch = error.message.match(/'([^']+)'@'([^']+)'/);
      const connectingUser = ipMatch ? ipMatch[1] : 'unknown';
      const connectingIP = ipMatch ? ipMatch[2] : 'unknown';
      
      console.error('⚠️  AUTHENTICATION ERROR - Access Denied')
      console.error('')
      console.error(`   Attempting to connect from IP: ${connectingIP}`)
      console.error(`   Using username: ${connectingUser}`)
      console.error('')
      console.error('   SOLUTIONS:')
      console.error('')
      console.error('   1. ✅ VERIFY PASSWORD:')
      console.error('      - Double-check your password in .env.local file')
      console.error('      - Make sure there are no extra spaces or hidden characters')
      console.error('      - Try resetting the MySQL password in your hosting control panel')
      console.error('')
      console.error('   2. ✅ CHECK IP ACCESS (for remote connections):')
      console.error(`      - Your current IP: ${connectingIP}`)
      console.error('      - Add this IP to MySQL Remote Access Hosts in your hosting control panel')
      console.error('      - Go to MySQL → Remote MySQL → Add Access Host')
      console.error('      - Or use "%" to allow all IPs (less secure)')
      console.error('')
      console.error('   3. ✅ FOR SHARED HOSTING (local connections):')
      console.error('      - Use "localhost" or "127.0.0.1" as DB_HOST')
      console.error('      - Remote connections may require IP whitelisting')
      console.error('')
      console.error('   4. ✅ VERIFY USERNAME:')
      console.error('      - Make sure username is correct (case-sensitive)')
      console.error('      - Shared hosting usernames usually have prefixes like "username_dbname"')
      console.error('')
      console.error('   5. ✅ CHECK USER PERMISSIONS:')
      console.error('      - User must be assigned to the database in hosting control panel')
      console.error('      - User must have SELECT, INSERT, UPDATE, DELETE privileges')
      console.error('')
      console.error('   Current config:')
      console.error(`   - Host: ${process.env.DB_HOST || 'localhost'}`)
      console.error(`   - User: ${process.env.DB_USER || 'root'}`)
      console.error(`   - Database: ${process.env.DB_NAME || 'sugarbunny_stores'}`)
      console.error(`   - Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`)
      console.error('')
      console.error('   💡 TIP: For remote connections, you MUST add your IP to MySQL access hosts')
      console.error('          in your hosting control panel (cPanel, phpMyAdmin, etc.)')
    } else if (error.code === 'ER_DBACCESS_DENIED_ERROR' || error.errno === 1044) {
      console.error('⚠️  DATABASE ACCESS DENIED - User cannot access database')
      console.error('')
      console.error('   This means:')
      console.error('   - ✅ Connection to MySQL server works')
      console.error('   - ✅ Username and password are correct')
      console.error('   - ❌ User is NOT assigned to the database')
      console.error('')
      console.error('   FIX: Assign user to database in hosting control panel')
      console.error('   1. Go to "MySQL Databases" section')
      console.error('   2. Find "Add User To Database" or "Users" section')
      console.error('   3. Select user: jalvirt1_sugarbunnystore')
      console.error('   4. Select database: jalvirt1_sugarbunnystore')
      console.error('   5. Click "Add" or "Assign"')
      console.error('   6. Make sure user has "ALL PRIVILEGES" or at least SELECT, INSERT, UPDATE, DELETE')
      console.error('')
      console.error('   Current config:')
      console.error(`   - User: ${process.env.DB_USER || 'root'}`)
      console.error(`   - Database: ${process.env.DB_NAME || 'sugarbunny_stores'}`)
      console.error('')
      console.error('   💡 TIP: User and database must be explicitly linked in hosting control panel')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  CONNECTION REFUSED - Connection cannot be established')
      console.error('')
      console.error('   Common causes and fixes:')
      console.error('   1. If connecting to REMOTE server (from your local machine):')
      console.error('      - Use the MySQL server hostname/IP from your hosting control panel')
      console.error('      - NOT "localhost" - use the actual remote host (e.g., mysql.yoursite.com)')
      console.error('      - Your IP must be added to MySQL access hosts (✅ you did this)')
      console.error('      - Check MySQL port (usually 3306)')
      console.error('')
      console.error('   2. If connecting to LOCAL server:')
      console.error('      - Use "localhost" or "127.0.0.1"')
      console.error('      - Make sure MySQL server is running')
      console.error('')
      console.error('   3. Check your hosting control panel for:')
      console.error('      - MySQL hostname/IP address (might be like mysql.hostname.com)')
      console.error('      - MySQL port number (usually 3306)')
      console.error('')
      console.error('   Current config:')
      console.error(`   - Host: ${process.env.DB_HOST || 'localhost'}`)
      console.error(`   - User: ${process.env.DB_USER || 'root'}`)
      console.error(`   - Database: ${process.env.DB_NAME || 'sugarbunny_stores'}`)
      console.error('')
      console.error('   💡 TIP: For remote connections, find the MySQL hostname in your')
      console.error('          hosting control panel (usually in MySQL/phpMyAdmin section)')
    } else if (error.code === 'ER_CON_COUNT_ERROR' || error.errno === 1040) {
      console.error('⚠️  TOO MANY CONNECTIONS - MySQL connection limit reached')
      console.error('')
      console.error('   This means the MySQL server has reached its maximum connection limit.')
      console.error('   This is common on shared hosting (phpMyAdmin, cPanel, etc.)')
      console.error('')
      console.error('   SOLUTIONS:')
      console.error('')
      console.error('   1. Check active connections in phpMyAdmin:')
      console.error('      - Open phpMyAdmin')
      console.error('      - Go to "Status" → "Processes" tab')
      console.error('      - Check how many connections are active')
      console.error('      - Kill idle connections if needed')
      console.error('')
      console.error('   2. Kill idle connections via SQL in phpMyAdmin:')
      console.error('      - Run: SHOW PROCESSLIST;')
      console.error('      - Then: KILL <process_id>; (for idle connections)')
      console.error('')
      console.error('   3. Increase MySQL max_connections (if you have access):')
      console.error('      - In phpMyAdmin SQL tab, run:')
      console.error('        SET GLOBAL max_connections = 20;')
      console.error('      - Note: This is usually restricted on shared hosting')
      console.error('')
      console.error('   4. Check for other applications using connections:')
      console.error('      - Other websites on the same server')
      console.error('      - phpMyAdmin sessions')
      console.error('      - Other scripts/databases')
      console.error('')
      console.error('   5. Reduce connection pool in your application:')
      console.error('      - Already set to absolute minimum (connectionLimit: 1)')
      console.error('      - Wait a few minutes for connections to timeout')
      console.error('      - Application will retry automatically with exponential backoff')
      console.error('')
      console.error('   💡 TIP: Shared hosting often limits connections to 5-10.')
      console.error('          Try restarting your application or wait for idle connections to timeout.')
    } else {
      console.error('   Please check your .env.local file and ensure:')
      console.error('   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set correctly')
      console.error('   - MySQL server is running')
      console.error('   - Database exists (or create it through your hosting control panel)')
    }
      })
    } catch (err) {
      // Silently fail during initialization - errors are logged above
    }
  }, 100) // Small delay to not block module loading
}

// Initialize database tables automatically
export async function initializeDatabase() {
  try {
    const pool = getPool()
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_member_id (member_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    // Add member_id column to existing users if it doesn't exist
    try {
      // Check if column exists first
      const [columns] = await pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'member_id'"
      ) as any[]
      
      if (columns.length === 0) {
        // Column doesn't exist, add it
        await pool.execute(`
          ALTER TABLE users 
          ADD COLUMN member_id VARCHAR(20) UNIQUE
        `)
      }
      
      // Generate member IDs for existing users that don't have one
      const [usersWithoutMemberId] = await pool.execute(
        'SELECT id FROM users WHERE member_id IS NULL OR member_id = ""'
      ) as any[]
      
      for (const user of usersWithoutMemberId) {
        const memberId = `SB${String(user.id).padStart(6, '0')}`
        await pool.execute(
          'UPDATE users SET member_id = ? WHERE id = ?',
          [memberId, user.id]
        )
      }
    } catch (error: any) {
      // Column might already exist or other error - ignore for now
      console.log('Member ID column setup:', error.message)
    }

    // Create admins table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create admin sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
        INDEX idx_session_token (session_token),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_code VARCHAR(20) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(500),
        file_url VARCHAR(500),
        stock INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_product_code (product_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    // Add file_url column to existing products table if it doesn't exist
    try {
      await pool.execute('ALTER TABLE products ADD COLUMN file_url VARCHAR(500)')
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column name')) {
        console.log('Note: file_url column may already exist')
      }
    }
    
    // Add product_code column to existing products if it doesn't exist
    try {
      // Check if column exists first
      const [columns] = await pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'product_code'"
      ) as any[]
      
      if (columns.length === 0) {
        // Column doesn't exist, add it
        await pool.execute(`
          ALTER TABLE products 
          ADD COLUMN product_code VARCHAR(20) UNIQUE
        `)
      }
      
      // Generate product codes for existing products that don't have one
      const [productsWithoutCode] = await pool.execute(
        'SELECT id FROM products WHERE product_code IS NULL OR product_code = ""'
      ) as any[]
      
      for (const product of productsWithoutCode) {
        const productCode = `PD${String(product.id).padStart(6, '0')}`
        await pool.execute(
          'UPDATE products SET product_code = ? WHERE id = ?',
          [productCode, product.id]
        )
      }
    } catch (error: any) {
      // Column might already exist or other error - ignore for now
      console.log('Product code column setup:', error.message)
    }

    // Create redeem_codes table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS redeem_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        product_id INT,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        max_uses INT DEFAULT 1,
        used_count INT DEFAULT 0,
        expires_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_code (code),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_user_id (user_id),
        INDEX idx_is_approved (is_approved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'wise',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_customer_email (customer_email),
        INDEX idx_payment_method (payment_method)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    // Add payment_method column to existing orders table if it doesn't exist
    try {
      await pool.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT "wise"')
    } catch (e: any) {
      // Column might already exist
      if (!e.message?.includes('Duplicate column name')) {
        console.log('Note: payment_method column may already exist')
      }
    }

    // Reset order ID auto-increment to start from 1 if table is empty
    // This ensures order IDs start from 1 when database is recreated or cleared
    try {
      const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders') as any[]
      if (orderCount.length > 0 && orderCount[0].count === 0) {
        await pool.execute('ALTER TABLE orders AUTO_INCREMENT = 1')
        console.log('✓ Orders auto-increment reset to 1')
      }
    } catch (e: any) {
      // Ignore errors if table doesn't exist or other issues
      // This is normal if the table was just created
    }

    // Create order_items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create payments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'wise',
        mtcn_no VARCHAR(100),
        sender_name VARCHAR(255),
        transaction_date DATE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_proof_url TEXT,
        payer_first_name VARCHAR(255),
        payer_last_name VARCHAR(255),
        payer_phone VARCHAR(50),
        payer_address TEXT,
        payer_city VARCHAR(100),
        payer_country VARCHAR(100),
        stripe_payment_intent_id VARCHAR(255),
        stripe_checkout_session_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_mtcn_no (mtcn_no),
        INDEX idx_status (status),
        INDEX idx_payment_method (payment_method)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    // Add new columns to existing payments table if they don't exist
    try {
      await pool.execute('ALTER TABLE payments ADD COLUMN payment_method VARCHAR(50) DEFAULT "stripe"')
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column name')) {
        console.log('Note: payment_method column may already exist')
      }
    }
    try {
      await pool.execute('ALTER TABLE payments MODIFY COLUMN mtcn_no VARCHAR(100)')
      await pool.execute('ALTER TABLE payments MODIFY COLUMN sender_name VARCHAR(255)')
      await pool.execute('ALTER TABLE payments MODIFY COLUMN transaction_date DATE')
    } catch (e: any) {
      // Columns might already be modified
    }
    try {
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_first_name VARCHAR(255)')
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_last_name VARCHAR(255)')
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_phone VARCHAR(50)')
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_address TEXT')
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_city VARCHAR(100)')
      await pool.execute('ALTER TABLE payments ADD COLUMN payer_country VARCHAR(100)')
      await pool.execute('ALTER TABLE payments ADD COLUMN stripe_payment_intent_id VARCHAR(255)')
      await pool.execute('ALTER TABLE payments ADD COLUMN stripe_checkout_session_id VARCHAR(255)')
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column name')) {
        console.log('Note: Some payment columns may already exist')
      }
    }

    // Create payment_settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wise_account_name VARCHAR(255) DEFAULT 'Zhong Jie Yong',
        wise_account_number VARCHAR(100) DEFAULT '1101402249826',
        wise_bank VARCHAR(255) DEFAULT 'Kasikorn Bank (K-Bank)',
        wise_swift VARCHAR(50) DEFAULT 'KASITHBK',
        western_union_name VARCHAR(255) DEFAULT 'Zhong Jie Yong',
        western_union_account_number VARCHAR(100) DEFAULT '1101402249826',
        western_union_phone VARCHAR(50) DEFAULT '098-887-0075',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create default admin accounts if they don't exist
    try {
      
      // Default admin accounts from schema.sql
      const defaultAdmins = [
        {
          email: 'admin@sugarbunny.com',
          password: '$2a$10$BTMlg//L6n5x./qbZ5b1l./Wf2BR1VpQ3Ro4DXm54pE4/.obefK0u' // admin123
        },
        {
          email: 'admin2@sugarbunny.com',
          password: '$2a$10$QkV48F6ZxWcaM5Vw.fDeoOfEMVs6RX1.9XNrkewt7w/SKHOgZUhy.' // admin456
        },
        {
          email: 'superadmin@sugarbunny.com',
          password: '$2a$10$Xz5WiRK61qmTs0c6GCv7rOtR3tzVI8JhKLmHdQ0n0Y9AVb8OunklS' // superadmin
        }
      ]

      for (const admin of defaultAdmins) {
        const [existing] = await pool.execute(
          'SELECT id FROM admins WHERE email = ?',
          [admin.email]
        ) as any[]

        if (existing.length === 0) {
          await pool.execute(
            'INSERT INTO admins (email, password) VALUES (?, ?)',
            [admin.email, admin.password]
          )
          console.log(`✅ Default admin account created: ${admin.email}`)
        }
      }
    } catch (adminError: any) {
      // Silently fail admin creation - might already exist or permission issue
      console.log('ℹ️  Skipping admin account creation (may already exist)')
    }

    console.log('✅ Database tables initialized successfully')
  } catch (error: any) {
    console.error('⚠️  Database initialization error:', error.message)
    // Don't throw - let the app continue even if initialization fails
    // This allows the app to start even if tables already exist or there's a permission issue
  }
}

// Auto-initialize database on startup (only in server environment, not during build)
// Skip during build phase completely
if (typeof window === 'undefined' && 
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    process.env.NEXT_PHASE !== 'phase-production-server') {
  // Only initialize if we're actually running (not building)
  // Use setTimeout to avoid blocking module initialization
  setTimeout(() => {
    initializeDatabase().catch(() => {
      // Silent fail - initialization errors are logged above
      // This is expected during build time when DB is not available
    })
  }, 200) // Delay to ensure we're not in build phase
}

// Helper function to execute queries with retry logic for connection errors
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error: any) {
      lastError = error
      
      // Only retry on connection-related errors
      if (
        error.code === 'ER_CON_COUNT_ERROR' || 
        error.errno === 1040 ||
        error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ECONNRESET'
      ) {
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`⚠️  Connection error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      // For other errors or final retry, throw immediately
      throw error
    }
  }
  
  throw lastError
}

// Pool is exported above with lazy initialization

