# TaskMaster — React Native Task Management App

A full-featured task management mobile app built with React Native, Expo, and Node.js. Features a polished UI with gradient design, dark mode, swipe gestures, analytics, and offline support.

## Features

### Frontend (React Native + Expo)
- **Authentication** — Register, login, JWT-based session persistence
- **Today Screen** — Grouped view of overdue, today, upcoming (7 days), and inbox tasks with progress bar
- **Task Management** — Create, edit, view, and delete tasks with full CRUD
- **Categories** — Work, Personal, Health, Shopping, Finance, Other — each with a distinct icon and color
- **Priorities** — Low / Medium / High with color-coded indicators
- **Subtasks** — Add, remove, and toggle subtasks inline with a progress bar
- **Recurring Tasks** — Daily / weekly / monthly recurrence toggle
- **Quick Add Sheet** — Long-press the FAB for a fast bottom-sheet task entry
- **Swipe Gestures** — Swipe right to complete, left to delete on any task card
- **Stats Screen** — Streak counter, weekly bar chart, completion rate, category breakdown
- **Search & Filter** — Full-text search with status and category filter chips
- **Archive** — Archive/unarchive tasks separately from deletion
- **Edit Profile** — Update name, email, and change password
- **Onboarding** — 3-slide animated onboarding flow shown once on first launch
- **Dark Mode** — System / light / dark toggle persisted in AsyncStorage
- **Push Notifications** — Scheduled reminders on task due dates
- **Offline Cache** — 5-minute AsyncStorage cache with automatic API fallback

### Backend (Node.js + Express + MongoDB)
- **JWT Authentication** — Stateless token auth with bcrypt password hashing
- **Task API** — Full CRUD + archive, subtask toggle, analytics endpoint
- **Analytics** — Streak calculation, weekly completion data, category breakdown, on-time rate
- **Rate Limiting** — Brute-force protection on auth routes
- **RESTful design** — Consistent response envelopes, HTTP status codes

## Project Structure

```
TaskManagementApp_ReactNative/
├── frontend/
│   ├── app/
│   │   ├── index.tsx               # Entry: checks onboarding + auth, redirects
│   │   ├── _layout.tsx             # Root layout with GestureHandlerRootView
│   │   ├── onboarding/
│   │   │   └── index.tsx           # 3-slide animated onboarding
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx         # Tab bar (Today, Tasks, Stats, Profile)
│   │   │   ├── index.tsx           # Today screen
│   │   │   ├── tasks.tsx           # All tasks with filters
│   │   │   ├── stats.tsx           # Analytics & streak
│   │   │   └── profile.tsx         # Settings & account
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── tasks/
│   │   │   ├── create.tsx          # Create task (category, subtasks, recurrence)
│   │   │   ├── [id].tsx            # Task detail with subtask checklist
│   │   │   ├── edit/[id].tsx       # Edit task (pre-populated)
│   │   │   └── archived.tsx        # Archived tasks list
│   │   └── profile/
│   │       └── edit.tsx            # Edit profile + change password
│   ├── components/
│   │   ├── Button.tsx              # Gradient primary / outline / danger variants
│   │   ├── Input.tsx               # Animated focus border
│   │   ├── TaskCard.tsx            # Swipeable card with subtask progress bar
│   │   ├── QuickAddSheet.tsx       # Bottom sheet quick-add modal
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorMessage.tsx
│   ├── services/
│   │   ├── api.ts                  # Axios client with auth interceptor
│   │   ├── auth.service.ts         # register, login, updateProfile, updatePassword
│   │   ├── task.service.ts         # CRUD, toggleSubtask, getAnalytics, offline cache
│   │   └── notification.service.ts # Expo scheduled notifications
│   ├── store/
│   │   └── index.ts                # Zustand: AuthStore, TaskStore, SettingsStore, OnboardingStore
│   └── utils/
│       └── helpers.ts
└── backend/
    └── src/
        ├── controllers/
        │   ├── auth.controller.js   # register, login, profile, updatePassword
        │   └── task.controller.js   # CRUD, toggleSubtask, getAnalytics, getTaskStats
        ├── models/
        │   └── Task.model.js        # subtasks, category, recurrence, tags, completedAt
        ├── routes/
        │   ├── auth.routes.js
        │   └── task.routes.js
        ├── middleware/
        │   └── auth.middleware.js
        └── server.js
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native + Expo SDK 51 |
| Routing | Expo Router v3 (file-based) |
| State management | Zustand |
| Styling | NativeWind v4 + StyleSheet |
| Animations | React Native Animated API + expo-linear-gradient |
| Gestures | react-native-gesture-handler (Swipeable) |
| Forms | Formik + Yup |
| Notifications | expo-notifications |
| Persistence | AsyncStorage |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Expo Go app on your phone, or an Android/iOS emulator

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment

**`backend/.env`**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your_secret_here
CORS_ORIGIN=http://localhost:8081
```

**`frontend/.env`**
```
API_URL=http://localhost:3000/api
# Physical device: use your machine's LAN IP
# API_URL=http://192.168.1.X:3000/api
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## API Reference

All task endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/profile` | Get current user |
| PUT | `/auth/profile` | Update name / email |
| PUT | `/auth/update-password` | Change password |

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List tasks (filters: status, priority, category, isArchived, search, sortBy, order) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get single task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/subtasks/:subtaskId/toggle` | Toggle subtask completion |
| GET | `/tasks/stats/summary` | Counts by status |
| GET | `/tasks/analytics` | Streak, weekly data, category breakdown, on-time rate |

### Create / Update Task Body

```json
{
  "title": "Finish report",
  "description": "Optional details",
  "priority": "high",
  "status": "todo",
  "category": "work",
  "dueDate": "2025-05-01T09:00:00Z",
  "subtasks": [{ "title": "Draft outline", "completed": false }],
  "recurrence": { "enabled": true, "type": "weekly" }
}
```

## Design System

- **Primary gradient**: `#4F46E5` → `#7C3AED` → `#9333EA` (indigo → violet → purple)
- **Success**: `#10B981` (emerald)
- **Warning**: `#F59E0B` (amber)
- **Danger**: `#EF4444` (red)
- **Dark background**: `#0F172A` / `#1E293B`
- **Icons**: Ionicons (`@expo/vector-icons`)

## Troubleshooting

**Metro bundler errors**
```bash
cd frontend && npm start -- --reset-cache
```

**API unreachable on a physical device**
- Replace `localhost` with your machine's LAN IP in `frontend/.env`
- Ensure both devices are on the same Wi-Fi network

**MongoDB connection failed**
- Confirm `mongod` is running, or check your Atlas connection string

**Expo Go version mismatch**
```bash
npx expo install --fix
```

## License

Educational project — free to fork and modify.
