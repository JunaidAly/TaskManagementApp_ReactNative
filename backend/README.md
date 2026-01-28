# TaskMaster Backend

Backend API for TaskMaster task management application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Start MongoDB (if running locally)

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get task by ID (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `GET /api/tasks/stats/summary` - Get task statistics (protected)

## Deployment

### Heroku
```bash
heroku create taskmaster-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in backend directory
3. Set environment variables in Vercel dashboard

## Security

- Rate limiting enabled
- CORS configured
- Input validation
- Password hashing with bcrypt
- JWT token authentication
