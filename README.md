# AI-Powered Fitness Tracker Backend

A production-ready Express.js backend with MongoDB for fitness tracking, featuring AI-powered workout and meal suggestions using Google Gemini.

## Features

- ✅ **Authentication**: JWT-based auth with bcrypt password hashing
- ✅ **Workout Logging**: Track cardio and resistance exercises with automatic calorie calculation
- ✅ **Meal Logging**: Log meals with macro tracking and calorie estimation
- ✅ **AI Suggestions**: Personalized workout/meal recommendations and weekly summaries via Google Gemini
- ✅ **API Documentation**: Interactive Swagger UI
- ✅ **Testing**: Comprehensive unit and integration tests
- ✅ **DevOps**: Docker support and CI/CD pipeline

## 🛡️ AI Safety & Security Features

Our AI service implements **6 layers of protection** for production-ready safety:

| Protection | Implementation |
|------------|---------------|
| **Token Limits** | Max 1024 output tokens to control costs |
| **Request Timeouts** | 15-second timeout to prevent hanging |
| **Input Sanitization** | Removes HTML, injection patterns, limits length |
| **Rate Limiting** | 10 requests/minute per user |
| **Output Validation** | Checks response quality and format |
| **Safety Filters** | Gemini blocks harassment, hate, explicit, dangerous content |

See [AI_SECURITY.md](docs/AI_SECURITY.md) for detailed documentation.

## Tech Stack

- **Node.js 18+** with ES Modules
- **Express.js 5** - Web framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini AI** for suggestions
- **Jest** for testing
- **Docker** for containerization
- **Swagger/OpenAPI** for documentation

## Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

See `.env.example` for reference.

## Installation

### Local Development

```bash
# Install dependencies
npm install

# Start MongoDB (if running locally)
# mongod --dbpath /path/to/data

# Run in development mode
npm run dev

# Or start normally
npm start
```

### Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The app will be available at `http://localhost:3000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Workouts
- `POST /api/workouts` - Log workout (protected)
- `GET /api/workouts` - Get user workouts (protected)

### Meals
- `POST /api/meals` - Log meal (protected)
- `GET /api/meals` - Get user meals (protected)

### AI
- `GET /api/ai/workout-suggestion` - Get AI workout suggestion (protected)
- `GET /api/ai/meal-suggestion` - Get AI meal suggestion (protected)
- `GET /api/ai/weekly-summary` - Get weekly summary (protected)

## Example Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Log Workout
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "resistance",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "weight": 60
      }
    ],
    "notes": "Great session!"
  }'
```

### Log Meal
```bash
curl -X POST http://localhost:3000/api/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Breakfast",
    "foodItems": [
      {
        "name": "Oatmeal",
        "quantity": "100g",
        "calories": 150,
        "protein": 5,
        "carbs": 27,
        "fat": 3
      }
    ]
  }'
```

### Get AI Suggestion
```bash
curl http://localhost:3000/api/ai/workout-suggestion \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
diet/
├── src/
│   ├── config/         # Environment & DB config
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic (calorie, AI)
│   ├── utils/          # Logger, helpers
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── .github/
│   └── workflows/      # CI/CD pipelines
├── swagger.yaml        # API documentation
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Calorie Calculations

### Cardio
Uses MET (Metabolic Equivalent of Task) formula:
```
Calories = MET × Weight(kg) × Duration(hours)
```

MET values:
- Running: 9.8
- Cycling: 7.5
- Swimming: 8.0
- Walking: 3.8

### Resistance
Volume-based estimate:
```
Calories = (Sets × Reps × Weight) × 0.03
```

Falls back to duration-based MET if no volume data.

## AI Features

The AI service uses Google Gemini with:
- **Retry Logic**: 3 attempts with linear backoff
- **Graceful Fallback**: Returns friendly message if AI unavailable
- **Rate Limiting**: Managed via service layer

## CI/CD Pipeline

GitHub Actions workflow runs on push/PR:
1. ✅ Runs unit and integration tests
2. ✅ Builds Docker image
3. ✅ Validates Docker container startup

## Acceptance Criteria

- [x] Clean, modular ES module architecture
- [x] Mongoose models with password hashing
- [x] Calorie calculations (MET + volume-based)
- [x] AI service with retry/backoff and graceful fallback
- [x] JWT authentication with protected routes
- [x] Input validation (Joi)
- [x] CORS, Helmet, logging (Morgan)
- [x] Swagger/OpenAPI documentation
- [x] Unit tests for calorie service
- [x] Integration tests for full user flow
- [x] Docker + docker-compose setup
- [x] GitHub Actions CI pipeline
- [x] Comprehensive README

## License

ISC
