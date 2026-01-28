# Installation & Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

3. **MongoDB** (Choose one option)
   
   **Option A: Local MongoDB**
   - Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS
   - Start MongoDB: `mongod`

   **Option B: MongoDB Atlas (Recommended for beginners)**
   - Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier M0)
   - Get connection string

4. **Expo CLI** (Optional but recommended)
   ```bash
   npm install -g expo-cli
   ```

5. **Expo Go App** on your phone
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for emulators)

- **Xcode** (Mac only) for iOS Simulator
- **Android Studio** for Android Emulator

---

## Step-by-Step Installation

### Step 1: Install Project Dependencies

```bash
# Navigate to project root
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

**Expected output:**
```
✓ Dependencies installed successfully
```

### Step 2: Setup Environment Variables

#### Frontend Environment (frontend/.env)

Create a `.env` file in the frontend directory:

```bash
# Copy example file
cd frontend
cp .env.example .env
cd ..
```

Edit `frontend/.env`:
```env
# For iOS Simulator or Android Emulator (localhost works)
API_URL=http://localhost:3000/api

# For Physical Device (use your computer's local IP)
# Find your IP:
#   Windows: ipconfig (look for IPv4 Address)
#   Mac/Linux: ifconfig or ip addr
# API_URL=http://192.168.1.XXX:3000/api
```

#### Backend Environment (backend/.env)

Create backend `.env` file:

```bash
cd backend
cp .env.example .env
cd ..
```

Edit `backend/.env`:

**For Local MongoDB:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
CORS_ORIGIN=http://localhost:8081
```

**For MongoDB Atlas:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmaster?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
CORS_ORIGIN=http://localhost:8081
```

**Important:** 
- Replace `username`, `password`, and cluster details with your MongoDB Atlas credentials
- Generate a secure JWT_SECRET (can use online generator or random string)

### Step 3: Start MongoDB

#### Local MongoDB:
```bash
# Windows
mongod

# Mac (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### MongoDB Atlas:
- No action needed, it's cloud-hosted
- Ensure your IP is whitelisted in MongoDB Atlas dashboard

### Step 4: Start the Backend Server

Open a terminal (Terminal 1):

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 3000
📝 Environment: development
✅ MongoDB Connected: localhost
```

**If you see errors:**
- Check MongoDB is running
- Verify MONGODB_URI in `.env`
- Ensure port 3000 is not in use

### Step 5: Start the Frontend App

Open a new terminal (Terminal 2):

```bash
# Navigate to project root (if not already there)
cd TaskManagementApp_ReactNative

# Navigate to frontend and start Expo
cd frontend
npm start
```

**Expected output:**
```
› Metro waiting on exp://192.168.1.XXX:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### Step 6: Run on Device/Simulator

#### Physical Device:
1. Open Expo Go app on your phone
2. Scan the QR code from terminal
3. App will load

#### iOS Simulator:
```bash
# Press 'i' in the terminal
# Or run:
npm run ios
```

#### Android Emulator:
```bash
# Press 'a' in the terminal
# Or run:
npm run android
```

---

## Verification Steps

### 1. Verify Backend is Running

Open browser and go to:
```
http://localhost:3000/api/health
```

Should see:
```json
{
  "status": "success",
  "message": "TaskMaster API is running",
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

### 2. Test Registration

In the app:
1. Click "Sign Up"
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

Should redirect to Dashboard ✅

### 3. Create a Task

1. Click "+" button or "Create Task"
2. Fill in task details
3. Click "Create Task"
4. Task appears in list ✅

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to development server"

**Solution:**
```bash
# Clear cache and restart
npm start -- --reset-cache
# or
expo start -c
```

#### 2. "Failed to connect to MongoDB"

**Causes:**
- MongoDB not running
- Wrong connection string
- Firewall blocking connection

**Solution:**
```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongo

# Mac/Linux:
ps aux | grep mongo

# Restart MongoDB
mongod
```

#### 3. "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Also clear Metro cache
npm start -- --reset-cache
```

#### 4. "Network request failed" in app

**Causes:**
- Backend not running
- Wrong API_URL in .env
- Phone and computer on different networks

**Solution:**
- Ensure backend is running (`cd backend && npm run dev`)
- For physical device, use computer's IP in .env:
  ```env
  API_URL=http://192.168.1.XXX:3000/api
  ```
- Ensure both devices on same WiFi network

#### 5. "Port 3000 already in use"

**Solution:**
```bash
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Or change port in backend/.env:
PORT=3001
```

#### 6. Expo Go "Something went wrong"

**Solution:**
```bash
# Clear Expo cache
expo start -c

# Or clear all caches
rm -rf node_modules
npm cache clean --force
npm install
expo start -c
```

---

## Testing the Installation

Run this checklist:

- [ ] Backend starts without errors
- [ ] MongoDB connects successfully
- [ ] Health check endpoint responds
- [ ] Frontend app opens in Expo Go
- [ ] Registration works
- [ ] Login works
- [ ] Can create a task
- [ ] Can view task list
- [ ] Can update task status
- [ ] Can delete task
- [ ] Dashboard shows statistics

---

## Platform-Specific Notes

### Windows
- Use Git Bash or PowerShell for commands
- MongoDB might need to run as Administrator
- Use `ipconfig` to find IP address

### macOS
- Xcode required for iOS development
- Use `ifconfig` to find IP address
- MongoDB can be installed via Homebrew

### Linux
- Use package manager for MongoDB
- Use `ip addr` to find IP address
- May need `sudo` for some operations

---

## Next Steps

After successful installation:

1. **Explore the app**
   - Create several tasks
   - Try different priorities
   - Test filters
   - Archive tasks

2. **Read the documentation**
   - [README.md](README.md) - Full documentation
   - [LEARNING_GUIDE.md](LEARNING_GUIDE.md) - Code explanations
   - [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview

3. **Start customizing**
   - Change colors in tailwind.config.js
   - Add new features
   - Modify existing screens

4. **Learn by doing**
   - Add a new task field
   - Create a new screen
   - Implement new API endpoint

---

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Search the error in documentation
3. Review [QUICKSTART.md](QUICKSTART.md)
4. Check [troubleshooting section](#troubleshooting)
5. Ensure all prerequisites are installed
6. Try clearing caches and reinstalling

---

## Success! 🎉

If you see:
- ✅ Backend running
- ✅ MongoDB connected
- ✅ App loads on device
- ✅ Can register and login

**You're ready to start learning!**

Happy coding! 🚀
