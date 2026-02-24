# LifeDrop — Blood Donation Platform (Backend)

A comprehensive REST API server for the LifeDrop blood donation platform, built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This backend handles authentication, donor matching, organization management, real-time communication, and payment processing.

## Key Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with role-based access control
  - Roles: Super Admin, Admin, Moderator, Organization Admin, User
  - OTP email verification for registration and password reset
  - Bcrypt password hashing

- 👥 **User & Donor Management**
  - Complete user profiles with blood group and medical info
  - GeoJSON location tracking for proximity-based donor matching
  - Donation history with eligibility calculations
  - Smart donation reminders via cron jobs

- 🏢 **Organization Management**
  - Blood donation organization registration and admin verification
  - Member join request system with approval flow
  - Automated organization status monitoring

- 🩸 **Blood Request System**
  - Emergency blood request creation with patient & hospital details
  - Geospatial donor matching using MongoDB `$near` queries
  - Automated email notifications to nearby eligible donors
  - Real-time request status updates via Socket.IO

- 💳 **Payment Integration**
  - Online donations via **SSLCommerz**
  - IPN callback verification
  - Automated email receipts with transaction details

- 📧 **Email System**
  - Bengali email templates via Nodemailer + Gmail
  - Blood request alerts, OTP, donation reminders, receipts

- 🤖 **AI Chatbot**
  - TensorFlow.js based on-device AI model for blood donation queries
  - NLP with `natural` library for intent classification

- 🏆 **Donor Leaderboard**
  - Rankings based on donation frequency and recency

- 🔒 **Security**
  - Rate limiting with `express-rate-limit` and `express-slow-down`
  - IP-based VPN/proxy detection with `geoip-lite`
  - Helmet for HTTP security headers
  - CORS protection, request sanitization
  - Image optimization with Sharp

- ⚙️ **Process Management**
  - PM2 ecosystem config for production
  - Memory-optimized Node.js startup flags

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js >= 16.x |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | MongoDB + Mongoose 8 |
| Real-time | Socket.IO 4 |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer + Gmail SMTP |
| Payment | SSLCommerz |
| AI | TensorFlow.js + Natural |
| Image Processing | Sharp |
| Scheduler | node-cron |
| Process Manager | PM2 |
| Security | Helmet, express-rate-limit, geoip-lite |

## Installation & Setup

### Prerequisites

- Node.js >= 16.x
- MongoDB (local or Atlas)
- Gmail account (for email sending)
- SSLCommerz account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/Tajbir23/blood-donor-server.git
cd blood-donor-server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/blood_donation
JWT_SECRET=your_jwt_secret
NODE_ENV=development
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
IS_LIVE=false
```

### Running the Server

```bash
# Development (with nodemon + ts-node)
npm run dev

# Build TypeScript
npm run build

# Production
npm start

# Using PM2 (development)
npm run start:dev

# Using PM2 (production)
npm run start:prod

# PM2 utilities
npm run status     # check status
npm run logs       # view logs
npm run monitor    # PM2 monitor
npm run restart    # restart server
npm run stop       # stop server
```

Server runs on [http://localhost:4000](http://localhost:4000) by default.

## Project Structure

```
src/
├── server.ts              # App entry point
├── config/
│   ├── db.ts              # MongoDB connection
│   └── limiter.ts         # Rate limiter config
├── controller/
│   ├── administrator/     # Admin controllers
│   ├── blood/             # Blood request controllers
│   ├── chatBot/           # AI chatbot controller
│   ├── donorLeaderboard/  # Leaderboard controller
│   ├── email/             # Email controllers
│   ├── organization/      # Organization controllers
│   ├── sslCommerze/       # Payment controllers
│   └── user/              # User controllers
├── cron/
│   ├── donationReminder.ts   # Scheduled donor reminders
│   └── organizationCheck.ts  # Org verification cron
├── handler/
│   ├── administrator/     # Admin business logic
│   ├── donor/             # Donor logic
│   ├── fileUpload/        # File upload handling
│   ├── socket/            # Socket.IO events
│   ├── user/              # User logic
│   └── validation/        # Request validators
├── models/
│   ├── blood/             # Blood request schemas
│   ├── donation/          # Donation schemas
│   ├── organization/      # Organization schemas
│   ├── slider/            # Slider schemas
│   └── user/              # User schemas
├── router/
│   ├── router.ts          # Main router
│   ├── userRouter.ts      # User routes
│   ├── bloodRequestRoute.ts
│   ├── organizationRoute.ts
│   ├── paymentRoute.ts
│   ├── donorLeaderBoard.ts
│   └── blogRoute.ts
├── types/                 # TypeScript type definitions
└── utils/
    ├── bangladeshGeoLoactionData.ts
    ├── imageOptimizer.ts
    ├── logger.ts
    ├── retryWithBackoff.ts
    └── securityUtils.ts
```

## API Endpoints

### Authentication & Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| POST | `/api/users/verify-otp` | OTP email verification |
| POST | `/api/users/forgot-password` | Password reset request |
| GET | `/api/users/me` | Get current user |

### Blood Requests
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/blood/request` | Create blood request |
| GET | `/api/blood/requests` | List blood requests |
| GET | `/api/blood/donors` | Find nearby donors |

### Organizations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/organization/register` | Register organization |
| GET | `/api/organization` | List organizations |
| POST | `/api/organization/join` | Request to join org |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payment/init` | Initiate SSLCommerz payment |
| POST | `/api/payment/ipn` | Payment IPN callback |

## License

This project is licensed under the ISC License.

## Support

For support, please create an issue in the repository or contact the development team.
