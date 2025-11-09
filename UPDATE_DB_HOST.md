# Quick Fix: Update DB_HOST

Your current `.env.local` has:
```
DB_HOST=localhost
```

Since you're connecting **remotely** (from your local machine to the server), try one of these:

## Try These in Order:

### Option 1: Server IP (Try This First)
Update your `.env.local`:
```env
DB_HOST=51.161.116.8
```

### Option 2: Still localhost (some hosts work this way)
Keep it as:
```env
DB_HOST=localhost
```

### Option 3: Find MySQL Hostname in Control Panel
1. Go to **"MySQL Databases"** section
2. Look for **"MySQL Hostname"** or **"Server"**
3. Use that exact value

## After Updating:

1. **Save `.env.local`**
2. **Restart server:**
   ```bash
   # Stop (Ctrl+C) then:
   npm run dev
   ```
3. **Check terminal** - should see:
   - ✅ `Database connection successful` 
   - OR more specific error message

## Your Current Config Should Be:
```env
DB_HOST=51.161.116.8
DB_USER=jalvirt1_sugarbunnystore
DB_PASSWORD=your_password
DB_NAME=jalvirt1_sugarbunnystore
```

