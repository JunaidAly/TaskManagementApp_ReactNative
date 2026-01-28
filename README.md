# TaskMaster - React Native Task Management App

A comprehensive task management mobile application built with React Native, Expo, and Node.js. This project is designed for educational purposes to demonstrate best practices in mobile app development.

## 📱 Features

### Frontend (React Native + Expo)
- ✅ **User Authentication** - Secure login/signup with JWT tokens
- 📝 **Task Management** - Create, read, update, delete tasks
- 🎨 **Modern UI** - Clean interface with NativeWind (Tailwind CSS)
- 🌓 **Dark Mode** - System/manual theme switching
- 🔔 **Push Notifications** - Task reminders via Expo Notifications
- 📊 **Dashboard** - Task statistics and overview
- 🔍 **Search & Filter** - Find tasks quickly
- 📦 **Archive** - Archive completed tasks
- 💾 **Offline Support** - Local data persistence with AsyncStorage
- ♿ **Accessible** - Screen reader support

### Backend (Node.js + Express + MongoDB)
- 🔐 **JWT Authentication** - Secure token-based auth
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM
- 🛡️ **Security** - Rate limiting, CORS, input validation
- 📡 **RESTful API** - Clean, documented endpoints
- ⚡ **Error Handling** - Comprehensive error management

## 🏗️ Architecture

### Frontend Structure
```
TaskManagementApp_ReactNative/
├── frontend/              # React Native frontend
│   ├── app/              # Expo Router screens
│   │   ├── (tabs)/      # Tab navigation screens
│   │   │   ├── index.tsx      # Dashboard
│   │   │   ├── tasks.tsx      # Tasks list
│   │   │   └── profile.tsx    # User profile
│   │   ├── auth/        # Authentication screens
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── tasks/       # Task management screens
│   │   │   ├── create.tsx     # Create task
│   │   │   ├── [id].tsx       # Task details
│   │   │   ├── edit/[id].tsx  # Edit task
│   │   │   └── archived.tsx   # Archived tasks
│   │   └── _layout.tsx  # Root layout
│   ├── components/      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── TaskCard.tsx
│   │   ├── Loading.tsx
│   │   └── ...
│   ├── services/        # API service layers
│   │   ├── api.ts      # Axios client
│   │   ├── auth.service.ts
│   │   ├── task.service.ts
│   │   └── notification.service.ts
│   ├── store/          # Zustand state management
│   │   └── index.ts
│   ├── utils/          # Helper functions
│   │   └── helpers.ts
│   └── package.json    # Frontend dependencies
└── backend/            # Node.js backend server
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   └── server.js
    └── package.json
```

### Why These Technologies?

#### **Zustand for State Management**
- **Simpler than Redux**: No boilerplate, straightforward API
- **Small bundle size**: ~1KB minified
- **TypeScript-friendly**: Built-in type support
- **No Context needed**: Direct store access without providers
- **Perfect for learning**: Easy to understand and implement

#### **NativeWind (Tailwind CSS)**
- **Utility-first**: Rapid UI development
- **Consistent styling**: Same syntax as web Tailwind
- **Responsive**: Built-in responsive design utilities
- **Dark mode**: Easy theme switching
- **Popular**: Industry-standard approach

#### **Formik + Yup**
- **Form validation**: Schema-based validation with Yup
- **Error handling**: Built-in error state management
- **Less code**: Reduces boilerplate for forms
- **Industry standard**: Widely used in production

#### **Expo Router**
- **File-based routing**: Automatic navigation setup
- **Type-safe**: TypeScript support out of the box
- **Modern**: Latest React Native navigation patterns
- **Easy deep linking**: Built-in support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Expo CLI: `npm install -g expo-cli`

### Installation

#### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd TaskManagementApp_ReactNative

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Setup Environment Variables

**Frontend (frontend/.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env and set:
API_URL=http://localhost:3000/api
# For physical device, use your computer's IP:
# API_URL=http://192.168.1.XXX:3000/api
cd ..
```

**Backend (backend/.env)**
```bash
cd backend
cp .env.example .env
# Edit backend/.env and set:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskmaster
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmaster
JWT_SECRET=your_secure_random_string_here
CORS_ORIGIN=http://localhost:8081
```

#### 3. Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is installed and running
mongod
```

**MongoDB Atlas:**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGODB_URI` in backend/.env

#### 4. Run the Application

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

#### 5. Open in Expo Go

- Install Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Scan the QR code from the terminal
- Or press `i` for iOS simulator, `a` for Android emulator

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Task Endpoints (All Protected)

#### Get All Tasks
```http
GET /tasks?status=todo&priority=high&sortBy=dueDate&order=asc
Authorization: Bearer <token>
```

#### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the React Native app",
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

#### Update Task
```http
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "done"
}
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

#### Get Task Statistics
```http
GET /tasks/stats/summary
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm test -- --coverage
```

## 📚 Learning Points

### 1. **State Management with Zustand**
- Located in `store/index.ts`
- Three stores: Auth, Tasks, Settings
- Simple API: `create()`, `set()`, `get()`
- No provider wrapping needed

### 2. **API Integration**
- Axios interceptors for token attachment (`services/api.ts`)
- Centralized error handling
- Type-safe with TypeScript interfaces

### 3. **Form Validation**
- Formik for form state management
- Yup for schema validation
- See `app/auth/register.tsx` for example

### 4. **Navigation**
- Expo Router file-based routing
- Protected routes in `app/_layout.tsx`
- Tab navigation in `app/(tabs)/_layout.tsx`

### 5. **Styling with NativeWind**
- Tailwind classes in JSX: `className="bg-blue-500 p-4"`
- Responsive: `className="w-full md:w-1/2"`
- Dark mode: `className="bg-white dark:bg-gray-800"`

### 6. **Backend Best Practices**
- MVC pattern (Models, Views/Routes, Controllers)
- Middleware for auth, validation, rate limiting
- MongoDB indexes for performance
- Password hashing with bcrypt
- JWT for stateless authentication

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Prevent brute force attacks
4. **Input Validation**: express-validator for sanitization
5. **CORS Protection**: Configured allowed origins
6. **Environment Variables**: Sensitive data not in code

## 🎨 UI/UX Features

1. **Loading States**: Shows spinner during API calls
2. **Error Handling**: User-friendly error messages
3. **Toast Notifications**: Success/error feedback
4. **Pull to Refresh**: Update data by pulling down
5. **Empty States**: Helpful messages when no data
6. **Dark Mode**: Respects system preference

## 🚧 Future Enhancements

- [ ] Real-time sync with WebSockets
- [ ] Offline-first with Realm or SQLite
- [ ] Task categories and tags
- [ ] File attachments
- [ ] Collaboration features
- [ ] Calendar view
- [ ] Task templates
- [ ] Export tasks (PDF, CSV)
- [ ] Biometric authentication
- [ ] Widget support

## 🐛 Troubleshooting

### Common Issues

**1. Metro bundler errors:**
```bash
npm start -- --reset-cache
```

**2. MongoDB connection failed:**
- Check if MongoDB is running
- Verify connection string in `.env`

**3. API not reachable on physical device:**
- Use your computer's local IP instead of localhost
- Ensure phone and computer are on same network

**4. Expo Go errors:**
```bash
expo start -c  # Clear cache
```

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Created as a comprehensive learning project for React Native development.

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your learning!

## 📞 Support

For questions or issues, please refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Happy Coding! 🚀**
