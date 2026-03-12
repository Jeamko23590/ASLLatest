# SenyaMatika Backend API

Backend API for SenyaMatika Math Learning App with PostgreSQL database.

## Features

- User authentication (register/login with JWT)
- User profile management
- Progress tracking across devices
- Admin dashboard endpoints
- Multi-device sync support

## Tech Stack

- Node.js + Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

## Local Development

### Prerequisites

- Node.js 16+ installed
- PostgreSQL database (local or cloud)

### Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/senyamatika
JWT_SECRET=your-random-secret-key-here
PORT=3000
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Progress
- `GET /api/progress` - Get all progress
- `GET /api/progress/topic/:topic` - Get topic progress
- `POST /api/progress/save` - Save progress
- `POST /api/progress/sync` - Sync multiple progress items

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `GET /api/admin/stats/dashboard` - Get dashboard stats
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/make-admin` - Make user admin

## Deployment to Render

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Fill in:
   - Name: `senyamatika-db`
   - Database: `senyamatika`
   - User: (auto-generated)
   - Region: Choose closest to your users
4. Click "Create Database"
5. Copy the "Internal Database URL" (starts with `postgresql://`)

### Step 2: Deploy Backend

1. Push your code to GitHub
2. Go to Render Dashboard
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in:
   - Name: `senyamatika-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free (or paid for better performance)
6. Add Environment Variables:
   - `DATABASE_URL`: (paste the Internal Database URL from Step 1)
   - `JWT_SECRET`: (generate a random string)
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: `*` (or your Flutter app domain)
7. Click "Create Web Service"

### Step 3: Initialize Database

The database tables will be created automatically on first run.

### Step 4: Update Flutter App

In `lib/backend/services/api_service.dart`, update the production URL:

```dart
static const String baseUrl = kDebugMode 
    ? 'http://localhost:3000/api'
    : 'https://senyamatika-api.onrender.com/api';  // Your Render URL
```

### Step 5: Create First Admin User

1. Register a user through the app
2. Connect to your PostgreSQL database (use Render's web shell or a tool like pgAdmin)
3. Run this SQL to make the user an admin:
```sql
INSERT INTO admins (user_id, role) VALUES (1, 'admin');
```

## Testing

Test the API health:
```bash
curl https://your-app.onrender.com/health
```

Test registration:
```bash
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and random
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add input validation and sanitization

## Support

For issues or questions, contact the development team.
