# SenyamatiKard

**Centralized Monitoring and Reporting Dashboard for Senyamatika**

SenyamatiKard is a production-ready web application designed for monitoring and reporting on the Senyamatika mobile application, which teaches Functional Mathematics to Deaf and SPED students in the Philippines.

---

## 🎯 Purpose

- **Monitor** lesson and subtopic completion rates
- **View** assessment scores for lessons with quizzes
- **Track** learner engagement and access frequency
- **Generate** descriptive reports for instructional monitoring
- **Display** AI-assisted analytics insights (descriptive, non-predictive)

---

## 👥 Target Users

### Teachers
- Monitor student progress across lessons
- View individual student performance
- Track engagement and session times
- Get AI-assisted insights for instructional decisions

### Admin
- Manage student and teacher accounts
- Organize lessons and curriculum
- Generate comprehensive reports
- Oversee system-wide metrics

---

## 🎨 Design Principles

### SPED-Friendly & Accessible
- Clear visual hierarchy with generous spacing
- High contrast color schemes
- Simple, friendly iconography
- Calm, non-distracting UI

### Filipino-Inspired Theme
- Warm earth tones and natural colors
- Modern, sleek aesthetic
- Cultural inclusivity with gender-neutral options

### Color Palette
- **Background**: `#F5FBE6` (Light Green)
- **Yellow Accent**: `#FEDA5E`
- **Light Blue Accent**: `#D4E8FF`
- **Slate Neutral**: `#B0BDC1`
- **Primary Brown**: `#8B6F47`

### Typography
- **Headings**: Titan One (bold, playful)
- **Body**: Poppins (clean, readable)

### Gender Icons
- **Male**: Blue (`#4A90E2`)
- **Female**: Pink (`#E91E63`)
- **Non-binary**: Purple (`#9C27B0`)

---

## 🏗️ Architecture

### MVP (Model-View-Presenter) Structure

```
src/
├── app/
│   ├── components/          # Pure UI components
│   │   ├── GenderIcon.tsx
│   │   ├── StatCard.tsx
│   │   ├── CompletionBar.tsx
│   │   ├── TeacherSidebar.tsx
│   │   └── AdminSidebar.tsx
│   │
│   ├── pages/              # Page-level views
│   │   ├── TeacherDashboardPage.tsx
│   │   ├── TeacherLessonsPage.tsx
│   │   ├── TeacherStudentsPage.tsx
│   │   ├── TeacherAIInsightsPage.tsx
│   │   ├── AdminOverviewPage.tsx
│   │   ├── AdminLessonsPage.tsx
│   │   ├── AdminAccountsPage.tsx
│   │   ├── AdminReportsPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── hooks/              # Data logic & services
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── mockData.ts     # Mock data for demo
│   │   └── useData.ts      # Custom hooks
│   │
│   └── App.tsx             # Main application entry
│
└── styles/                 # Global styles
    ├── fonts.css
    ├── theme.css
    ├── tailwind.css
    └── index.css
```

---

## 🚀 Features

### Teacher Panel
- **Icon-only Side Navigation** with tooltips for easy access
- **Dashboard**: Overview stats, engagement trends, AI insights
- **Lessons**: Monitor completion rates and assessment scores
- **Students**: Individual progress tracking with engagement levels
- **AI Insights**: Descriptive analytics and recommendations
- **Settings**: User preferences (placeholder)

### Admin Panel
- **Structured Admin Layout** with labeled sidebar navigation
- **Overview**: System-wide statistics and top performers
- **Manage Lessons**: Create, edit, organize lesson content
- **Manage Accounts**: Student and teacher account management
- **Reports**: Comprehensive data export (CSV) with filters
- **Settings**: System configurations (placeholder)

### Key Components

#### StatCard
Displays key metrics with icons, values, and optional trends.

#### CompletionBar
Visual progress indicator for lesson/subtopic completion.

#### GenderIcon
Inclusive gender representation (male, female, non-binary).

#### Charts
- Line charts for engagement trends
- Bar charts for student comparisons
- Uses Recharts library

---

## 📊 Data Models

### Student
- `id`, `name`, `gender`, `grade`, `section`, `teacherId`, `enrollmentDate`

### Lesson
- `id`, `title`, `description`, `subtopics[]`, `hasAssessment`

### StudentProgress
- `studentId`, `lessonId`, `subtopicId`, `completed`, `completedAt`

### AssessmentScore
- `id`, `studentId`, `assessmentId`, `score`, `maxScore`, `completedAt`

### EngagementLog
- `id`, `studentId`, `date`, `sessionDuration`, `lessonsAccessed`, `activityType`

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🎯 Usage

### Role Selection
On first load, select either:
- **Teacher Panel** - For monitoring student progress
- **Admin Panel** - For system management

### Navigation
- **Teacher**: Icon-only sidebar with hover tooltips
- **Admin**: Labeled sidebar with full navigation

### Logout
Click the logout icon/button to return to role selection.

---

## 🔮 Future Enhancements

### Backend Integration
Currently uses mock data. Can be connected to:
- Supabase for real-time database
- REST/GraphQL APIs
- Firebase or similar backend services

### Additional Features
- Real AI/ML analytics integration
- Push notifications for teachers
- Mobile responsive refinements
- Print-friendly report layouts
- Multi-language support (Filipino, English)
- Accessibility improvements (screen readers)

---

## 🎨 Design Tokens

The theme uses CSS custom properties defined in `/src/styles/theme.css`:

```css
--background: #F5FBE6
--primary: #8B6F47
--accent: #FEDA5E
--accent-blue: #D4E8FF
--secondary: #B0BDC1
```

---

## 📄 License

This is a demonstration project for educational and monitoring purposes.

---

## 👨‍💻 Development

### Project Structure
- **View Layer**: React components in `components/` and `pages/`
- **Presenter Layer**: Custom hooks in `hooks/`
- **Model Layer**: Type definitions and mock data

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Clean separation of concerns
- Modular, reusable components

---

## 🙏 Acknowledgments

Built for the Senyamatika project, supporting inclusive mathematics education for Deaf and SPED students in the Philippines.

---

**SenyamatiKard** - Empowering teachers and administrators to support every learner's success. 🌟
