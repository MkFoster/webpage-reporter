import { PSIData, PSIMetric, AuditDetail } from '../types';

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------
// Now using server-side proxy to protect API keys
// Server port defaults to 3001 if not specified in .env
// ---------------------------------------------------------------------------

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const fetchPageSpeedData = async (url: string): Promise<PSIData> => {
  const queryParams = new URLSearchParams({
    url: url,
    strategy: 'mobile', // Default to mobile-first analysis
  });
  
  console.log(`[PSI Service] Requesting analysis via server for: ${url}`);

  const response = await fetch(`${SERVER_URL}/api/psi?${queryParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;
    console.error('[PSI Service] API Error:', errorMessage);
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const lighthouse = data.lighthouseResult;

  if (!lighthouse) {
      throw new Error("Invalid response from PageSpeed Insights (No Lighthouse data received).");
  }

  // Extract Screenshot
  const screenshotData = lighthouse.audits['final-screenshot']?.details?.data || null;

  // Helper to safely get score (0-1) -> 0-100
  const getScore = (cat: string) => Math.round((lighthouse.categories[cat]?.score || 0) * 100);

  // Helper to extract top failing audits for a category
  const getCategoryIssues = (categoryId: string): AuditDetail[] => {
    const category = lighthouse.categories[categoryId];
    if (!category) return [];
    
    return category.auditRefs
      .filter((ref: any) => {
        // We want audits that have a weight (matter to score) and aren't perfect
        const audit = lighthouse.audits[ref.id];
        return ref.weight > 0 && audit.score !== null && audit.score < 0.9;
      })
      .map((ref: any) => {
        const audit = lighthouse.audits[ref.id];
        return {
          id: ref.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue
        };
      })
      .sort((a: any, b: any) => (a.score || 0) - (b.score || 0)) // Lowest score first
      .slice(0, 5); // Top 5 issues
  };

  // Extract Key Metrics
  const metrics: PSIMetric[] = [
    {
      id: 'lcp',
      title: 'Largest Contentful Paint',
      score: lighthouse.audits['largest-contentful-paint']?.score,
      displayValue: lighthouse.audits['largest-contentful-paint']?.displayValue,
    },
    {
      id: 'cls',
      title: 'Cumulative Layout Shift',
      score: lighthouse.audits['cumulative-layout-shift']?.score,
      displayValue: lighthouse.audits['cumulative-layout-shift']?.displayValue,
    },
    {
      id: 'inp',
      title: 'Interaction to Next Paint',
      score: lighthouse.audits['interaction-to-next-paint']?.score, // Might be experimental/undefined in some versions
      displayValue: lighthouse.audits['interaction-to-next-paint']?.displayValue,
    }
  ];

  return {
    performanceScore: getScore('performance'),
    accessibilityScore: getScore('accessibility'),
    bestPracticesScore: getScore('best-practices'),
    seoScore: getScore('seo'),
    screenshotBase64: screenshotData,
    metrics,
    rawAudits: lighthouse.audits,
    performanceIssues: getCategoryIssues('performance'),
    seoIssues: getCategoryIssues('seo'),
  };
};