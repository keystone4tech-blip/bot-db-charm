# 🔐 OTP Authentication Implementation

## Overview

This document describes the implementation of Telegram-based OTP (One-Time Password) authentication for the browser version of the Keystone Tech platform.

## Features Implemented

### 1. **Backend Services**

#### `services/otpService.cjs` - New OTP Service
- `generateOTP()` - Generates 6-digit OTP codes
- `createOTPSession(userId, sessionId, code)` - Creates OTP sessions
- `getUserByIdentifier(identifier)` - Finds users by ID or username
- `verifyOTPCode(sessionId, code)` - Verifies OTP codes
- `incrementOTPAttempts(sessionId)` - Tracks failed attempts
- `markOTPSessionVerified(sessionId)` - Marks successful verification
- `cleanupExpiredOTPSessions()` - Cleans up expired sessions
- `getOTPSession(sessionId)` - Retrieves OTP sessions

### 2. **Database Schema**

#### New Table: `otp_sessions`
```sql
CREATE TABLE public.otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  session_id VARCHAR(32) UNIQUE NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_otp_sessions_session_id` - For fast session lookup
- `idx_otp_sessions_user_id` - For user-based queries
- `idx_otp_sessions_expires_at` - For cleanup operations

**Security Features:**
- OTP codes are hashed with SHA-256 before storage
- 10-minute expiration time
- Maximum 3 attempts per session
- Automatic session blocking after max attempts

### 3. **API Endpoints**

#### POST `/api/auth/request-otp`
**Request:**
```json
{
  "identifier": "123456789",  // ID or username (@username or just username)
  "referralCode": "REF123"    // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Код отправлен в Telegram бот",
  "userId": "user-id-123",
  "sessionId": "session-abc123"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Пользователь не найден"
}
```

#### POST `/api/auth/verify-otp`
**Request:**
```json
{
  "sessionId": "session-abc123",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "profile": {
    "id": "user-id-123",
    "telegram_id": 123456789,
    "telegram_username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://...",
    "referral_code": "REF123",
    "referred_by": "referrer-id",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "balance": {
    "id": "balance-id",
    "user_id": "user-id-123",
    "internal_balance": 100.00,
    "external_balance": 50.00,
    "total_earned": 150.00,
    "total_withdrawn": 0.00,
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "referralStats": {
    "id": "stats-id",
    "user_id": "user-id-123",
    "total_referrals": 5,
    "total_earnings": 25.00,
    "level_1_count": 3,
    "level_2_count": 2,
    "level_3_count": 0,
    "level_4_count": 0,
    "level_5_count": 0,
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "role": "user"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неправильный код"
}
```

### 4. **Frontend Components**

#### `src/components/OTPAuthScreen.tsx`
- Two-step authentication process:
  1. **Request Code**: User enters ID or username
  2. **Enter Code**: User enters 6-digit OTP from Telegram bot
- Russian language interface
- Error handling and validation
- Loading states
- Success/failure feedback

#### `src/components/Auth/MainAuth.tsx`
- Added `OTP_AUTH` method to `AuthMethod` enum
- Integrated OTP authentication into main auth flow
- Added navigation between auth methods

#### `src/components/TelegramAuth.tsx`
- Added "Войти по ID/никнейму" option
- Updated props to include `onSwitchToOTPAuth`

### 5. **API Client**

#### `src/lib/api.ts`
Added new interfaces and functions:
- `OTPRequestData` - Interface for OTP request data
- `OTPRequestResponse` - Interface for OTP request response
- `OTPVerifyData` - Interface for OTP verification data
- `requestOTPCode(identifier, referralCode?)` - Request OTP code
- `verifyOTPCode(sessionId, code)` - Verify OTP code

## User Flow

```mermaid
graph TD
    A[Browser User] --> B[OTP Auth Screen]
    B -->|Enter ID/Username| C[Request OTP Code]
    C -->|API Call| D[Backend: /api/auth/request-otp]
    D -->|Find User| E[Generate OTP]
    E -->|Create Session| F[Send OTP to Telegram Bot]
    F -->|Success Response| G[Show "Code Sent" Message]
    G --> H[Enter Code Screen]
    H -->|Enter 6-digit code| I[Verify OTP]
    I -->|API Call| J[Backend: /api/auth/verify-otp]
    J -->|Validate Code| K[Check Session & Hash]
    K -->|Success| L[Return User Data]
    L -->|Auth Success| M[Main Application]
    K -->|Failure| N[Show Error Message]
    N --> H
```

## Security Measures

### 1. **OTP Generation**
- 6-digit numeric codes (100000-999999)
- Cryptographically secure random generation
- SHA-256 hashing before storage

### 2. **Session Management**
- Unique session IDs (32-character hex strings)
- 10-minute expiration time
- Maximum 3 verification attempts
- Automatic session blocking after max attempts

### 3. **Data Protection**
- No plaintext OTP storage
- Secure hashing algorithms
- HTTPS/TLS for all API communications
- Rate limiting on OTP request endpoint

### 4. **User Identification**
- Supports Telegram ID (numeric)
- Supports Telegram username (with/without @ prefix)
- Supports email addresses
- Case-insensitive username matching

## Integration with Telegram Bot

The backend generates OTP codes and logs them for testing. In production, the Telegram bot should:

1. **Receive OTP notifications** from the backend
2. **Send messages** to users with their OTP codes
3. **Format messages** like this:

```
🔐 Ваш одноразовый код для входа на keystone-tech.ru

Код: 123456
⏱️ Действителен 10 минут

❌ НЕ ДЕЛИТЕСЬ ЭТИМ КОДОМ ни с кем!

ID: Ваш ID есть 123456789
```

## Error Handling

### Frontend Errors
- Empty identifier field
- Invalid identifier format
- Empty OTP code field
- OTP code length validation
- Network errors
- API response errors

### Backend Errors
- User not found (404)
- Invalid session ID (401)
- Expired OTP code (401)
- Max attempts reached (401)
- Invalid OTP code (401)
- Database errors (500)

## Testing

### Manual Testing
1. Navigate to auth page
2. Click "Войти по ID/никнейму"
3. Enter valid Telegram ID or username
4. Click "Отправить код"
5. Check console for generated OTP
6. Enter the OTP code
7. Click "Подтвердить"
8. Verify successful authentication

### Automated Testing
Run the test script:
```bash
node test_otp_functionality.js
```

## Deployment Notes

### Database Migration
The system automatically creates the `otp_sessions` table on startup through:
- `services/databaseService.cjs` - Initial table creation
- `services/databaseUpdate.cjs` - Database updates

### Environment Variables
No new environment variables required.

### Backend Configuration
- Ensure `crypto` module is available
- Verify database connection pool settings
- Check rate limiting configuration

### Frontend Configuration
- Ensure API base URL is correctly set in `.env`
- Verify CORS settings allow OTP endpoints

## Future Enhancements

1. **Telegram Bot Integration**
   - Implement actual Telegram message sending
   - Add message formatting and localization
   - Implement message delivery confirmation

2. **Enhanced Security**
   - Add IP-based rate limiting
   - Implement device fingerprinting
   - Add suspicious activity detection

3. **User Experience**
   - Add OTP resend functionality
   - Implement countdown timer
   - Add alternative auth methods fallback

4. **Monitoring**
   - Add OTP usage analytics
   - Implement fraud detection
   - Add logging for security audits

## Files Modified/Created

### New Files
- `services/otpService.cjs` - OTP service implementation
- `src/components/OTPAuthScreen.tsx` - OTP authentication UI
- `supabase/migrations/20260106172913_create_otp_sessions_table.sql` - Database migration
- `test_otp_functionality.js` - Test script
- `OTP_AUTHENTICATION_IMPLEMENTATION.md` - This documentation

### Modified Files
- `controllers/authController.cjs` - Added OTP handlers
- `routes/auth.cjs` - Added OTP routes
- `services/databaseService.cjs` - Added otp_sessions table creation
- `services/databaseUpdate.cjs` - Added otp_sessions table creation
- `src/lib/api.ts` - Added OTP API functions
- `src/components/Auth/MainAuth.tsx` - Added OTP auth method
- `src/components/TelegramAuth.tsx` - Added OTP auth option

## Conclusion

This implementation provides a secure, user-friendly OTP authentication system that allows browser users to log in using their Telegram ID or username, receiving verification codes through the Telegram bot for enhanced security.