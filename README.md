# Werna

**Werna** is a customer feedback platform that lets businesses collect verified feedback through QR codes. Customers scan a QR code, submit their feedback in seconds, and verify it via email — no account required. Businesses get a dashboard with analytics, charts, and export tools to understand what their customers are saying.

---

## Features

- **QR-based feedback collection** — generate a unique link and QR code per location or product; customers submit in under 30 seconds
- **Email verification** — every feedback submission is verified with a one-time code, eliminating spam
- **4 feedback types** — complaints, suggestions, requests, and compliments, automatically categorized
- **Analytics dashboard** — monthly trend charts, type distribution, satisfaction score, and per-period breakdowns
- **Export** — download feedback as CSV or generate a PDF analytics report directly in the browser (no third-party PDF library)
- **Business profiles** — sector, contact info, opening hours, social links, and onboarding flow
- **Auth** — sign-up with email verification, JWT access + refresh token rotation, password reset via email
- **Security** — rate limiting, Helmet headers, Joi validation, bcrypt password hashing

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts, React Router v7, Zustand, Sonner |
| Backend | Node.js, Express 5, PostgreSQL, JWT, bcryptjs, Nodemailer, Winston, Helmet, express-rate-limit, Joi |
| QR | qrcode.react |

---

## Project Structure

```
werna/
├── web/          # React frontend (Vite)
├── server/       # Express API
└── landing/      # Marketing landing page
```

### Server layout

```
server/src/
├── config/       # DB, env, logger, mail
├── controller/   # Request handlers
├── service/      # Business logic
├── repository/   # DB queries
├── routes/       # Express routers
├── middleware/   # Auth, validation, rate limiting, error handling
├── schemas/      # Joi validation schemas
├── events/       # Email event emitters
├── exceptions/   # Custom error classes
├── model/        # Data models
└── db/           # SQL schema and seed files
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database setup

```sql
-- Run server/src/db/db.sql against your PostgreSQL instance
psql -U <user> -d <database> -f server/src/db/db.sql
```

### 2. Server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=werna
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_DOMAIN=
COOKIE_SECURE=false

# Email (SMTP)
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password
EMAIL_FROM=your@email.com

# URLs
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

### Public (customer-facing)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/feedback/links/:slug/info` | Get feedback link info |
| POST | `/api/feedback/submit` | Submit feedback |
| POST | `/api/feedback/verify` | Verify feedback with email code |

### Private (business dashboard — requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/feedback` | List feedbacks (paginated, filterable) |
| GET | `/api/feedback/analytics` | Analytics data (all-time, weekly, monthly, yearly) |
| GET | `/api/feedback/links` | List feedback links |
| POST | `/api/feedback/links` | Create feedback link |
| DELETE | `/api/feedback/links/:id` | Delete feedback link |
| GET/PUT | `/api/account` | Business profile |
| POST | `/api/auth/sign-up` | Register |
| POST | `/api/auth/sign-in` | Login |
| POST | `/api/auth/sign-out` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

---

## How Feedback Collection Works

1. A business creates a **feedback link** (with a name and auto-generated slug)
2. The dashboard displays a **QR code** for that link
3. A customer scans the QR code and is taken to `werna.app/f/:slug`
4. They choose a feedback type, enter their message and email
5. They receive a **6-digit verification code** by email
6. After entering the code the feedback is saved and appears in the business dashboard

---

## License

MIT
