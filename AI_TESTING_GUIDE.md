# Complete AI Feature Testing Scenario - Postman Guide

## 🎯 Objective
Test all AI-powered features of the Fitness Tracker using Google Gemini:
- AI Workout Suggestions
- AI Meal Recommendations
- Weekly Summary Analysis

---

## 📋 Prerequisites

### 1. Get Google Gemini API Key (FREE)
1. Visit: https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Click "Create API Key"
5. Copy your API key

### 2. Configure Environment
Edit your `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=my_secret_key_12345
GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE    # ⬅️ Paste your key here
NODE_ENV=development
```

### 3. Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4. Import Postman Collection
- Open Postman
- Click "Import"
- Select `Fitness-Tracker.postman_collection.json`
- Collection should appear in left sidebar

---

## 🚀 Complete Testing Workflow

### **STEP 1: Login & Get Token**

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "demo@fitness.com",
  "password": "demo1234"
}
```

**Expected Response:**
```json
{
  "_id": "675cb12a...",
  "name": "Demo User",
  "email": "demo@fitness.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Action:** 
✅ Copy the `token` value (the Postman collection auto-saves it)

---

### **STEP 2: Create Recent Workouts (for AI context)**

The AI provides better suggestions when it knows your workout history. Let's create some workouts.

#### Workout #1: Resistance Training

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/workouts`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN`
  - `Content-Type`: `application/json`
- Body:
```json
{
  "type": "resistance",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 8,
      "weight": 80
    },
    {
      "name": "Squats",
      "sets": 4,
      "reps": 10,
      "weight": 100
    },
    {
      "name": "Deadlifts",
      "sets": 3,
      "reps": 6,
      "weight": 120
    }
  ],
  "notes": "Heavy strength day - felt strong!"
}
```

**Expected Response:**
```json
{
  "_id": "...",
  "user": "...",
  "type": "resistance",
  "exercises": [...],
  "caloriesBurned": 384,  // ⬅️ Auto-calculated!
  "date": "2025-12-14T01:19:45.123Z",
  "notes": "Heavy strength day - felt strong!"
}
```

#### Workout #2: Cardio Session

**Request:**
- Same headers
- Body:
```json
{
  "type": "cardio",
  "duration": 45,
  "exercises": [
    {
      "name": "running",
      "duration": 45,
      "distance": 8
    }
  ],
  "notes": "Long run, steady pace"
}
```

**Expected Response:**
```json
{
  "caloriesBurned": 515,  // ⬅️ MET-based calculation
  "type": "cardio",
  ...
}
```

#### Workout #3: HIIT Training

**Request:**
- Body:
```json
{
  "type": "cardio",
  "duration": 25,
  "exercises": [
    {
      "name": "hiit",
      "duration": 25
    }
  ],
  "notes": "High intensity intervals"
}
```

---

### **STEP 3: Log Some Meals (for dietary context)**

#### Meal #1: High Protein Breakfast

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/meals`
- Headers: Same as above
- Body:
```json
{
  "name": "Post-Workout Breakfast",
  "foodItems": [
    {
      "name": "Scrambled Eggs",
      "quantity": "4 eggs",
      "calories": 280,
      "protein": 24,
      "carbs": 2,
      "fat": 20
    },
    {
      "name": "Oatmeal",
      "quantity": "150g",
      "calories": 225,
      "protein": 7,
      "carbs": 40,
      "fat": 4
    },
    {
      "name": "Banana",
      "quantity": "1 large",
      "calories": 121,
      "protein": 1,
      "carbs": 31,
      "fat": 0
    }
  ]
}
```

#### Meal #2: Lean Lunch

**Request:**
- Body:
```json
{
  "name": "Healthy Lunch",
  "foodItems": [
    {
      "name": "Grilled Chicken",
      "quantity": "200g",
      "calories": 330,
      "protein": 62,
      "carbs": 0,
      "fat": 7
    },
    {
      "name": "Brown Rice",
      "quantity": "200g",
      "calories": 220,
      "protein": 5,
      "carbs": 45,
      "fat": 2
    },
    {
      "name": "Mixed Vegetables",
      "quantity": "150g",
      "calories": 75,
      "protein": 3,
      "carbs": 15,
      "fat": 0
    }
  ]
}
```

---

### **STEP 4: Test AI Workout Suggestion** 🤖

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/ai/workout-suggestion`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN`

**Expected Response:**
```json
{
  "suggestion": "Based on your recent workouts (resistance training focusing on compound movements and cardio sessions), here's my recommendation:\n\n**Active Recovery Day**\n\nSince you've done heavy resistance work (bench press, squats, deadlifts at 80-120kg) and high-intensity cardio, I suggest an active recovery session:\n\n**Type**: Low-intensity cardio + Mobility\n\n**Exercises**:\n1. Light cycling or walking (20-30 minutes)\n2. Dynamic stretching routine\n3. Foam rolling for major muscle groups\n4. Core stability work (planks, bird dogs)\n\n**Why**: Your body needs recovery after those intense sessions. This will promote blood flow, reduce muscle soreness, and prepare you for your next strength session.\n\n**Safety**: Keep intensity at 60-70% max heart rate."
}
```

**What to Verify:**
- ✅ AI references your recent workouts
- ✅ Suggestions are personalized and safe
- ✅ Response includes workout type and specific exercises
- ✅ Reasoning is provided

---

### **STEP 5: Test AI Meal Suggestion** 🍽️

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/ai/meal-suggestion`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN`

**Expected Response:**
```json
{
  "suggestion": "Based on your target of 2000 calories, here's a balanced meal plan for today:\n\n**Breakfast (500 cal)**\n- Greek yogurt with granola and berries\n- Whole wheat toast with avocado\n- Black coffee or green tea\n\n**Mid-Morning Snack (200 cal)**\n- Apple with almond butter\n- 10 almonds\n\n**Lunch (600 cal)**\n- Grilled salmon (150g)\n- Quinoa (1 cup cooked)\n- Steamed broccoli and carrots\n- Olive oil dressing\n\n**Afternoon Snack (200 cal)**\n- Protein shake with banana\n\n**Dinner (500 cal)**\n- Lean beef stir-fry with vegetables\n- Brown rice\n- Side salad\n\n**Macros**: ~40% carbs, 30% protein, 30% fats\n\n**Tips**: \n- Stay hydrated (2-3L water)\n- Time your carbs around your workouts\n- Include fiber-rich foods for digestion"
}
```

**What to Verify:**
- ✅ Meal plan is detailed and practical
- ✅ Calorie target is considered
- ✅ Macro breakdown provided
- ✅ Includes practical tips

---

### **STEP 6: Test Weekly Summary** 📊

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/ai/weekly-summary`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN`

**Expected Response:**
```json
{
  "summary": "**Weekly Fitness Summary Analysis**\n\n**Workout Performance:**\n- Total Workouts: 5 sessions\n- Resistance Training: 2 sessions (focus on compound lifts)\n- Cardio: 3 sessions (mix of steady-state and HIIT)\n- Total Calories Burned: ~1,520 calories\n- Average per session: 304 calories\n\n**Nutrition Overview:**\n- Meals Logged: 4\n- Average Daily Intake: ~1,800 calories\n- Protein Focus: Good (high-protein breakfast and lunch)\n- Meal Consistency: Could be improved\n\n**Key Observations:**\n1. ✅ Great variety in training (strength + cardio)\n2. ✅ Progressive overload visible (80-120kg loads)\n3. ⚠️ Calorie intake slightly below expenditure\n4. ⚠️ Only 4 meals logged - aim for more consistency\n\n**Recommendation for Next Week:**\n1. Add 1 more resistance session (upper body focus)\n2. Include a dedicated mobility/yoga session\n3. Increase calorie intake by 200-300 calories\n4. Log all meals for better tracking\n5. Ensure adequate protein (1.6-2g per kg bodyweight)\n\n**Next Week Goal:** Focus on recovery and nutrition consistency to support your training intensity!"
}
```

**What to Verify:**
- ✅ Analyzes both workouts AND meals
- ✅ Provides statistics (calories burned, session count)
- ✅ Identifies patterns and progress
- ✅ Gives actionable recommendations
- ✅ References specific data from your logs

---

## 🧪 Advanced Testing Scenarios

### Scenario A: No Recent Data

**Test:** Create a new user with no workouts/meals
- Register new user
- Immediately call AI endpoints
- **Expected:** AI should acknowledge lack of data and give general advice

### Scenario B: Missing API Key

**Test:**
1. Remove `GEMINI_API_KEY` from `.env`
2. Restart server
3. Call AI endpoints

**Expected Response:**
```json
{
  "suggestion": "AI Service Unavailable"
}
```
✅ **Graceful degradation** - system doesn't crash

### Scenario C: Rate Limiting

**Test:** Make 10+ rapid AI requests in succession
- **Expected:** Some requests may return fallback message after retries
- System should remain stable

---

## 📊 Validation Checklist

After testing all endpoints, verify:

- [ ] All AI responses are contextually relevant
- [ ] AI references specific user data (workouts, meals)
- [ ] Suggestions are safe and practical
- [ ] Response times are reasonable (2-10 seconds)
- [ ] No errors logged in server console
- [ ] Graceful fallback when API key missing
- [ ] Token authentication works correctly
- [ ] All endpoints return valid JSON

---

## 🎯 Success Criteria

**✅ AI Features Pass If:**
1. Workout suggestions consider recent activity
2. Meal suggestions are detailed and calorie-appropriate
3. Weekly summary analyzes actual logged data
4. Responses are coherent and helpful
5. Error handling works (missing API key, network issues)
6. All responses complete within 15 seconds

---

## 🐛 Troubleshooting

### "AI Service Unavailable"
- Check `GEMINI_API_KEY` in `.env`
- Verify API key is valid at https://makersuite.google.com/app/apikey
- Restart server after changing `.env`

### Empty/Generic Suggestions
- Log more workouts and meals first (minimum 2 of each)
- Wait a few seconds between requests
- Check server logs for API errors

### Timeout Errors
- Gemini API may be slow during peak times
- Try again in a few minutes
- Check your internet connection

---

## 📝 Sample Postman Test Scripts

Add this to your Postman request **Tests** tab:

```javascript
// Test for AI Workout Suggestion
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has suggestion field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('suggestion');
});

pm.test("Suggestion is not empty", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.suggestion.length).to.be.above(50);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(15000);
});
```

---

## 🎉 Expected Outcome

After completing this testing scenario, you will have:
- ✅ Verified AI integration with Google Gemini
- ✅ Tested personalized recommendations
- ✅ Confirmed data analysis capabilities
- ✅ Validated error handling
- ✅ Proven the system is production-ready

**Happy Testing!** 🚀
