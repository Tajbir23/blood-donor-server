# Blood Donor Management System

A comprehensive blood donation management platform built with Node.js, Express, TypeScript, and MongoDB. This system efficiently connects blood seekers with eligible donors, manages organizations, and facilitates monetary donations.

## Key Features

- 🔐 **Advanced Authentication System**
  - JWT-based authentication with strict token validation
  - Role-based access control (Super Admin, Admin, Organization Admin, User)
  - OTP verification for registration and password reset
  - Secure password management with bcrypt

- 👥 **User & Donor Management**
  - Complete user profile with blood group information
  - GeoJSON location tracking for proximity-based donor matching
  - Donation history tracking with eligibility calculations
  - Smart donation reminders based on donor history

- 🏢 **Organization Management**
  - Blood donation organization registration and verification
  - Member management with join request system
  - Organization admin dashboard
  - Automated organization status monitoring

- 🩸 **Blood Request System**
  - Emergency blood request creation with patient details
  - Intelligent donor matching using geospatial queries
  - Automated email notifications to nearby eligible donors
  - Real-time request status tracking

- 💰 **Payment Integration**
  - Secure online donations via SSLCommerz
  - Transaction tracking and receipt generation
  - Automated email receipts with custom templates
  - Payment verification through IPN callbacks

- 📧 **Email Communication**
  - Customized Bengali email templates
  - Automated donation reminders
  - Blood request notifications
  - Account verification and password reset emails

- 🏆 **Donor Recognition**
  - Donor leaderboard based on donation history
  - Public recognition of frequent donors
  - Donation achievements and badges

- 🔒 **Enhanced Security**
  - Rate limiting for sensitive operations
  - VPN detection to prevent abuse
  - Request validation and sanitization
  - CORS protection and XSS prevention

## Technical Implementation

- **MongoDB with Mongoose**
  - GeoJSON for location-based queries
  - Complex aggregate pipelines for analytics
  - Robust schema validation
  - Indexing for optimized performance

- **TypeScript Integration**
  - Strong typing across the codebase
  - Interface definitions for all data models
  - Type guards for runtime safety

- **Scheduled Tasks**
  - Automated donation reminders via cron jobs
  - Organization status verification
  - Stale data cleanup

- **Express API Architecture**
  - RESTful endpoint design
  - Modular router organization
  - Middleware-based request processing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/blood-donor.git
cd blood-donor/server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## API Documentation

The API is organized into the following main sections:

### Authentication
- User registration with OTP verification
- Login with JWT token generation
- Password recovery and reset

### User Management
- Profile creation and updates
- Blood group and location management
- Donation history tracking

### Blood Requests
- Create and manage blood donation requests
- Search for available donors
- Track request status

### Organizations
- Register and manage blood donation organizations
- Handle membership requests
- Organization admin operations

### Payments
- Process donations via SSLCommerz
- Generate donation receipts
- Payment verification

## Project Structure

```
src/
├── config/         # App configuration
├── controller/     # API route controllers
├── cron/           # Scheduled tasks
├── handler/        # Business logic handlers
├── middleware/     # Express middleware
├── models/         # MongoDB schemas
├── router/         # API route definitions
├── types/          # TypeScript definitions
└── utils/          # Utility functions
```

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the repository or contact the development team.
