<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WebPage Reporter

A comprehensive web page analysis tool that evaluates websites across three key dimensions:
1. **Performance** - Using Google PageSpeed Insights API
2. **Effectiveness** - Conversion potential and user experience
3. **Visual Design** - UI/UX best practices

The app uses Gemini AI to provide holistic analysis with actionable recommendations that balance performance, effectiveness, and design considerations.

View your app in AI Studio: https://ai.studio/apps/drive/1x9WQxaFdm1B_Ks9mZQiihN2uT5tbBvtV

## Architecture

This app uses a **client-server architecture** to protect API keys:
- **Client (React + Vite)**: User interface running on port 5173 (default)
- **Server (Express)**: API proxy running on port 3001 (default)
  - `/api/psi` - PageSpeed Insights proxy endpoint
  - `/api/analyze` - Gemini analysis endpoint

API keys are stored server-side in `.env` and never exposed to the client.

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API keys in `.env`:
   ```env
   # Google Gemini API Key (Required for AI Analysis)
   API_KEY=your_gemini_api_key_here

   # PageSpeed Insights API Key (Optional but recommended)
   PSI_API_KEY=your_psi_api_key_here
   ```

3. Run both the server and client:
   ```bash
   npm run dev:all
   ```
   
   Or run them separately in different terminals:
   ```bash
   # Terminal 1: Start the server
   npm run server
   
   # Terminal 2: Start the client
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Getting API Keys

### Gemini API Key (Required)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Copy the key and add it to `.env` as `API_KEY`

### PageSpeed Insights API Key (Optional but recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "PageSpeed Insights API"
3. Create credentials and copy the API key
4. Add it to `.env` as `PSI_API_KEY`

Note: If `PSI_API_KEY` is not provided, the server will attempt to use the `API_KEY` for PageSpeed Insights as well.

## How It Works

1. User enters a URL and optional website goal
2. Client sends request to server's `/api/psi` endpoint
3. Server fetches PageSpeed Insights data using the API key
4. Client displays performance metrics and progress
5. Client sends PSI data to server's `/api/analyze` endpoint
6. Server uses Gemini AI to analyze screenshot and metrics
7. Gemini provides holistic recommendations balancing performance, effectiveness, and design
8. Client displays comprehensive dashboard with scores and action items
