# Setup Guide - Sugarbunny Stores

This guide will help you set up the MySQL database and configure the application.

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up MySQL Database

1. **Create a MySQL database:**
   ```sql
   CREATE DATABASE sugarbunny_stores;
   ```

2. **Create a MySQL user (optional but recommended):**
   ```sql
   CREATE USER 'sugarbunny_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON sugarbunny_stores.* TO 'sugarbunny_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## Step 3: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your MySQL details:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=sugarbunny_stores
   
   ADMIN_EMAIL=admin@sugarbunny.com
   ADMIN_PASSWORD=admin123
   
   SESSION_SECRET=generate_a_random_string_here
   ```

   **Important Configuration Notes:**
   - `DB_HOST`: Your MySQL server host (usually `localhost`)
   - `DB_USER`: Your MySQL username
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: The database name you created
   - `ADMIN_EMAIL`: Email for the default admin account
   - `ADMIN_PASSWORD`: Password for the default admin account (change after first login!)
   - `SESSION_SECRET`: A random string for session security (generate one using: `openssl rand -base64 32`)

## Step 4: Initialize the Database

The database tables will be automatically created when you first run the application. However, if you want to initialize them manually:

1. **Create an initialization script** (optional):
   ```bash
   npx tsx scripts/init-db.ts
   ```

   Or create the tables manually using MySQL:

   ```sql
   -- Users table
   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   -- Admins table
   CREATE TABLE IF NOT EXISTS admins (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   -- Admin sessions table
   CREATE TABLE IF NOT EXISTS admin_sessions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     admin_id INT NOT NULL,
     session_token VARCHAR(255) UNIQUE NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
   );

   -- Create default admin account (replace with your own credentials)
   -- Password should be hashed using bcrypt
   INSERT INTO admins (email, password) 
   VALUES ('admin@sugarbunny.com', '$2a$10$hashed_password_here');
   ```

## Step 5: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Access Admin Dashboard

1. Navigate to the footer and click "Admin" or go to `/admin/login`
2. Use the credentials you set in `.env.local`:
   - Email: The value from `ADMIN_EMAIL`
   - Password: The value from `ADMIN_PASSWORD`
3. **IMPORTANT**: Change the admin password immediately after first login!

## Troubleshooting

### Database Connection Issues

1. **Check MySQL is running:**
   ```bash
   # On Windows
   net start mysql
   
   # On Linux/Mac
   sudo systemctl status mysql
   ```

2. **Verify credentials in `.env.local`**

3. **Test connection:**
   ```bash
   mysql -u your_user -p your_database
   ```

### Port Already in Use

If port 3000 is already in use, you can change it:
```bash
PORT=3001 npm run dev
```

### Database Tables Not Created

The tables are created automatically on first connection. If they're not created:
1. Check your `.env.local` file has correct database credentials
2. Make sure the database exists
3. Verify the user has CREATE TABLE permissions

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Use strong passwords for production
- Change default admin credentials immediately
- Use environment variables for all sensitive data in production
- Consider using a connection pool manager for production

## Production Deployment

For production:
1. Set all environment variables in your hosting provider
2. Use a secure `SESSION_SECRET`
3. Enable SSL for database connections
4. Use a production-ready MySQL setup
5. Implement proper backup strategies

