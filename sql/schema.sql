-- ============================================
-- Sugarbunny Stores - Database Setup SQL
-- ============================================
-- 
-- HOW TO USE:
-- 1. Open phpMyAdmin in your hosting control panel
-- 2. Select your database from the left sidebar
-- 3. Click on the "SQL" tab at the top
-- 4. Copy and paste ALL the SQL below (from CREATE TABLE to the end)
-- 5. Click "Go" to execute
--
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create Admin Accounts
-- ============================================
-- All admin accounts below can login immediately after importing this SQL!
-- The system will fetch admin credentials from the database automatically.
--
-- ⚠️ IMPORTANT: Change passwords after first login!
-- ============================================

-- Admin Account 1
INSERT IGNORE INTO admins (email, password) 
VALUES (
  'admin@sugarbunny.com',
  '$2a$10$BTMlg//L6n5x./qbZ5b1l./Wf2BR1VpQ3Ro4DXm54pE4/.obefK0u'
);

-- Admin Account 2
INSERT IGNORE INTO admins (email, password) 
VALUES (
  'admin2@sugarbunny.com',
  '$2a$10$QkV48F6ZxWcaM5Vw.fDeoOfEMVs6RX1.9XNrkewt7w/SKHOgZUhy.'
);

-- Admin Account 3
INSERT IGNORE INTO admins (email, password) 
VALUES (
  'superadmin@sugarbunny.com',
  '$2a$10$Xz5WiRK61qmTs0c6GCv7rOtR3tzVI8JhKLmHdQ0n0Y9AVb8OunklS'
);

-- ============================================
-- Admin Login Credentials
-- ============================================
-- Account 1:
--   Email: admin@sugarbunny.com
--   Password: admin123
--
-- Account 2:
--   Email: admin2@sugarbunny.com
--   Password: admin456
--
-- Account 3:
--   Email: superadmin@sugarbunny.com
--   Password: superadmin
--
-- ============================================
-- Products Table
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Redeem Codes Table
-- ============================================

CREATE TABLE IF NOT EXISTS redeem_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
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
  INDEX idx_is_active (is_active),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Reviews Table
-- ============================================

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
  INDEX idx_is_approved (is_approved),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Orders Table
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reset order ID auto-increment to start from 1
ALTER TABLE orders AUTO_INCREMENT = 1;

-- ============================================
-- Order Items Table
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payments Table
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payment Settings Table
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- User Sessions Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Blocked Countries Table
-- ============================================

CREATE TABLE IF NOT EXISTS blocked_countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_code VARCHAR(2) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country_code (country_code),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- How to Add More Admins
-- ============================================
-- Option 1: Generate SQL hash
--   Run: npm run generate-admin-sql email@example.com password
--   Copy the generated SQL and add it here
--
-- Option 2: Direct database insert
--   Run: npm run create-admin email@example.com password
--
-- Option 3: Add manually in phpMyAdmin
--   Use the generated SQL from Option 1
-- ============================================

