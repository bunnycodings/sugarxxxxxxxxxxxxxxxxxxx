# 🛍️ Sugarbunny Stores

A modern, full-featured e-commerce webshop built with Next.js, React, and TypeScript. This platform provides a complete solution for selling virtual products and services with multi-language support, secure payment processing, and comprehensive admin management.

🌐 **Live Site:** [https://store.sugarbunny.xyz/](https://store.sugarbunny.xyz/)

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8)

## ✨ Features

### 🎨 User Experience
- **Beautiful Modern UI** - Gradient design with pink, blue, and white color scheme
- **Dark Mode Support** - Seamless theme switching with persistent preferences
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Modern UI components with smooth transitions

### 🌍 Internationalization
- **Multi-Language Support** - Available in 4 languages:
  - 🇺🇸 English
  - 🇹🇭 Thai (ไทย)
  - 🇨🇳 Chinese (中文)
  - 🇯🇵 Japanese (日本語)
- **Language Switcher** - Easy language selection in the top navigation bar
- **Localized Content** - All UI elements and content are translated

### 🛒 E-Commerce Features
- **Product Catalog** - Browse and search products by category
- **Shopping Cart** - Add, remove, and manage items
- **Secure Checkout** - Complete order process with customer information
- **Order Management** - Track orders and view order history
- **Stock Management** - Real-time inventory tracking
- **Product Categories** - Organized product browsing

### 💳 Payment & Orders
- **Multiple Payment Methods** - Support for MoneyGram and wire transfers
- **Payment Verification** - Secure payment proof submission
- **Order Status Tracking** - Real-time order status updates
- **Email Notifications** - Automated order and payment confirmations

### 👤 User Management
- **User Authentication** - Secure login and registration
- **User Dashboard** - Personal account management
- **Order History** - View past purchases and downloads
- **Profile Management** - Update account information

### 🔐 Admin Features
- **Admin Dashboard** - Comprehensive management interface
- **Product Management** - Create, edit, and manage products
- **Order Management** - Process and track all orders
- **User Management** - View and manage user accounts
- **Redeem Codes** - Generate and manage discount codes
- **Review Management** - Moderate customer reviews
- **Payment Settings** - Configure payment methods and settings
- **Email Configuration** - Set up email notifications

### 🎁 Additional Features
- **Redeem Codes** - Discount code system
- **Product Reviews** - Customer review and rating system
- **Currency Exchange** - Real-time USD to THB conversion
- **Working Hours Display** - Business hours information
- **Discord Support** - Direct support link integration
- **FAQ Section** - Comprehensive frequently asked questions
- **Virtual Products** - Support for digital downloads and services

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sugarbunny-stores
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   NEXTAUTH_SECRET=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_key
   EMAIL_HOST=your_email_host
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```

5. **Create admin account** (optional)
   ```bash
   npm run create-admin
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
sugarbunny-stores/
├── app/                      # Next.js app directory
│   ├── [locale]/            # Internationalized routes
│   │   ├── products/        # Product pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout process
│   │   ├── dashboard/      # User dashboard
│   │   └── ...             # Other pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product endpoints
│   │   ├── orders/        # Order endpoints
│   │   └── ...            # Other API routes
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── TopBar.tsx         # Top information bar
│   ├── LanguageSwitcher.tsx # Language selector
│   └── ...                # Other components
├── contexts/               # React contexts
│   ├── CartContext.tsx    # Shopping cart state
│   ├── ThemeContext.tsx   # Theme management
│   └── ToastContext.tsx   # Toast notifications
├── lib/                    # Utility functions
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication helpers
│   └── ...               # Other utilities
├── messages/              # Translation files
│   ├── en.json           # English translations
│   ├── th.json           # Thai translations
│   ├── zh.json           # Chinese translations
│   └── ja.json           # Japanese translations
├── public/                # Static assets
├── scripts/               # Setup and utility scripts
└── sql/                   # Database schema
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **next-intl** - Internationalization

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality

### Payment & Services
- **Stripe** - Payment processing (optional)
- **Vercel Analytics** - Analytics integration

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Set up database schema
- `npm run check-env` - Verify environment variables
- `npm run create-admin` - Create admin account
- `npm run generate-admin-sql` - Generate admin SQL

## 🔧 Configuration

### Database Setup

1. Create a MySQL database
2. Update `.env.local` with your database credentials
3. Run `npm run setup-db` to create tables
4. (Optional) Run `npm run create-admin` to create an admin account

### Email Configuration

Configure email settings in the admin dashboard or environment variables for:
- Order confirmations
- Payment notifications
- Password resets

## 🌐 Deployment

This application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting** with MySQL support

Make sure to:
1. Set all environment variables
2. Configure database connection
3. Set up email service
4. Configure payment gateway (if using)

## 📝 License

This project is private and proprietary.

---

**Built with ❤️ by Sugarbunny Stores**
