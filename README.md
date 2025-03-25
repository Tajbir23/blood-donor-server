# Blood Donor Management System

A comprehensive blood donor management system built with Node.js, Express, TypeScript, and MongoDB. This system helps manage blood donors, associations, and blood donation requests efficiently.

## Features

- 🔐 Secure Authentication System
  - JWT-based authentication
  - Role-based access control (Admin, Association, User)
  - Password hashing with bcrypt
  - Rate limiting for login attempts

- 👥 User Management
  - User registration and profile management
  - Profile image upload support
  - Blood group information
  - Contact details management

- 🏥 Association Management
  - Association creation and management
  - Member management
  - Automatic association status monitoring
  - Minimum member requirement enforcement

- 🩸 Blood Donation
  - Blood donation request creation
  - Donor matching system
  - Request status tracking
  - Donation history

- 🔒 Security Features
  - Helmet for security headers
  - Rate limiting for API protection
  - CORS configuration
  - Request size limiting
  - VPN detection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blood-donor.git
cd blood-donor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `PUT /api/users/me/password` - Update user password

### Association Management
- `POST /api/associations` - Create new association
- `GET /api/associations` - Get all associations
- `GET /api/associations/:id` - Get association details
- `PUT /api/associations/:id` - Update association
- `DELETE /api/associations/:id` - Delete association

### Blood Donation
- `POST /api/donations` - Create donation request
- `GET /api/donations` - Get all donation requests
- `GET /api/donations/:id` - Get donation request details
- `PUT /api/donations/:id` - Update donation request
- `DELETE /api/donations/:id` - Delete donation request

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── cron/          # Scheduled tasks
├── handler/       # Request handlers
├── middleware/    # Custom middleware
├── models/        # Database models
├── router/        # Route definitions
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Security Features

- Rate limiting on API routes
- Request size limiting
- Helmet security headers
- CORS protection
- JWT authentication
- Password hashing
- VPN detection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository.
