import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3001;

// Validate required environment variables at startup
const validateEnvironment = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const psiKey = process.env.PSI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: API_KEY (Gemini) is not set in .env file');
    console.error('   Get it from: https://aistudio.google.com/app/apikey');
    process.exit(1);
  }
  
  if (!psiKey) {
    console.warn('⚠️  WARNING: PSI_API_KEY not set. Will attempt to use API_KEY instead.');
    console.warn('   For better performance, set PSI_API_KEY from Google Cloud Console.');
  }
};

validateEnvironment();

// Enable CORS so the frontend (usually on port 3000 or 5173) can call this server
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Enable JSON body parsing with increased limit for large API responses

app.get('/api/psi', async (req, res) => {
  const { url, strategy } = req.query;

  if (!url) {
    return res.status(400).json({ error: { message: 'URL parameter is required' } });
  }

  // Get the key from the server's environment variables
  const apiKey = process.env.PSI_API_KEY || process.env.API_KEY;

  console.log(`[PSI] Using API Key: ${apiKey}`);

  if (!apiKey) {
    console.error('Server missing API Key');
    return res.status(500).json({ error: { message: 'Server configuration error: API Key missing' } });
  }

  try {
    // Construct the Google PSI URL
    const psiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    psiUrl.searchParams.append('url', url as string);
    psiUrl.searchParams.append('strategy', (strategy as string) || 'mobile');
    psiUrl.searchParams.append('key', apiKey.trim());
    
    // Add categories
    const categories = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
    categories.forEach(cat => psiUrl.searchParams.append('category', cat));

    console.log(`[PSI] 📊 Requesting PageSpeed Insights for: ${url}`);
    console.log(`[PSI] ⏳ Calling Google PSI API...`);

    const response = await fetch(psiUrl.toString());
    console.log(`[PSI] ✅ Response received (status: ${response.status})`);
    const data = await response.json();
    console.log(`[PSI] ✅ Data parsed successfully`);

    // Forward the status code from Google (e.g., 200, 400, 500)
    res.status(response.status).json(data);

  } catch (error: any) {
    console.error('[Server] Proxy Error:', error);
    res.status(500).json({ error: { message: 'Internal Server Error while contacting Google PSI' } });
  }
});

// ---------------------------------------------------------------------------
// GEMINI ANALYSIS ENDPOINT
// ---------------------------------------------------------------------------
app.post('/api/analyze', async (req, res) => {
  const { psiData, userGoal, url } = req.body;

  if (!psiData || !url) {
    return res.status(400).json({ error: { message: 'psiData and url are required' } });
  }

  // Get the Gemini API key from environment
  const apiKey = process.env.API_KEY ? process.env.API_KEY.trim() : "";
  
  console.log(`[Gemini] Using API Key: ${apiKey}`);
  
  if (!apiKey) {
    console.error('Server missing Gemini API Key');
    return res.status(500).json({ error: { message: 'Server configuration error: Gemini API Key missing' } });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // ---------------------------------------------------------------------------
    // IMAGE PROCESSING FOR GEMINI
    // ---------------------------------------------------------------------------
    // PageSpeed Insights returns the screenshot as a Data URI (e.g., "data:image/jpeg;base64,...").
    // Gemini's `inlineData` expects *raw* base64 data without the prefix.
    const cleanBase64 = psiData.screenshotBase64 
      ? psiData.screenshotBase64.replace(/^data:image\/\w+;base64,/, "") 
      : null;

    const parts: any[] = [];

    // If a screenshot exists, add it as the first part of the content.
    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const promptText = `
      You are an expert web conversion rate optimization (CRO) specialist and UI/UX designer.
      
      I will provide data for the website: ${url}
      
      The user has a specific goal for this website: "${userGoal || 'General Improvement'}".
      
      Here is the summary of the PageSpeed Insights performance data:
      - Performance Score: ${psiData.performanceScore}/100
      - Accessibility Score: ${psiData.accessibilityScore}/100
      - Best Practices Score: ${psiData.bestPracticesScore}/100
      - SEO Score: ${psiData.seoScore}/100
      
      Key Metrics:
      ${psiData.metrics.map((m: any) => `- ${m.title}: ${m.displayValue}`).join('\n')}

      Your task:
      1. Analyze the visual design of the website based on the provided screenshot. Provide a specific design score and a paragraph explaining your reasoning.
      2. Evaluate the potential effectiveness (conversions) based on the goal. Provide a specific effectiveness score and a paragraph explaining your reasoning.
      3. Synthesize this with the performance data. Ensure your design recommendations do not negatively impact performance (e.g., don't suggest massive hero videos if LCP is already poor, unless optimized).
      4. Provide a holistic list of action items.
      
      Return a structured JSON object.
    `;

    // Add the text prompt as the next part
    parts.push({ text: promptText });

    console.log(`[Gemini] 🤖 Starting AI analysis for: ${url}`);
    console.log(`[Gemini] ⏳ Calling Gemini API (model: gemini-3-pro-preview)...`);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            effectivenessScore: { type: Type.NUMBER, description: "Score from 0-100 based on CRO best practices." },
            effectivenessReasoning: { type: Type.STRING, description: "A detailed paragraph explaining WHY this effectiveness score was given, citing specific positive and negative observations." },
            designScore: { type: Type.NUMBER, description: "Score from 0-100 based on UI/UX best practices." },
            designReasoning: { type: Type.STRING, description: "A detailed paragraph explaining WHY this design score was given, citing specific positive and negative observations." },
            summary: { type: Type.STRING, description: "A 2-3 sentence executive summary of the findings." },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Performance", "Effectiveness", "Design"] },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  impact: { type: Type.STRING, description: "Why this matters (e.g. 'Improves LCP by reducing load')." },
                },
                required: ["title", "description", "category", "priority", "impact"],
              },
            },
          },
          required: ["effectivenessScore", "effectivenessReasoning", "designScore", "designReasoning", "summary", "actionItems"],
        },
      },
    });

    console.log(`[Gemini] ✅ Response received from Gemini API`);
    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: { message: 'No response from Gemini' } });
    }

    try {
      const analysisResult = JSON.parse(text);
      console.log(`[Gemini] ✅ Analysis complete - sending results to client`);
      res.json(analysisResult);
    } catch (e) {
      console.error('[Server] Failed to parse Gemini response:', e);
      res.status(500).json({ error: { message: 'Failed to parse Gemini response' } });
    }

  } catch (error: any) {
    console.error('[Server] Gemini Analysis Error:', error);
    res.status(500).json({ error: { message: error.message || 'Internal Server Error during Gemini analysis' } });
  }
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ WebPage Reporter Server running at http://localhost:${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   • PageSpeed Insights: GET  http://localhost:${PORT}/api/psi?url=...`);
  console.log(`   • Gemini Analysis:    POST http://localhost:${PORT}/api/analyze`);
  console.log(`\n🔑 Environment Configuration:`);
  console.log(`   • Gemini API Key: ${process.env.API_KEY || process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ MISSING'}`);
  console.log(`   • PSI API Key:    ${process.env.PSI_API_KEY ? '✓ Configured' : '⚠ Using Gemini Key'}`);
  console.log(`   • Server Port:    ${PORT}`);
  console.log(`${'='.repeat(70)}\n`);
});