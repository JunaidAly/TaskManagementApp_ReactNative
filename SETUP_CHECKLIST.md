# TaskMaster Setup Checklist

Use this checklist to ensure everything is properly configured.

## Pre-Installation

- [ ] Node.js installed (v16+)
  ```bash
  node --version
  ```
- [ ] npm installed
  ```bash
  npm --version
  ```
- [ ] Git installed
  ```bash
  git --version
  ```
- [ ] MongoDB ready (local or Atlas account)
- [ ] Expo Go app installed on phone (optional)

## Installation

- [ ] Project dependencies installed
  ```bash
  npm install
  ```
- [ ] Backend dependencies installed
  ```bash
  cd backend && npm install
  ```

## Configuration

### Frontend (.env)
- [ ] `.env` file created in root
- [ ] `API_URL` configured
  - [ ] Using `http://localhost:3000/api` for simulator
  - [ ] Or using computer IP for physical device

### Backend (backend/.env)
- [ ] `backend/.env` file created
- [ ] `PORT` set (default: 3000)
- [ ] `NODE_ENV` set (development)
- [ ] `MONGODB_URI` configured
  - [ ] Local: `mongodb://localhost:27017/taskmaster`
  - [ ] Or Atlas connection string
- [ ] `JWT_SECRET` set (secure random string)
- [ ] `CORS_ORIGIN` set (http://localhost:8081)

## Database

- [ ] MongoDB running (if local)
  ```bash
  mongod
  ```
- [ ] Or MongoDB Atlas cluster active
- [ ] Can connect to database

## Backend Server

- [ ] Backend starts without errors
  ```bash
  cd backend && npm run dev
  ```
- [ ] See "✅ MongoDB Connected" message
- [ ] See "🚀 Server is running" message
- [ ] Health check works
  ```
  http://localhost:3000/api/health
  ```

## Frontend App

- [ ] Metro bundler starts
  ```bash
  npm start
  ```
- [ ] QR code appears
- [ ] Can open in Expo Go or simulator

## Functionality Tests

### Authentication
- [ ] Can access registration screen
- [ ] Can create new account
  - Name: Test User
  - Email: test@example.com
  - Password: password123
- [ ] Redirected to dashboard after registration
- [ ] Can logout
- [ ] Can login with created account

### Tasks
- [ ] Dashboard loads and shows stats
- [ ] Can navigate to Tasks tab
- [ ] Can create new task
  - Title: "My First Task"
  - Description: Optional
  - Priority: Any
  - Status: Any
- [ ] Task appears in list
- [ ] Can tap task to view details
- [ ] Can update task status
- [ ] Can edit task
- [ ] Can delete task (with confirmation)
- [ ] Can archive task

### UI/UX
- [ ] Pull to refresh works
- [ ] Search works
- [ ] Filters work (status)
- [ ] Loading indicators show
- [ ] Toast messages appear
- [ ] Empty states display properly

### Profile
- [ ] Profile screen shows user info
- [ ] Theme toggle works
- [ ] Notifications toggle works
- [ ] Archived tasks link works
- [ ] Logout works

## Developer Tools

- [ ] Can see console logs
- [ ] React DevTools accessible (if needed)
- [ ] Backend logs showing requests
- [ ] MongoDB data visible (using Compass or similar)

## Optional Enhancements

- [ ] iOS Simulator setup (Mac only)
- [ ] Android Emulator setup
- [ ] VS Code extensions installed
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] Prettier
  - [ ] ESLint
- [ ] Git repository initialized
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

## Production Readiness (Optional)

- [ ] Changed JWT_SECRET to secure value
- [ ] Updated MONGODB_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Backend deployed (Heroku/Vercel)
- [ ] Frontend built for production
  ```bash
  expo build:android
  expo build:ios
  ```

## Troubleshooting

If any checkbox fails, refer to:
- [ ] [INSTALLATION.md](INSTALLATION.md) - Detailed setup guide
- [ ] [QUICKSTART.md](QUICKSTART.md) - Quick reference
- [ ] [README.md](README.md) - Full documentation
- [ ] Troubleshooting section in docs

## Success Criteria

All core functionality items checked = **Ready to start learning!** 🎉

---

**Pro Tips:**
1. Run through this checklist after any major changes
2. Keep this handy for team onboarding
3. Update as you add new features
4. Use as deployment checklist

## Notes

Add any custom notes or issues encountered:

```
Date: _______________
Issues: 


Solutions:


```

---

**Last Updated:** January 2024
**Version:** 1.0.0
