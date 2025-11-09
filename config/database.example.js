/**
 * Database Configuration Example
 * 
 * Copy this file to config/database.js and update with your MySQL credentials
 * Or use environment variables in .env.local (recommended)
 */

module.exports = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sugarbunny_stores',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
  }
}

