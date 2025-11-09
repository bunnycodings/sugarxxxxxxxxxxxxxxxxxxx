# Troubleshooting Guide

## Common Errors and Solutions

### Internal Server Error (500)

If you're getting "Internal server error", here are the most common causes:

#### 1. Database Tables Not Initialized

**Error:** "Database tables not initialized. Please run: npm run setup-db"

**Solution:**
```bash
npm run setup-db
```

This will create all necessary database tables.

**Alternative:** Run the SQL manually:
1. Open phpMyAdmin (or your database management tool)
2. Select your database
3. Go to SQL tab
4. Copy and paste contents from `sql/schema-no-create-db.sql`
5. Execute

#### 2. Database Connection Failed

**Error:** Connection refused, timeout, or access denied

**Check:**
1. Verify `.env.local` file exists and has correct values:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

2. Test database connection:
   ```bash
   mysql -u your_username -p your_database_name
   ```

3. For shared hosting:
   - Database name might be prefixed (e.g., `cpses_jabqx9tn0h_db`)
   - Use the exact database name from your hosting control panel
   - Check if remote connections are allowed (some hosts only allow localhost)

#### 3. Tables Don't Exist

**Error:** Table 'users' doesn't exist or similar

**Solution:**
```bash
npm run setup-db
```

Or manually create tables using the SQL files in the `sql/` folder.

#### 4. Permission Errors

**Error:** Access denied for user

**Solutions:**
- Make sure your MySQL user has permissions to the database
- For shared hosting, user permissions are usually set automatically when you add the user to the database through the control panel
- Verify username and password are correct

#### 5. Environment Variables Not Loaded

**Error:** Database config values are undefined

**Solution:**
1. Make sure `.env.local` exists in the root directory
2. Restart the development server after changing `.env.local`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### How to See Detailed Errors

In development mode, errors now include more details. Check:
1. **Browser console** - Look for error messages
2. **Terminal/console** - Server-side errors are logged here
3. **Network tab** - Check API response for error details

### Quick Diagnostic Steps

1. **Check if tables exist:**
   ```sql
   SHOW TABLES;
   ```
   You should see: `users`, `admins`, `admin_sessions`

2. **Test database connection:**
   ```bash
   npm run setup-db
   ```
   This will verify your connection and create missing tables.

3. **Check environment variables:**
   Make sure `.env.local` has all required variables and values are correct.

4. **Check MySQL server:**
   ```bash
   # Windows
   net start mysql
   
   # Linux/Mac
   sudo systemctl status mysql
   ```

### Still Having Issues?

1. Check the terminal/console for the exact error message
2. Verify database credentials in `.env.local`
3. Ensure the database exists and you can connect to it manually
4. Make sure you've run `npm run setup-db` at least once
5. Check that all required npm packages are installed: `npm install`

### Getting More Help

When asking for help, provide:
- The exact error message from the console
- What you were trying to do when the error occurred
- Output from `npm run setup-db`
- Whether database tables exist (run `SHOW TABLES;` in your database)

