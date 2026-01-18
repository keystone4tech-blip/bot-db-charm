# Server Architecture Documentation

## Overview

The backend server has been refactored from a monolithic `server.js` file (886 lines) into a modular architecture following industry best practices.

## Directory Structure

```
├── server.cjs                 # Entry point - starts the server
├── app.cjs                    # Express app configuration and routing
├── config/                    # Configuration files
│   ├── database.cjs          # PostgreSQL connection pool
│   └── constants.cjs         # Application constants
├── middleware/               # Express middleware
│   ├── cors.cjs             # CORS configuration
│   ├── errorHandler.cjs     # Centralized error handling
│   └── validateTelegram.cjs # Telegram data validation middleware
├── services/                # Business logic layer
│   ├── telegramService.cjs  # Telegram validation utilities
│   ├── referralService.cjs  # Referral code generation and management
│   ├── userService.cjs      # User profile CRUD operations
│   ├── balanceService.cjs   # Balance management
│   ├── channelService.cjs   # Telegram channel operations
│   ├── botService.cjs       # Bot management
│   ├── vpnService.cjs       # VPN key operations
│   ├── subscriptionService.cjs # Subscription management
│   ├── supportService.cjs   # Support ticket system
│   └── databaseService.cjs  # Database initialization
├── controllers/             # Request handlers
│   ├── authController.cjs   # Authentication endpoints
│   ├── profileController.cjs # Profile management
│   ├── balanceController.cjs # Balance operations
│   ├── referralController.cjs # Referral statistics
│   ├── channelController.cjs # Channel management
│   ├── botController.cjs    # Bot management
│   ├── vpnController.cjs    # VPN operations
│   ├── subscriptionController.cjs # Subscription management
│   └── supportController.cjs # Support system
├── routes/                  # API route definitions
│   ├── auth.cjs            # /api/telegram-auth, /api/users/*
│   ├── profiles.cjs        # /api/profiles/*
│   ├── balances.cjs        # /api/balances/*
│   ├── referrals.cjs       # /api/referral-stats/*
│   ├── channels.cjs        # /api/telegram-channels/*
│   ├── bots.cjs            # /api/user-bots/*
│   ├── vpn.cjs             # /api/vpn-keys/*
│   ├── subscriptions.cjs   # /api/subscriptions/*
│   └── support.cjs         # /api/support-tickets/*, /api/support-chat/*
└── utils/                   # Utility functions
    ├── logger.cjs          # Logging utilities
    └── errors.cjs          # Custom error classes

```

## Key Components

### Entry Point (server.cjs)

The entry point is responsible for:
- Loading the Express app
- Ensuring database tables exist
- Starting the HTTP server
- Error handling during startup

### Application Core (app.cjs)

Sets up the Express application with:
- CORS middleware
- JSON body parser
- API route mounting
- Error handler middleware

### Configuration Layer (config/)

- **database.cjs**: PostgreSQL connection pool with error handling
- **constants.cjs**: Application-wide constants (timeouts, default values, enums)

### Middleware Layer (middleware/)

- **cors.cjs**: CORS configuration for cross-origin requests
- **errorHandler.cjs**: Centralized error handling middleware
- **validateTelegram.cjs**: Validates Telegram WebApp initData

### Services Layer (services/)

Reusable business logic:
- **telegramService.cjs**: Telegram data validation using HMAC-SHA256
- **referralService.cjs**: Referral code generation and relationship management
- **userService.cjs**: User profile creation, updates, and retrieval
- **balanceService.cjs**: Balance CRUD operations
- **channelService.cjs**: Telegram channel operations
- **botService.cjs**: Bot management
- **vpnService.cjs**: VPN key management
- **subscriptionService.cjs**: Subscription handling
- **supportService.cjs**: Support ticket and chat management
- **databaseService.cjs**: Database table initialization

### Controllers Layer (controllers/)

HTTP request handlers that:
- Validate request data
- Call appropriate services
- Format responses
- Handle errors

### Routes Layer (routes/)

API endpoint definitions organized by domain:
- Authentication and user registration
- Profile management
- Balance operations
- Referral statistics
- Channel, bot, VPN, subscription management
- Support system

### Utilities Layer (utils/)

- **logger.cjs**: Structured logging (info, error, warn, debug)
- **errors.cjs**: Custom error classes (AppError, ValidationError, NotFoundError, etc.)

## API Endpoints

### Authentication
- `POST /api/telegram-auth` - Telegram WebApp authentication
- `POST /api/users/register` - User registration (for bot)
- `GET /api/users/:telegramId` - Get user by Telegram ID

### Profiles
- `GET /api/profiles/:telegramId` - Get user profile
- `PUT /api/profiles/:userId` - Update user profile

### Balances
- `GET /api/balances/:userId` - Get user balance
- `PUT /api/balances/:userId` - Update user balance

### Referrals
- `GET /api/referral-stats/:userId` - Get referral statistics

### Channels
- `GET /api/telegram-channels/:userId` - Get user channels
- `POST /api/telegram-channels` - Create channel

### Bots
- `GET /api/user-bots/:userId` - Get user bots
- `POST /api/user-bots` - Create bot

### VPN
- `GET /api/vpn-keys/:userId` - Get VPN keys
- `POST /api/vpn-keys` - Create VPN key

### Subscriptions
- `GET /api/subscriptions/:userId` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription

### Support
- `POST /api/support-tickets` - Create support ticket
- `GET /api/support-tickets/:userId` - Get user tickets
- `GET /api/support-tickets` - Get all tickets (admin)
- `PUT /api/support-tickets/:ticketId` - Update ticket status
- `GET /api/support-chat/:ticketId` - Get chat messages
- `POST /api/support-chat` - Send chat message

## Benefits of Modular Architecture

1. **Modularity**: Each file has a single responsibility
2. **Reusability**: Services can be used across multiple controllers
3. **Testability**: Each module can be tested independently
4. **Maintainability**: Easy to locate and modify specific functionality
5. **Scalability**: Simple to add new features
6. **Centralized Error Handling**: Consistent error responses
7. **Separation of Concerns**: Clear boundaries between layers

## Development

### Starting the Server

```bash
npm start
```

### Environment Variables

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: keystone)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for validation
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - CORS origin (default: *)

### Docker

Build and run with Docker Compose:

```bash
docker-compose up
```

## File Extension Note

All backend files use `.cjs` extension because the project's `package.json` contains `"type": "module"` for the frontend. This ensures CommonJS modules work correctly alongside ES modules.
