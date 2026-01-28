# Project Structure Overview

## 📂 Top-Level Organization

```
TaskManagementApp_ReactNative/
├── frontend/          # React Native mobile application
├── backend/           # Node.js API server
└── *.md              # Documentation files
```

## 📱 Frontend Structure (React Native + Expo)

**Location**: `frontend/`

```
frontend/
├── app/                      # Expo Router screens
│   ├── (tabs)/               # Bottom tab navigation
│   │   ├── _layout.tsx       # Tab configuration
│   │   ├── index.tsx         # Dashboard screen
│   │   ├── tasks.tsx         # Tasks list screen
│   │   └── profile.tsx       # Profile screen
│   ├── auth/                 # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── tasks/                # Task management screens
│   │   ├── create.tsx        # Create new task
│   │   ├── [id].tsx          # Task details (dynamic)
│   │   ├── edit/[id].tsx     # Edit task (dynamic)
│   │   └── archived.tsx      # Archived tasks
│   └── _layout.tsx           # Root layout
│
├── components/               # Reusable UI components
│   ├── Button.tsx            # Custom button
│   ├── Input.tsx             # Custom input field
│   ├── TaskCard.tsx          # Task display card
│   ├── Loading.tsx           # Loading spinner
│   ├── EmptyState.tsx        # Empty state message
│   ├── ErrorMessage.tsx      # Error display
│   └── index.ts              # Component exports
│
├── services/                 # API integration layer
│   ├── api.ts                # Axios client setup
│   ├── auth.service.ts       # Auth API calls
│   ├── task.service.ts       # Task CRUD operations
│   └── notification.service.ts # Push notifications
│
├── store/                    # State management
│   └── index.ts              # Zustand stores (Auth, Tasks, Settings)
│
├── utils/                    # Utility functions
│   └── helpers.ts            # Helper functions
│
├── __tests__/                # Test files
│   └── Button.test.tsx       # Example test
│
├── package.json              # Frontend dependencies
├── app.json                  # Expo configuration
├── babel.config.js           # Babel configuration
├── tailwind.config.js        # NativeWind/Tailwind config
├── tsconfig.json             # TypeScript configuration
├── global.css                # Global styles
└── .env.example              # Environment variables template
```

## 🔧 Backend Structure (Node.js + Express)

**Location**: `backend/`

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   └── task.controller.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   └── rateLimiter.js        # Rate limiting
│   ├── models/               # Mongoose schemas
│   │   ├── User.model.js
│   │   └── Task.model.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   └── server.js             # Express app entry point
│
├── package.json              # Backend dependencies
├── .env.example              # Environment variables template
└── README.md                 # Backend documentation
```

## 📚 Documentation Files

Located in the root directory:

- **README.md** - Main project documentation
- **QUICKSTART.md** - Quick setup guide
- **INSTALLATION.md** - Detailed installation instructions
- **LEARNING_GUIDE.md** - Code explanations & learning resources
- **PROJECT_SUMMARY.md** - Complete project overview
- **SETUP_CHECKLIST.md** - Setup verification checklist
- **DOCS_INDEX.md** - Documentation index
- **VISUAL_GUIDE.md** - Visual workflow diagrams
- **STRUCTURE.md** - This file (project structure reference)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..
```

### 2. Configure Environment

**Frontend** (`frontend/.env`):
```env
API_URL=http://localhost:3000/api
```

**Backend** (`backend/.env`):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your-secret-key-here
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 📝 Key Features by Location

### Frontend (`frontend/`)
- ✅ File-based routing with Expo Router
- ✅ Zustand state management
- ✅ NativeWind styling (Tailwind CSS)
- ✅ Formik + Yup form validation
- ✅ Axios with request interceptors
- ✅ AsyncStorage for persistence
- ✅ Push notifications support

### Backend (`backend/`)
- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling middleware
- ✅ CORS configuration

## 🔗 Important Relationships

### How Components Connect:

1. **Screens** (`frontend/app/`) → Use **Components** (`frontend/components/`)
2. **Screens** → Call **Services** (`frontend/services/`) → Hit **Backend API** (`backend/src/routes/`)
3. **Screens** → Update **Store** (`frontend/store/`) → Trigger re-renders
4. **Services** → Use **API Client** (`frontend/services/api.ts`) → Axios interceptors add auth tokens
5. **Backend Routes** → Call **Controllers** → Use **Models** → Interact with MongoDB

### Data Flow Example (Creating a Task):

```
1. User fills form in frontend/app/tasks/create.tsx
2. Form validation via Formik + Yup
3. On submit → calls frontend/services/task.service.ts
4. Service → uses frontend/services/api.ts (Axios)
5. API client → adds JWT token via interceptor
6. Request → sent to backend/src/routes/task.routes.js
7. Route → calls backend/src/controllers/task.controller.js
8. Controller → uses backend/src/models/Task.model.js
9. Model → saves to MongoDB
10. Response → back through the chain
11. Store → updated via frontend/store/index.ts
12. UI → re-renders automatically
```

## 📖 Learning Path

**Recommended Order:**

1. **Start with Backend** (`backend/`) - Understand API structure
2. **Learn State Management** (`frontend/store/`) - See how data flows
3. **Study Services** (`frontend/services/`) - API integration patterns
4. **Explore Components** (`frontend/components/`) - Reusable UI
5. **Review Screens** (`frontend/app/`) - How everything connects

## 🔍 Quick Reference

| What | Where |
|------|-------|
| API endpoints | `backend/src/routes/` |
| Database models | `backend/src/models/` |
| App screens | `frontend/app/` |
| Reusable UI | `frontend/components/` |
| API calls | `frontend/services/` |
| Global state | `frontend/store/index.ts` |
| Auth logic | `backend/src/controllers/auth.controller.js` |
| Task CRUD | `backend/src/controllers/task.controller.js` |
| Frontend config | `frontend/app.json`, `frontend/package.json` |
| Backend config | `backend/.env`, `backend/package.json` |

---

**Note**: All frontend code is now organized under `frontend/` directory for better separation of concerns!
