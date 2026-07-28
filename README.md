# E-Shop — Multi-Vendor E-Commerce Platform

A full-stack **multi-vendor e-commerce marketplace** (MERN stack) where multiple sellers can open their own shops and list products/events, while customers can browse, chat with sellers in real time, add items to cart/wishlist, and check out securely with Stripe or PayPal.

🔗 **Live Demo:** [https://eshop-eyuz.vercel.app/](https://eshop-eyuz.vercel.app/)

---

## ✨ Features

- **Dual Authentication System**
  - Separate signup/login flows for **Users (buyers)** and **Sellers (shops)**
  - JWT-based authentication with role-specific tokens
  - Email verification/activation via Nodemailer
- **Shop & Seller Dashboard**
  - Sellers can create a shop profile (name, description, address, avatar)
  - Product & event (flash sale/limited-time deals) management
  - Order management and fulfillment tracking
  - Withdraw/payout requests for seller earnings
  - Coupon code creation for discounts
- **Product Catalog**
  - Browse products and time-limited events
  - Product categories, tags, ratings, and reviews
  - Image uploads via Cloudinary/Multer
- **Shopping Experience**
  - Cart and wishlist
  - Multi-step checkout (shipping info via `country-state-city`)
  - Coupon code application at checkout
- **Payments**
  - Stripe integration
  - PayPal integration (`@paypal/react-paypal-js`)
- **Real-Time Features**
  - Buyer ↔ Seller live chat (conversations & messages) via a dedicated Socket.IO service
  - Real-time order/notification updates
- **Admin Panel**
  - Manage all users, sellers, products, events, orders, and withdrawal requests

---

## 🛠️ Tech Stack

**Frontend** (`frontend/`)
- React 18 + React Router v6
- Redux Toolkit + Redux Thunk for state management
- Tailwind CSS + Material UI (data grid, components)
- Axios for API calls
- Stripe.js & PayPal SDK for payments
- Socket.IO client for real-time chat
- React Toastify for notifications
- React Lottie for animations

**Backend** (`backend/`)
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication (separate tokens for users and shops)
- Bcrypt for password hashing
- Multer for file uploads, Cloudinary for image storage
- Nodemailer for transactional emails
- Stripe for payment processing

**Real-time Service** (`socket/`)
- Standalone Node.js + Express + Socket.IO server dedicated to handling live chat between buyers and sellers

---

## 📁 Project Structure

```
E-shop-main/
├── frontend/                     # React client (buyer + seller + admin UI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/, Signup/    # Auth forms
│   │   │   ├── Shop/               # Seller shop pages
│   │   │   ├── Admin/              # Admin panel components
│   │   │   ├── Products/, Events/  # Catalog components
│   │   │   ├── Cart/, Wishlist/, Checkout/, Payment/
│   │   │   ├── Profile/            # Buyer profile & orders
│   │   │   └── Layout/, Route/
│   │   ├── pages/Shop/             # Seller-facing pages
│   │   ├── redux/{actions,reducers}
│   │   ├── routes/
│   │   └── static/, Assests/
│
├── backend/                      # Express REST API
│   ├── controller/                # user, shop, product, event, order,
│   │                                # payment, conversation, message,
│   │                                # coupounCode, withdraw
│   ├── models/                    # Mongoose schemas (matching controllers)
│   ├── middleware/                 # auth, error handling, async wrapper
│   ├── utilis/                     # ErrorHandler, JWT (user & shop tokens), mailer
│   ├── db/                         # Database connection
│   ├── uploads/                    # Uploaded product/shop images
│   ├── app.js                      # Express app & route registration
│   └── server.js                   # Server entry point
│
└── socket/                        # Standalone real-time chat microservice
    └── index.js
```

---

## 📡 API Overview

All backend routes are prefixed with `/api/v2`.

| Resource | Base Route | Purpose |
|---|---|---|
| User | `/api/v2/user` | Buyer registration, login, profile |
| Shop | `/api/v2/shop` | Seller registration, login, shop profile |
| Product | `/api/v2/product` | Create/list/delete products, reviews |
| Event | `/api/v2/event` | Create/list time-limited event products |
| Order | `/api/v2/order` | Place orders, track status, order history |
| Conversation | `/api/v2/conversation` | Start/list buyer-seller conversations |
| Message | `/api/v2/message` | Send/retrieve chat messages |
| Coupon | `/api/v2/coupon` | Create/apply discount coupon codes |
| Payment | `/api/v2/payment` | Stripe/PayPal payment processing |
| Withdraw | `/api/v2/withdraw` | Seller payout/withdrawal requests |

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB database (local or Atlas)
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- SMTP credentials (for sending emails)

### 1. Clone the repository
```bash
git clone https://github.com/Raza181261/E-shop.git
cd E-shop
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `config/.env` file inside `backend/` with the following variables (replace with your own values — never commit real secrets):

```env
PORT=8000
DB_URL=<your-mongodb-connection-string>

CLOUDINARY_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>

JWT_SECRET_KEY=<your-jwt-secret>
JWT_EXPIRES=<token-expiry>

SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_SERVICE=<smtp-service>
SMTP_MAIL=<your-email>
SMTP_PASSWORD=<your-email-app-password>

STRIPE_SECRET_KEY=<stripe-secret-key>
```

Run the backend:
```bash
npm run dev
```

### 3. Socket (real-time chat) service setup
```bash
cd ../socket
npm install
```

Create a `.env` file inside `socket/`:
```env
PORT=4000
```

Run it:
```bash
npm start
```

### 4. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/` pointing to your backend and socket service URLs, e.g.:
```env
REACT_APP_BACKEND_URL=http://localhost:8000/api/v2
REACT_APP_SOCKET_URL=http://localhost:4000
```

Run the frontend:
```bash
npm start
```
The app will be available at `http://localhost:3000`.

---
