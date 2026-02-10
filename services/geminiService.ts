import { AnalysisResult, PSIData } from "../types";

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------
// Now using server-side endpoint to protect API keys
// Server port defaults to 3001 if not specified in .env
// ---------------------------------------------------------------------------

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const analyzeWithGemini = async (
  psiData: PSIData,
  userGoal: string,
  url: string
): Promise<AnalysisResult> => {
  console.log(`[Gemini Service] Requesting analysis via server for: ${url}`);
  
  const response = await fetch(`${SERVER_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      psiData,
      userGoal,
      url,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;
    console.error('[Gemini Service] API Error:', errorMessage);
    throw new Error(errorMessage);
  }

  const analysisResult = await response.json();
  return analysisResult as AnalysisResult;
};