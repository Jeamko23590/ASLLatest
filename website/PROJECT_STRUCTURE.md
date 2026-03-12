# SenyamatiKard - Project Structure

## Overview
Complete file structure for the SenyamatiKard dashboard application.

## Directory Tree

```
/
├── README.md                          # Complete project documentation
├── package.json                       # Dependencies and scripts
├── vite.config.ts                     # Vite configuration with @ alias
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Main application with role selection
│   │   │
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── AdminSidebar.tsx     # Admin panel navigation
│   │   │   ├── TeacherSidebar.tsx   # Teacher panel navigation (icon-only)
│   │   │   ├── CompletionBar.tsx    # Progress bar component
│   │   │   ├── GenderIcon.tsx       # Gender-specific icons
│   │   │   ├── StatCard.tsx         # Dashboard stat card
│   │   │   └── ui/                  # Radix UI components (pre-existing)
│   │   │
│   │   ├── pages/                    # Page Components
│   │   │   ├── TeacherDashboardPage.tsx    # Teacher overview with charts
│   │   │   ├── TeacherLessonsPage.tsx      # Lesson progress tracking
│   │   │   ├── TeacherStudentsPage.tsx     # Student monitoring
│   │   │   ├── TeacherAIInsightsPage.tsx   # AI analytics interface
│   │   │   ├── AdminOverviewPage.tsx       # Admin system overview
│   │   │   ├── AdminLessonsPage.tsx        # Lesson management
│   │   │   ├── AdminAccountsPage.tsx       # Account management
│   │   │   ├── AdminReportsPage.tsx        # Report generation & export
│   │   │   └── SettingsPage.tsx            # Settings (placeholder)
│   │   │
│   │   └── hooks/                    # Data Logic & State
│   │       ├── types.ts              # TypeScript interfaces
│   │       ├── mockData.ts           # Sample data for demo
│   │       └── useData.ts            # Custom React hooks
│   │
│   └── styles/                       # Global Styles
│       ├── fonts.css                 # Titan One + Poppins imports
│       ├── theme.css                 # SenyamatiKard color theme
│       ├── tailwind.css              # Tailwind directives
│       └── index.css                 # Style imports
│
└── PROJECT_STRUCTURE.md              # This file
```

## Key Files

### Entry Points
- **`/src/app/App.tsx`** - Main application component with role selection and routing

### Core Components
- **`TeacherSidebar.tsx`** - Icon-only navigation with tooltips
- **`AdminSidebar.tsx`** - Full-width labeled navigation
- **`StatCard.tsx`** - Dashboard statistics display
- **`CompletionBar.tsx`** - Visual progress indicator
- **`GenderIcon.tsx`** - Inclusive gender representation

### Teacher Pages (5)
1. Dashboard - Overview with charts and AI insights
2. Lessons - Lesson completion and assessment tracking
3. Students - Individual student monitoring
4. AI Insights - Descriptive analytics and recommendations
5. Settings - User preferences

### Admin Pages (5)
1. Overview - System-wide statistics
2. Manage Lessons - CRUD operations for lessons
3. Manage Accounts - Student and teacher management
4. Reports - Data export with filters
5. Settings - System configuration

### Data Layer
- **`types.ts`** - 10+ TypeScript interfaces
- **`mockData.ts`** - Sample students, lessons, progress, scores, logs
- **`useData.ts`** - 8+ custom hooks for data access

## Component Count
- **Pages**: 10 (5 teacher + 5 admin)
- **Shared Components**: 5
- **Custom Hooks**: 8+
- **Data Models**: 10+

## Features Implemented

### Teacher Panel
✅ Dashboard with engagement charts (Recharts)
✅ Lesson monitoring with completion rates
✅ Student tracking with performance badges
✅ AI insights display with question interface
✅ Icon-only sidebar with tooltips

### Admin Panel
✅ System overview with tables
✅ Lesson CRUD interface
✅ Account management with search
✅ Report generation with CSV export
✅ Filtering by student/lesson

### Design System
✅ Filipino-inspired color palette
✅ Titan One + Poppins typography
✅ Gender-inclusive icons (3 types)
✅ SPED-friendly UI with high contrast
✅ Responsive layouts

## Technology Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- Radix UI (accessible components)
- Recharts (data visualization)
- Lucide React (icons)
- date-fns (date formatting)

## Data Flow
```
Mock Data → Custom Hooks → Pages → Components → UI
```

## Next Steps
- Connect to real backend (Supabase, Firebase, REST API)
- Implement authentication
- Add real-time updates
- Enhance accessibility (WCAG AAA)
- Add unit tests
