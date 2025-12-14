# Gemini API Troubleshooting Guide

## Current Issue
`GenerativeAIFetchError` - API calls are failing despite valid API key

## What We've Tried
✅ Verified API key is loaded (39 characters)
✅ Updated @google/generative-ai package
✅ Tried multiple model names (gemini-pro, gemini-1.5-pro)
✅ Relaxed safety settings
❌ Still getting fetch errors

## Possible Causes

### 1. Firewall/Corporate Network
Your network might be blocking API calls to:
- `generativelanguage.googleapis.com`

**Test:** Try using a personal hotspot/different network

### 2. API Key Restrictions
The API key might have geographic or IP restrictions.

**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Check "API restrictions" and "Application restrictions"
4. Make sure it's not restricted to specific IPs

### 3. Network Proxy
If you're behind a corporate proxy, Node.js might not have proxy settings.

**Fix:** Set proxy environment variables

## Solutions

### Option A: Demo Mode (Recommended for Now)
I can add mock AI responses so you can test the complete application workflow without the external API dependency.

### Option B: Debug Network
1. Check Windows Firewall
2. Try VPN
3. Test from different network
4. Use curl to test API directly:
```cmd
curl -H "Content-Type: application/json" -d "{ \"contents\": [{ \"parts\": [{ \"text\": \"Hello\" }] }] }" "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY"
```

## Next Steps
Choose one:
1. **Add demo mode** - Test rest of app immediately
2. **Debug network** - Solve root cause  
3. **Both** - Demo mode now, fix later
