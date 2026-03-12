# SenyamatiKard Backend API

Backend API server for the SenyamatiKard Teacher and Admin Portal with Flutter APK integration.

## Features

### Teacher Portal
- Dashboard with student progress statistics
- View all students with completion rates and scores
- Monitor lesson completion status (Completed/In Progress)
- View recent student activity
- Track assessment/exercise completion
- Export reports to CSV/PDF

### Admin Portal
- Dashboard with system-wide statistics
- Teacher account management (Create/Edit/Delete)
- School management (Add/Edit/Delete)
- Class management
- System-wide reports (CSV/PDF export)

### APK Integration
- Student progress tracking
- Assessment score recording
- Engagement logging
- Real-time sync with web portal

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Reports**: CSV-Writer, PDFKit

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create PostgreSQL database:
```bash
createdb senyamatika
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
psql -U postgres -d senyamatika -f src/db/schema.sql
```

5. (Optional) Seed database with sample data:
```bash
npm run db:seed
```

### Development

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Teacher Login
```
POST /api/auth/teacher/login
Body: { employeeId: string, password: string }
```

#### Admin Login
```
POST /api/auth/admin/login
Body: { email: string, password: string }
```

### Teacher Routes

#### Get Dashboard Stats
```
GET /api/teachers/:teacherId/dashboard
```

#### Get Students
```
GET /api/teachers/:teacherId/students
```

#### Get Student Progress Details
```
GET /api/teachers/:teacherId/students/:studentId/progress
```

#### Get Lessons with Completion Stats
```
GET /api/teachers/:teacherId/lessons
```

#### Get Recent Activity
```
GET /api/teachers/:teacherId/activity?limit=20
```

### Admin Routes

#### Get Dashboard Stats
```
GET /api/admin/dashboard
```

#### Teacher Management
```
GET    /api/admin/teachers
POST   /api/admin/teachers
PUT    /api/admin/teachers/:id
DELETE /api/admin/teachers/:id
```

#### School Management
```
GET    /api/admin/schools
POST   /api/admin/schools
PUT    /api/admin/schools/:id
DELETE /api/admin/schools/:id
```

#### Class Management
```
GET /api/admin/classes
```

### Student Routes (APK Integration)

#### Record Progress
```
POST /api/students/progress
Body: { studentId, lessonId, subtopicId, completed }
```

#### Record Assessment Score
```
POST /api/students/assessments/score
Body: { studentId, assessmentId, score, maxScore }
```

#### Log Engagement
```
POST /api/students/engagement
Body: { studentId, sessionDuration, lessonsAccessed, activityType }
```

#### Get Student Data
```
GET /api/students/:id
GET /api/students/:id/progress
```

### Lesson Routes

#### Get All Lessons
```
GET /api/lessons
```

#### Get Lesson by ID
```
GET /api/lessons/:id
```

#### Get Lesson Assessments
```
GET /api/lessons/:id/assessments
```

### Report Routes

#### Teacher Reports
```
GET /api/reports/teacher/:teacherId/csv
GET /api/reports/teacher/:teacherId/pdf
```

#### Admin Reports
```
GET /api/reports/admin/csv
```

## Database Schema

### Main Tables
- `teachers` - Teacher accounts
- `schools` - School information
- `classes` - Class/section information
- `students` - Student records
- `lessons` - Lesson content
- `subtopics` - Lesson subtopics
- `student_progress` - Student lesson progress
- `assessments` - Assessment definitions
- `assessment_scores` - Student assessment scores
- `engagement_logs` - Student activity logs
- `admins` - Admin accounts

## Password Generation

Teacher passwords are auto-generated using the format:
```
{lastname}_{lastThreeCharsOfEmployeeID}
```

Example: For teacher "Juan Dela Cruz" with Employee ID "EMP-12345":
```
Password: cruz_345
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled for frontend origin
- SQL injection protection via parameterized queries

## Error Handling

All API responses follow this format:
```typescript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string
}
```

## License

MIT
