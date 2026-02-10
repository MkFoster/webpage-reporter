import React, { useState } from 'react';
import { AnalysisStage, AnalysisState } from './types';
import { fetchPageSpeedData } from './services/psiService';
import { analyzeWithGemini } from './services/geminiService';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { Activity, AlertTriangle, Sparkles, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    stage: AnalysisStage.IDLE,
  });

  const handleAnalyze = async (url: string, goal: string) => {
    setState({ stage: AnalysisStage.FETCHING_PSI });

    try {
      // 1. Fetch PSI Data (via server)
      const psiData = await fetchPageSpeedData(url);
      
      setState({
        stage: AnalysisStage.ANALYZING_GEMINI,
        psiData,
      });

      // 2. Analyze with Gemini (via server)
      const geminiResult = await analyzeWithGemini(psiData, goal, url);

      setState({
        stage: AnalysisStage.COMPLETE,
        psiData,
        geminiResult,
      });

    } catch (error: any) {
      console.error(error);
      setState({
        stage: AnalysisStage.ERROR,
        error: error.message || "An unexpected error occurred.",
      });
    }
  };

  const renderStatus = () => {
    if (state.stage === AnalysisStage.IDLE) return null;
    if (state.stage === AnalysisStage.COMPLETE) return null;
    if (state.stage === AnalysisStage.ERROR) {
      return (
        <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm">{state.error}</p>
          </div>
          <button 
             onClick={() => setState({ stage: AnalysisStage.IDLE })} 
             className="text-sm font-semibold underline hover:text-red-800 whitespace-nowrap"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto mt-12 text-center space-y-4">
        <div className="flex justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    {state.stage === AnalysisStage.FETCHING_PSI ? (
                        <Zap className="w-6 h-6 text-indigo-600" />
                    ) : (
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    )}
                </div>
            </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          {state.stage === AnalysisStage.FETCHING_PSI ? 'Measuring Performance...' : 'AI Analysis in Progress...'}
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
           {state.stage === AnalysisStage.FETCHING_PSI 
             ? 'Connecting to PageSpeed Insights via secure server...'
             : 'Gemini is evaluating visual design, potential conversion bottlenecks, and synthesizing action items.'}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">WebPage<span className="text-indigo-600">Reporter</span></span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Powered by Gemini 2.0 & PageSpeed Insights
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero / Input Section */}
        <div className={`transition-all duration-500 ease-in-out ${state.stage === AnalysisStage.COMPLETE ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center'}`}>
           <div className="text-center mb-10 space-y-4">
             {state.stage !== AnalysisStage.COMPLETE && (
               <>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                   Optimize your web presence.
                 </h1>
                 <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                   Get a holistic audit of your website's performance, design, and conversion potential instantly.
                 </p>
               </>
             )}
           </div>

           <InputForm 
             onAnalyze={handleAnalyze} 
             isLoading={state.stage === AnalysisStage.FETCHING_PSI || state.stage === AnalysisStage.ANALYZING_GEMINI} 
           />
           
           {renderStatus()}
        </div>

        {/* Results */}
        {state.stage === AnalysisStage.COMPLETE && state.psiData && state.geminiResult && (
          <Dashboard psiData={state.psiData} geminiResult={state.geminiResult} />
        )}
      </main>
    </div>
  );
};

export default App;