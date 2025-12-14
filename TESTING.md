# Quick Start Guide - Testing the Fitness Tracker

## ✅ Fixed Issues
- Reinstalled all missing dependencies
- Fixed import path for logger module
- Server now starts successfully!

## 🚀 How to Test the Full Workflow

### Step 1: Setup Environment
Create a `.env` file:
```bash
copy .env.example .env
```

Edit `.env` and add your Google Gemini API key:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

Get a free API key at: https://ai.google.dev/

### Step 2: Start MongoDB
You have two options:

**Option A - Docker (Recommended)**:
```bash
docker-compose up -d db
```

**Option B - Local MongoDB**:
```bash
# Make sure MongoDB service is running on port 27017
```

### Step 3: Seed Demo Data
```bash
npm run seed
```

This creates:
- Demo user: `demo@fitness.com` / `demo1234`
- 2 sample workouts
- 2 sample meals

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server running on port 3000 in development mode
```

### Step 5: Test the API

#### Option 1: Swagger UI (Easiest)
1. Open http://localhost:3000/api-docs
2. Try the `/api/auth/login` endpoint first
3. Copy the token from response
4. Click "Authorize" button at top
5. Enter: `Bearer YOUR_TOKEN`
6. Now try all other endpoints!

#### Option 2: Postman
1. Import `Fitness-Tracker.postman_collection.json`
2. Run "Auth → Login" (auto-saves token)
3. Test all other endpoints

#### Option 3: cURL
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@fitness.com\",\"password\":\"demo1234\"}"

# Copy the token, then:

# 2. Create Workout
curl -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"type\":\"resistance\",\"exercises\":[{\"name\":\"Bench Press\",\"sets\":3,\"reps\":10,\"weight\":60}]}"

# 3. Get Workouts (see calculated calories!)
curl http://localhost:3000/api/workouts \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get AI Suggestion
curl http://localhost:3000/api/ai/workout-suggestion \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 Complete Test Checklist

- [ ] Health check: http://localhost:3000/health
- [ ] Login with demo user
- [ ] Create a cardio workout (calories auto-calculated)
- [ ] Create a resistance workout (volume-based calculation)
- [ ] Get workouts list
- [ ] Log a meal
- [ ] Get meals list
- [ ] Get AI workout suggestion
- [ ] Get AI meal suggestion
- [ ] Get weekly summary
- [ ] Verify Swagger docs work

## ⚡ Quick Commands

```bash
# Start everything
npm run dev

# Seed data
npm run seed

# Run unit tests
npm test tests/unit

# Use Docker for everything
docker-compose up --build
```

## 🎯 Expected Results

**Workout Response** (calories auto-calculated):
```json
{
  "_id": "...",
  "type": "resistance",
  "caloriesBurned": 126,  // ✨ Auto-calculated!
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "weight": 60
    }
  ]
}
```

**AI Suggestion**:
```json
{
  "suggestion": "Based on your recent workouts, I recommend..."
}
```

## 🐛 Troubleshooting

- **Server won't start**: Run `npm install` again
- **MongoDB error**: Make sure MongoDB is running
- **AI unavailable**: Check `GEMINI_API_KEY` in `.env`
- **401 Unauthorized**: Include `Bearer ` prefix with token

Happy testing! 🎉
