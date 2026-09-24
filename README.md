# 🌟 GLIMGLEE — Full-Stack D2C Gifting & Keepsakes Platform

> **"Make Every Moment Glow"** — Modern gifting, made personal.

Glimglee is a modern, high-performance Indian D2C gifting platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **Google Cloud OAuth**, and **Cloudinary**. Designed with a warm, premium, light-theme aesthetic inspired by luxury gifting brands, it offers both an engaging customer storefront and a feature-complete enterprise administration suite.

---

## 📸 Key Features

### 🛍️ Customer Storefront
- **Dynamic Homepage**: High-impact editorial hero, curated gifting categories, trending bestsellers, customer testimonials, and live PIN code delivery checker.
- **Bespoke Personalization Studio**: Live photo upload preview with instant cropping/framing, real-time laser engraving text input, custom song codes, and gift wrap selector (+₹99 with artisan card).
- **Smart Catalog & Filtering**: Multi-faceted filter by budget (*Under ₹499*, *Under ₹999*, *Luxury*), category, occasion (*Birthdays*, *Anniversaries*, *Festivals*), and sorting.
- **Cart & Slide-Over Drawer**: Free-shipping progress meter (unlocked at ₹999+), dynamic coupon code validation (`SAVE10`), and real-time subtotal computation.
- **Server-Verified Checkout**: 3-step checkout with tamper-proof server price calculation (`/api/checkout/verify` & `/api/orders/create`), supporting Cashfree (UPI, Cards, NetBanking) and COD.
- **7-Stage Live Order Tracker**: Visual status stepper (`PLACED` ➔ `CONFIRMED` ➔ `PRINTING_OR_PREPARING` ➔ `QUALITY_CHECK` ➔ `DISPATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) with AWB courier tracking.
- **GST Tax Invoice Generator**: Standalone, print-ready A4 tax invoice with GSTIN, HSN codes, tax breakdown (CGST 9% + SGST 9%), customer engraving notes, and QR stamp.
- **Customer Account Portal**:
  - `/account`: Overview hub with loyalty points and Gold Club perks.
  - `/account/orders`: Filterable past order history with tracking and invoice triggers.
  - `/account/addresses`: Saved shipping addresses (Home, Work, Other) with default selector.
  - `/account/profile`: Contact details, celebration date reminders (birthday & anniversary).
  - `/wishlist`: Saved keepsakes with 1-click cart migration.
- **Complete Policy Pages**:
  - `/shipping-policy`: 3–5 day pan-India delivery, courier partners, and armor packaging.
  - `/return-policy`: Glimglee 100% Happiness Guarantee, 48h replacement for transit damage.
  - `/privacy-policy`: Encrypted photo storage, strict privacy protocols, and automated purge.
  - `/terms`: Acceptable use and copyright terms for custom engraving.
  - `/faq`: Common delivery, personalization, and payment questions.
  - `/about`: Brand philosophy and artisan craftsmanship.
  - `/contact`: Customer care WhatsApp and email support.

---

### 🛡️ Enterprise Admin Suite (`/admin/*`)
- **Dedicated Admin Login**: Staff access portal at `/admin/login` with 1-click Google Cloud Admin authentication and role verification.
- **Analytics Dashboard**: Live revenue metrics, today's order count, average order value (AOV), weekly revenue velocity chart, top-selling gifts, and recent order stream.
- **Catalog & Personalization Builder**: Add/edit products with dynamic personalization schema controls (toggle Photo Upload, Engraving Text, Date Pickers, Character Limits).
- **Categories Manager**: Organize gift collections, banner images, and priority ranks.
- **Inventory & Stock Control**: Live stock adjustments, low-stock threshold triggers, and immutable inventory audit logs.
- **Fulfillment & Order Inspection**: Detailed order drawer displaying customer-uploaded high-res photographs, custom engraving text, AWB updater, and 1-click status transitions.
- **Customer CRM**: Customer directory with lifetime spend metrics, contact details, and order counts.
- **Promotions & Coupons**: Create percentage or flat discounts, expiry dates, minimum spend gates, and usage limits.
- **Marketing Banners & CMS**: Manage promotional announcement strips and hero highlights.
- **Social Proof Moderation**: Approve or hide customer product reviews and star ratings.
- **Audit Logs & Settings**: Full operational audit trail and live cloud database synchronization.

---

## 🛠️ Technology Stack (100% Free Tier Architecture)

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Animations** | Framer Motion, Canvas Confetti |
| **State & Storage** | React Context (`AuthContext`, `CartContext`, `WishlistContext`), LocalStorage |
| **Authentication** | Google Cloud OAuth 2.0 (Google Identity Services + Secure JWT Cookies) |
| **Database** | MongoDB Atlas (Free Tier M0 cluster / Native MongoDB Driver) |
| **Image & Media Storage** | Cloudinary (Free Tier CDN with direct uploads & optimization) |
| **Payment Gateway** | Cashfree PG (UPI, Cards, NetBanking) + Cash on Delivery (COD) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.17+ or v20+)
- **npm** or **pnpm** or **yarn**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/glimglee.git
cd glimglee
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
# 1. MongoDB Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=glimglee

# 2. Google Cloud Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=admin@glimglee.com,sachin@glimglee.com

# 3. Cloudinary (Free Tier)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# 4. Cashfree Payment Gateway
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
NEXT_PUBLIC_CASHFREE_ENV=sandbox

# 5. App Secrets
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your_secret_random_jwt_key
ADMIN_SECRET_KEY=your_admin_secret_key
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the store.

### 5. Building for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
glimglee/
├── src/
│   ├── app/
│   │   ├── (store)/                 # Customer Storefront Routes
│   │   ├── admin/                   # Enterprise Admin Suite
│   │   ├── api/                     # Backend API Endpoints (MongoDB & Cloudinary)
│   │   │   ├── auth/google/         # Google OAuth & session issuer
│   │   │   ├── auth/me/             # Session verification
│   │   │   ├── auth/logout/         # Logout endpoint
│   │   │   ├── products/            # MongoDB products CRUD
│   │   │   ├── categories/          # MongoDB categories CRUD
│   │   │   ├── orders/              # MongoDB orders CRUD
│   │   │   ├── coupons/             # MongoDB coupons CRUD
│   │   │   ├── banners/             # MongoDB banners CRUD
│   │   │   ├── inventory/           # MongoDB inventory logs & adjustments
│   │   │   ├── settings/            # Store configuration
│   │   │   ├── cms/                 # Homepage CMS
│   │   │   ├── reviews/             # Product reviews
│   │   │   ├── analytics/           # Store analytics
│   │   │   ├── upload/              # Cloudinary media uploader
│   │   │   └── payment/             # Cashfree PG endpoints
│   │   ├── login/                   # Google Sign-In
│   │   ├── register/                # Google Sign-Up
│   │   └── forgot-password/         # Account help
│   ├── components/                  # UI components
│   └── lib/
│       ├── auth/                    # Google Cloud AuthContext & JWT utilities
│       ├── mongodb/                 # MongoDB Atlas native client connection
│       ├── cloudinary/              # Cloudinary SDK client
│       ├── storage/                 # Media upload helpers
│       ├── services/                # MongoDB-backed store services
│       └── types/                   # Unified TypeScript definitions
├── next.config.ts                   # Next.js config with remote image domains
└── README.md                        # Documentation
```

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

© 2026 **Glimglee Technologies Private Limited**. Made with ❤️ in India.
