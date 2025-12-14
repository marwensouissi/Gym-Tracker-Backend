# AI Security Features - Quick Reference

## 🛡️ All Protections Implemented

| Risk | Protection | Implementation | Location |
|------|-----------|---------------|----------|
| **Too many tokens** | `maxOutputTokens: 1024` | Gemini generation config | `aiService.js:33` |
| **Hanging requests** | 15-second timeout wrapper | `withTimeout()` function | `aiService.js:48` |
| **Prompt injection** | Input sanitization | Removes HTML, role markers, code blocks | `aiService.js:58` |
| **Abuse/spam** | Rate limiting (10/min/user) | In-memory rate limiter | `aiRateLimiter.js` |
| **Unexpected output** | Output validation + JSON extraction | Length check, `extractJSON()` | `aiService.js:81-97` |
| **Unsafe AI output** | Gemini safety settings | Block harassment, hate, explicit, dangerous | `aiService.js:13-28` |

## ⚙️ Configuration Summary

### Safety Settings
```javascript
{
  HARASSMENT: BLOCK_MEDIUM_AND_ABOVE,
  HATE_SPEECH: BLOCK_MEDIUM_AND_ABOVE,
  SEXUALLY_EXPLICIT: BLOCK_MEDIUM_AND_ABOVE,
  DANGEROUS_CONTENT: BLOCK_MEDIUM_AND_ABOVE
}
```

### Generation Limits
```javascript
{
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024
}
```

### Rate Limits
- **Window**: 60 seconds
- **Max Requests**: 10 per user
- **Status Code**: 429 when exceeded

### Input Limits
- Max prompt: 3000 chars
- Max workout data: 1500 chars
- Max meal data: 1500 chars
- Max profile: 500 chars

## 🧪 Testing Commands

```bash
# Test rate limiting (should return 429 after 10 requests)
for i in {1..15}; do
  curl http://localhost:3000/api/ai/workout-suggestion \
    -H "Authorization: Bearer YOUR_TOKEN"
done

# Test input sanitization
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"<script>alert(1)</script>"}' # HTML stripped
```

## 📊 Error Responses

| Scenario | Response |
|----------|----------|
| No API key | "AI Service Unavailable. Please configure GEMINI_API_KEY." |
| Timeout | "AI service is currently slow. Please try again." |
| Safety filter | "Response blocked due to safety filters. Please rephrase your request." |
| Quota exceeded | "AI service quota exceeded. Please try again later." |
| Rate limited | 429 + "Too many AI requests. Please try again later." |
| Invalid input | "Invalid input provided." |

## ✅ Security Checklist

- [x] Token limits (1024)
- [x] Request timeouts (15s)
- [x] Input sanitization
- [x] Rate limiting (10/min)
- [x] Safety settings
- [x] Output validation
- [x] Retry with backoff
- [x] Graceful errors
- [x] Memory cleanup

## 📝 Files Modified

1. **aiService.js** - Enhanced with all safety features
2. **aiRateLimiter.js** - NEW rate limiting middleware
3. **aiRoutes.js** - Added rate limiter to routes
4. **AI_SECURITY.md** - Full documentation

See [AI_SECURITY.md](../docs/AI_SECURITY.md) for detailed documentation.
