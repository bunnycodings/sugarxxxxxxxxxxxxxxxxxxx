/**
 * Database Configuration File
 * 
 * IMPORTANT: Update this file with your MySQL database credentials
 * Or use environment variables in .env.local (recommended for security)
 */

module.exports = {
  // MySQL Connection Settings
  host: process.env.DB_HOST || 'localhost',           // MySQL server host
  user: process.env.DB_USER || 'root',               // MySQL username
  password: process.env.DB_PASSWORD || '',          // MySQL password
  database: process.env.DB_NAME || 'sugarbunny_stores', // Database name
  
  // Connection Pool Settings
  waitForConnections: true,
  connectionLimit: 10,        // Maximum number of connections in pool
  queueLimit: 0,              // Maximum number of queued connection requests
  
  // SSL Configuration (enable for production)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

// Instructions:
// 1. Either update the values above directly, OR
// 2. Create a .env.local file in the root directory with:
//    DB_HOST=localhost
//    DB_USER=your_username
//    DB_PASSWORD=your_password
//    DB_NAME=sugarbunny_stores
//
// 3. The environment variables will override the defaults above

