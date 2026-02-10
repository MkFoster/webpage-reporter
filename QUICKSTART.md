# Quick Start Guide

## What Changed

The app has been refactored to use a **client-server architecture** to protect your API keys. Previously, all API calls were made directly from the browser, exposing your keys. Now:

- ✅ API keys are stored server-side in `.env`
- ✅ Client makes requests to the Express server
- ✅ Server proxies requests to PageSpeed Insights and Gemini
- ✅ Keys are never exposed in the browser

## Running the App

### Option 1: Run Everything at Once (Recommended)
```bash
npm run dev:all
```
This starts both the server (port 3001) and the client (port 5173) in one command.

### Option 2: Run Separately
```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start the client  
npm run dev
```

## Verify It's Working

1. **Server**: Should show this message when started:
   ```
   🚀 WebPage Reporter Server running at http://localhost:3001
   📊 PageSpeed Insights: http://localhost:3001/api/psi?url=...
   🤖 Gemini Analysis: http://localhost:3001/api/analyze
   ```

2. **Client**: Open browser to `http://localhost:5173`

3. **Test**: Enter a URL like `https://example.com` and click Analyze

## Architecture Flow

```
User Browser (port 5173)
    ↓
    | HTTP Request
    ↓
Express Server (port 3001)
    ↓
    ├─→ /api/psi → PageSpeed Insights API (with PSI_API_KEY)
    └─→ /api/analyze → Gemini API (with API_KEY)
```

## Files Changed

### Server-Side
- [server.ts](server.ts) - Added `/api/analyze` endpoint for Gemini analysis

### Client-Side
- [services/psiService.ts](services/psiService.ts) - Now calls `http://localhost:3001/api/psi`
- [services/geminiService.ts](services/geminiService.ts) - Now calls `http://localhost:3001/api/analyze`
- [App.tsx](App.tsx) - Removed client-side environment checks

### Configuration
- [package.json](package.json) - Added scripts and dependencies
- [.env](.env) - Your API keys (already configured)
- [.env.example](.env.example) - Template for others

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify `.env` file exists with valid API keys

### Client can't connect to server
- Make sure the server is running on port 3001
- Check browser console for CORS errors

### API errors
- Verify your API keys are correct in `.env`
- Check server logs for detailed error messages
