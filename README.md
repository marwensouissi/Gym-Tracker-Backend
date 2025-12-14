# 🏋️ AI-Powered Fitness Tracker Backend

A production-ready RESTful API for fitness tracking with AI-powered personalized recommendations using Google Gemini AI.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Workout Tracking** - Log cardio and resistance workouts with automatic calorie calculation
- ✅ **Meal Logging** - Track meals with detailed macronutrient breakdown
- ✅ **User Health Profiles** - Comprehensive health data including age, height, weight history, medical conditions
- ✅ **Weight History** - Automatic tracking of weight changes over time with progress analytics

### AI-Powered Features (Google Gemini)
- 🤖 **Personalized Workout Suggestions** - AI analyzes your profile, goals, and history
- 🍽️ **Custom Meal Plans** - Tailored to your dietary restrictions, allergies, and fitness goals
- 📊 **Weekly Progress Summaries** - Data-driven insights and actionable recommendations
- 🔒 **Medical Safety** - AI considers injuries, conditions, and restrictions

### Advanced Features
- 🛡️ **AI Safety Layers** - Rate limiting, input sanitization, timeout protection, content filtering
- 📈 **Smart Calorie Calculation** - MET-based for cardio, volume-based for resistance training
- 📝 **Input Validation** - Comprehensive validation using Joi
- 🔐 **Security** - Helmet, CORS, rate limiting, JWT tokens
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🐳 **Docker Support** - Complete containerization with Docker Compose
- 🧪 **Testing** - Unit and integration tests with Jest
- ⚙️ **CI/CD** - GitHub Actions workflow

## 🏗️ Tech Stack

**Backend Framework:**
- Node.js 18+
- Express 5
- ES Modules

**Database:**
- MongoDB
- Mongoose ODM

**AI/ML:**
- Google Gemini 1.5 Flash
- Custom prompt engineering

**Security:**
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS

**Validation:**
- Joi

**Testing:**
- Jest
- Supertest

**DevOps:**
- Docker & Docker Compose
- GitHub Actions
- Nodemon

**Documentation:**
- Swagger UI Express
- OpenAPI 3.0

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- Google Gemini API key ([Get free key](https://ai.google.dev/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-fitness-tracker-backend.git
cd ai-fitness-tracker-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start MongoDB (if running locally)
# mongod

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

Server will be running at `http://localhost:3000`

### Docker Quick Start

```bash
# Start everything with Docker Compose
docker-compose up --build

# Seed data (in another terminal)
npm run seed
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/fitness-tracker

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# AI Service
GEMINI_API_KEY=your_google_gemini_api_key_here
```

⚠️ **Important:** Never commit `.env` file to version control!

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:3000/api-docs` for interactive Swagger UI documentation.

### Quick Reference

#### Authentication
```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login and get JWT token
GET  /api/auth/me          # Get current user info
```

#### User Profile
```bash
GET  /api/profile                 # Get user profile
POST /api/profile                 # Create/update profile
PUT  /api/profile/weight          # Update weight (saves to history)
GET  /api/profile/weight-history  # Get weight history
```

#### Workouts
```bash
POST /api/workouts        # Log a workout (auto-calculates calories)
GET  /api/workouts        # Get user's workouts
```

#### Meals
```bash
POST /api/meals           # Log a meal (auto-calculates totals)
GET  /api/meals           # Get user's meals
```

#### AI Features
```bash
GET /api/ai/workout-suggestion  # Get personalized workout plan
GET /api/ai/meal-suggestion     # Get personalized meal plan
GET /api/ai/weekly-summary      # Get weekly progress analysis
```

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

#### Set Up Profile
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "gender": "male",
    "height": 180,
    "currentWeight": 75,
    "targetWeight": 70,
    "fitnessGoals": ["weight_loss", "endurance"],
    "activityLevel": "moderately_active",
    "experienceLevel": "intermediate",
    "workoutFrequency": 4,
    "dietaryRestrictions": ["vegetarian"],
    "allergies": []
  }'
```

#### Log Workout
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "resistance",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": 8,
        "weight": 80
      }
    ],
    "notes": "Felt strong today!"
  }'
```

#### Get AI Workout Suggestion
```bash
curl http://localhost:3000/api/ai/workout-suggestion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧮 Calorie Calculation Formulas

### Cardio Workouts (MET-based)
```
Calories = MET × Weight(kg) × Duration(hours)
```

**MET Values:**
- Running: 9.8
- Cycling: 7.5
- Swimming: 8.0
- Walking: 3.8
- Generic cardio: 6.0

### Resistance Workouts (Volume-based)
```
Calories = (Sets × Reps × Weight) × 0.03
```

Fallback to duration-based if volume data insufficient.

## 🤖 AI Features Deep Dive

### How It Works

1. **Profile Analysis** - AI receives your complete health profile
2. **Pattern Recognition** - Analyzes your workout and meal history
3. **Personalization** - Tailors suggestions to your goals, restrictions, and medical conditions
4. **Safety First** - Considers injuries, allergies, and medical conditions

### AI Safety Layers

| Layer | Implementation |
|-------|---------------|
| Token Limits | Max 2000 output tokens |
| Request Timeout | 15-second timeout |
| Input Sanitization | HTML/injection removal |
| Rate Limiting | 10 requests/min per user |
| Output Validation | Quality checks |
| Safety Filters | Gemini content filtering |

### What AI Considers

**For Workouts:**
- Your age, gender, weight, BMI
- Medical conditions & injuries
- Experience level
- Fitness goals
- Recent workout patterns
- Workout frequency

**For Meals:**
- Dietary restrictions (vegetarian, vegan, etc.)
- Allergies
- Activity level
- Calorie targets
- Macronutrient needs
- Weight goals

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm test tests/unit

# Integration tests only
npm test tests/integration

# Watch mode
npm run test:watch
```

### Test Coverage
- ✅ Unit tests for calorie calculation
- ✅ Integration tests for complete user flow
- ✅ Auth middleware tests
- ✅ API endpoint tests

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production Build
```bash
# Build image
docker build -t fitness-tracker-api .

# Run container
docker run -p 3000:3000 --env-file .env fitness-tracker-api
```

## 📂 Project Structure

```
fitness-tracker-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   └── env.js       # Environment variables
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── workoutController.js
│   │   ├── mealController.js
│   │   ├── profileController.js
│   │   └── aiController.js
│   ├── middleware/      # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── aiRateLimiter.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Workout.js
│   │   ├── Meal.js
│   │   └── UserProfile.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── workoutRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── profileRoutes.js
│   │   └── aiRoutes.js
│   ├── services/        # Business logic
│   │   ├── aiService.js
│   │   └── calorieService.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions CI
├── docs/                # Additional documentation
├── .env.example         # Environment template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── swagger.yaml         # OpenAPI specification
├── seed.js              # Database seeder
└── README.md
```

## 🚀 Deployment

### Recommended Platforms
- **Backend**: Railway, Render, Heroku, AWS EC2
- **Database**: MongoDB Atlas (free tier available)
- **CI/CD**: GitHub Actions (included)

### Environment Setup
1. Set all environment variables on your platform
2. Ensure MongoDB connection string is correct
3. Add Gemini API key
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ES Modules
- Follow existing code structure
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent recommendations
- MongoDB for flexible data storage
- Express.js community
- All contributors

## 📞 Support

If you have any questions or issues, please:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review the API guide at `/api-docs`

---

**Built with ❤️ using Node.js, Express, MongoDB, and Google Gemini AI**
