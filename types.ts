export interface ActionItem {
  title: string;
  description: string;
  category: 'Performance' | 'Effectiveness' | 'Design';
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
}

export interface AnalysisResult {
  effectivenessScore: number;
  effectivenessReasoning: string;
  designScore: number;
  designReasoning: string;
  summary: string;
  actionItems: ActionItem[];
}

export interface PSIMetric {
  id: string;
  title: string;
  score: number | null; // 0-1
  displayValue?: string;
}

export interface AuditDetail {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
}

export interface PSIData {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  screenshotBase64: string | null;
  metrics: PSIMetric[];
  rawAudits: Record<string, any>;
  seoIssues: AuditDetail[];
  performanceIssues: AuditDetail[];
}

export enum AnalysisStage {
  IDLE = 'IDLE',
  FETCHING_PSI = 'FETCHING_PSI',
  ANALYZING_GEMINI = 'ANALYZING_GEMINI',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface AnalysisState {
  stage: AnalysisStage;
  error?: string;
  psiData?: PSIData;
  geminiResult?: AnalysisResult;
}