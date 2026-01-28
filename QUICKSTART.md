# Quick Start Guide

## First Time Setup

### 1. Install Dependencies
```bash
# Frontend (React Native app)
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB from mongodb.com
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Recommended for beginners)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### 3. Configure Environment Files

**Frontend (frontend/.env):**
```env
API_URL=http://localhost:3000/api
```

**Backend (backend/.env):**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_random_secret_key_here
CORS_ORIGIN=http://localhost:8081
```

### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

Wait for: "✅ MongoDB Connected" and "🚀 Server is running on port 3000"

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 (Optional) - Run on Specific Platform:**
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### 5. Test the API

Open browser or Postman and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "success",
  "message": "TaskMaster API is running",
  "timestamp": "..."
}
```

## Testing User Registration

1. In the app, click "Sign Up"
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
3. Click "Create Account"

You should be redirected to the Dashboard!

## Common Commands

```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Reset Expo cache
expo start -c

# View backend logs
cd backend && npm run dev

# Check backend is running
curl http://localhost:3000/api/health
```

## Troubleshooting

### "Cannot connect to server"
- Ensure backend is running (`cd backend && npm run dev`)
- Check API_URL in .env matches your setup
- For physical device, use your computer's IP address instead of localhost

### "MongoDB connection error"
- Verify MongoDB is running
- Check MONGODB_URI in backend/.env is correct
- For MongoDB Atlas, ensure your IP is whitelisted

### "Module not found"
```bash
# Delete and reinstall node_modules
rm -rf node_modules
npm install
```

## Next Steps

1. Create your first task
2. Try filtering tasks by status
3. Mark a task as complete
4. Archive completed tasks
5. Explore the profile settings

Happy coding! 🚀
