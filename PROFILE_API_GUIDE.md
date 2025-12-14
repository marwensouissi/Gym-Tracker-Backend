# User Profile API Guide

## 📋 Overview

The User Profile system allows users to:
- Set comprehensive health and fitness data
- Track weight history automatically
- Provide medical conditions and dietary restrictions
- Set fitness goals
- **AI uses this data for personalized suggestions!**

---

## 🔌 Endpoints

### 1. Get User Profile

```http
GET /api/profile
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "user": "675cb12a...",
  "age": 28,
  "gender": "male",
  "height": 180,
  "currentWeight": 75,
  "weightUnit": "kg",
  "medicalConditions": [
    {
      "condition": "Asthma",
      "severity": "mild",
      "notes": "Exercise-induced"
    }
  ],
  "allergies": ["peanuts"],
  "injuries": [],
  "fitnessGoals": ["muscle_gain", "strength"],
  "targetWeight": 80,
  "activityLevel": "moderately_active",
  "dietaryRestrictions": ["none"],
  "experienceLevel": "intermediate",
  "workoutFrequency": 4,
  "bmi": "23.1",
  "weightProgress": {
    "change": "+2.3",
    "trend": "gaining"
  },
  "weightHistory": [...]
}
```

---

### 2. Create/Update Full Profile

```http
POST /api/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "age": 28,
  "gender": "male",
  "height": 180,
  "currentWeight": 75,
  "weightUnit": "kg",
  "medicalConditions": [
    {
      "condition": "Asthma",
      "severity": "mild",
      "notes": "Exercise-induced, well controlled"
    }
  ],
  "allergies": ["peanuts", "shellfish"],
  "injuries": [
    {
      "description": "Left knee ACL tear",
      "affectedArea": "knee",
      "recoveryStatus": "recovered"
    }
  ],
  "fitnessGoals": ["muscle_gain", "strength"],
  "targetWeight": 80,
  "activityLevel": "moderately_active",
  "dietaryRestrictions": ["none"],
  "experienceLevel": "intermediate",
  "workoutFrequency": 4
}
```

**Available Options:**

- **Gender**: `male`, `female`, `other`, `prefer_not_to_say`
- **Medical Severity**: `mild`, `moderate`, `severe`
- **Recovery Status**: `recovering`, `recovered`, `chronic`
- **Fitness Goals**: `weight_loss`, `muscle_gain`, `endurance`, `strength`, `flexibility`, `general_fitness`, `rehabilitation`
- **Activity Level**: `sedentary`, `lightly_active`, `moderately_active`, `very_active`, `extremely_active`
- **Dietary Restrictions**: `vegetarian`, `vegan`, `halal`, `kosher`, `gluten_free`, `dairy_free`, `low_carb`, `keto`, `paleo`, `none`
- **Experience Level**: `beginner`, `intermediate`, `advanced`

---

### 3. Update Weight Only (Adds to History)

```http
PUT /api/profile/weight
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "weight": 76.5,
  "unit": "kg"
}
```

**Response:**
```json
{
  "message": "Weight updated successfully",
  "currentWeight": 76.5,
  "unit": "kg",
  "bmi": "23.6",
  "weightProgress": {
    "change": "+1.5",
    "trend": "gaining"
  },
  "totalRecords": 15
}
```

---

### 4. Get Weight History

```http
GET /api/profile/weight-history
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "weightHistory": [
    {
      "weight": 76.5,
      "unit": "kg",
      "recordedAt": "2025-12-14T15:50:00.000Z"
    },
    {
      "weight": 75.8,
      "unit": "kg",
      "recordedAt": "2025-12-07T10:30:00.000Z"
    },
    {
      "weight": 75.0,
      "unit": "kg",
      "recordedAt": "2025-12-01T08:15:00.000Z"
    }
  ],
  "currentWeight": 76.5,
  "unit": "kg",
  "progress": {
    "change": "+1.5",
    "trend": "gaining"
  }
}
```

---

## 🤖 AI Integration

Once you set your profile, the AI will use this data:

### Example AI Request Context

When you call `GET /api/ai/workout-suggestion`, the AI receives:

```json
{
  "name": "Demo User",
  "health": {
    "age": 28,
    "gender": "male",
    "height": 180,
    "currentWeight": 75,
    "bmi": "23.1",
    "targetWeight": 80,
    "medicalConditions": ["Asthma"],
    "allergies": ["peanuts"],
    "injuries": [
      {
        "description": "Left knee ACL tear",
        "status": "recovered"
      }
    ],
    "fitnessGoals": ["muscle_gain", "strength"],
    "activityLevel": "moderately_active",
    "dietaryRestrictions": ["none"],
    "experienceLevel": "intermediate",
    "workoutFrequency": 4,
    "weightProgress": {
      "change": "+2.3",
      "trend": "gaining"
    }
  },
  "stats": {
    "totalWorkouts": 45,
    "avgCaloriesPerWorkout": 320
  }
}
```

### AI Will Consider:
- ✅ Your medical conditions (will avoid triggers)
- ✅ Your injuries (will modify exercises)
- ✅ Your fitness goals (muscle gain = more resistance)
- ✅ Your experience level (appropriate difficulty)
- ✅ Your dietary restrictions (meal suggestions)
- ✅ Your allergies (won't suggest allergenic foods)
- ✅ Your weight progress (adjust calorie targets)

---

## 📝 Complete Workflow Example

### Step 1: Set Up Profile (After Registration)

```bash
POST /api/profile
```
```json
{
  "age": 25,
  "gender": "female",
  "height": 165,
  "currentWeight": 65,
  "medicalConditions": [],
  "allergies": [],
  "fitnessGoals": ["weight_loss", "endurance"],
  "targetWeight": 60,
  "activityLevel": "lightly_active",
  "dietaryRestrictions": ["vegetarian"],
  "experienceLevel": "beginner",
  "workoutFrequency": 3
}
```

### Step 2: Log Workouts
```bash
POST /api/workouts
```

### Step 3: Update Weight Weekly
```bash
PUT /api/profile/weight
{"weight": 64, "unit": "kg"}
```

### Step 4: Get AI Suggestions
```bash
GET /api/ai/workout-suggestion
```

**AI Response Will Include:**
- Beginner-friendly exercises
- Low-impact cardio (for weight loss + building endurance)
- Vegetarian meal suggestions
- Calorie deficit recommendations
- Safe progression plan

---

## 🎯 Benefits

1. **Weight Tracking**: Automatic history, never lose old data
2. **Medical Safety**: AI avoids exercises that could trigger conditions
3. **Injury Protection**: Modifications for recovering/chronic injuries
4. **Goal Alignment**: Every suggestion matches your fitness goals
5. **Dietary Compliance**: Meal plans respect your restrictions
6. **Progressive Overload**: Suggestions match your experience level
7. **Personalized Calories**: Targets adjust based on activity + goals

---

## ⚠️ Important Notes

- **Weight History**: Automatically saved when you update weight
- **Profile is Optional**: Works without profile, just less personalized
- **Privacy**: Medical data never shared, only used for AI context
- **Update Anytime**: Can partially update (just send changed fields)
- **BMI Auto-Calculated**: Based on height & weight
- **Progress Tracking**: Last 30 days compared automatically

---

## 🧪 Testing

```bash
# 1. Create profile
curl -X POST http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"age": 30, "height": 175, "currentWeight": 70, "fitnessGoals": ["muscle_gain"]}'

# 2. Update weight
curl -X PUT http://localhost:3000/api/profile/weight \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight": 71, "unit": "kg"}'

# 3. Get AI workout (now with profile context!)
curl http://localhost:3000/api/ai/workout-suggestion \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Now AI knows you're 30, 175cm, 70kg, want muscle gain → Suggests progressive resistance training!
