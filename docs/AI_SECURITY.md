# AI Service Security & Safety Features

## 🛡️ Security Protections Implemented

### 1. **Too Many Tokens Protection**
- **Solution**: `maxOutputTokens: 1024` in generation config
- **Impact**: Limits response size to prevent excessive costs
- **Location**: `aiService.js` - generationConfig

### 2. **Hanging Requests Protection**
- **Solution**: `withTimeout()` wrapper (15 second timeout)
- **Impact**: Prevents indefinite waiting on AI responses
- **Location**: `aiService.js` - withTimeout function
- **Behavior**: Returns user-friendly error after timeout

### 3. **Prompt Injection Protection**
- **Solution**: `sanitizeInput()` function
- **Features**:
  - Removes HTML tags (`<>`)
  - Strips role markers (`system:`, `user:`, `assistant:`)
  - Removes code blocks (```)
  - Enforces max length (2000 chars default)
- **Location**: `aiService.js` - sanitizeInput function

### 4. **Abuse/Spam Protection**
- **Solution**: Rate limiting middleware
- **Limits**: 10 requests per minute per user
- **Location**: `middleware/aiRateLimiter.js`
- **Response**: 429 status with `retryAfter` timestamp
- **Storage**: In-memory (use Redis in production for distributed systems)

### 5. **Unexpected Output Validation**
- **Solution**: Multiple layers
  - Output length validation (minimum 10 chars)
  - `extractJSON()` helper for structured responses
  - Graceful fallback messages
- **Location**: `aiService.js` - robustCall function

### 6. **Unsafe AI Output Protection**
- **Solution**: Gemini Safety Settings
- **Categories Protected**:
  - Harassment (BLOCK_MEDIUM_AND_ABOVE)
  - Hate Speech (BLOCK_MEDIUM_AND_ABOVE)
  - Sexually Explicit (BLOCK_MEDIUM_AND_ABOVE)
  - Dangerous Content (BLOCK_MEDIUM_AND_ABOVE)
- **Location**: `aiService.js` - safetySettings
- **Behavior**: Returns safety filter message if blocked

---

## 📊 Configuration Parameters

### Gemini Model Configuration
```javascript
{
  temperature: 0.7,      // Creativity vs consistency
  topP: 0.8,            // Nucleus sampling
  topK: 40,             // Token selection diversity
  maxOutputTokens: 1024 // Max response length
}
```

### Rate Limiting
```javascript
{
  windowMs: 60000,      // 1 minute window
  maxRequests: 10,      // Max 10 requests per window
  message: 'Custom error message'
}
```

### Input Sanitization
```javascript
{
  maxLength: 2000,      // Max input length for prompts
  workoutData: 1500,    // Max for workout data
  mealData: 1500,       // Max for meal data
  profileData: 500      // Max for user profile
}
```

---

## 🔄 Error Handling Flow

```
Request → Rate Limiter → Auth → Controller → AI Service
                ↓           ↓         ↓           ↓
             429 Error   401 Error  Validation  Retry Logic
                                                    ↓
                                              Safety Check
                                                    ↓
                                              Timeout Check
                                                    ↓
                                            Response/Fallback
```

---

## 🧪 Testing Safety Features

### Test Rate Limiting
```bash
# Make 15 rapid requests
for i in {1..15}; do
  curl http://localhost:3000/api/ai/workout-suggestion \
    -H "Authorization: Bearer TOKEN"
done

# Expected: First 10 succeed, next 5 return 429
```

### Test Input Sanitization
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type":"<script>alert(1)</script>"}' # Should be sanitized
```

### Test Timeout
```bash
# Simulate slow network or overwhelmed API
# Expected: Returns timeout error after 15 seconds
```

### Test Safety Filters
```bash
# Try requesting unsafe content
# Expected: "Response blocked due to safety filters"
```

---

## 🚀 Production Recommendations

### 1. Distributed Rate Limiting
Replace in-memory store with Redis:
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### 2. Monitoring & Alerts
- Track rate limit hits
- Monitor average response times
- Alert on high timeout rates
- Log safety filter blocks

### 3. API Key Rotation
- Use key rotation strategy
- Monitor quota usage
- Set up billing alerts

### 4. Advanced Input Validation
- Consider using libraries like `validator.js`
- Implement content moderation for user inputs
- Add profanity filters if needed

### 5. Response Caching
- Cache common AI responses
- Reduce API costs
- Improve response times

---

## 📝 Error Messages

| Error | Status | Message |
|-------|--------|---------|
| No API Key | 200 | "AI Service Unavailable. Please configure GEMINI_API_KEY." |
| Rate Limited | 429 | "Too many AI requests. Please try again later." |
| Timeout | 200 | "AI service is currently slow. Please try again." |
| Safety Filter | 200 | "Response blocked due to safety filters. Please rephrase your request." |
| Quota Exceeded | 200 | "AI service quota exceeded. Please try again later." |
| Invalid Input | 200 | "Invalid input provided." |

**Note**: All AI errors return 200 with descriptive messages to maintain API consistency. Rate limiting uses 429 status.

---

## 🔒 Security Checklist

- [x] Token limits enforced
- [x] Request timeouts implemented
- [x] Input sanitization active
- [x] Rate limiting enabled
- [x] Safety settings configured
- [x] Output validation in place
- [x] Retry logic with backoff
- [x] Graceful error handling
- [x] User-friendly error messages
- [x] Memory leak prevention (cleanup)

---

## 📚 References

- [Gemini Safety Settings](https://ai.google.dev/gemini-api/docs/safety-settings)
- [Rate Limiting Best Practices](https://www.rfc-editor.org/rfc/rfc6585#section-4)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
