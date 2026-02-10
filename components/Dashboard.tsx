import React, { useState } from 'react';
import { AnalysisResult, PSIData } from '../types';
import ScoreGauge from './ScoreGauge';
import ActionItemCard from './ActionItemCard';
import { Smartphone, Monitor, Maximize2, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DashboardProps {
  psiData: PSIData;
  geminiResult: AnalysisResult;
}

type DetailType = 'Performance' | 'Effectiveness' | 'Visual Design' | 'SEO' | null;

const Dashboard: React.FC<DashboardProps> = ({ psiData, geminiResult }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailType>(null);

  // Helper to render details content based on selection
  const renderDetailContent = () => {
    switch (selectedDetail) {
      case 'Performance':
        return (
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">Core Metrics</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {psiData.metrics.map(m => (
                    <div key={m.id} className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-xs">{m.title}</div>
                      <div className="font-bold text-slate-800">{m.displayValue}</div>
                    </div>
                  ))}
                </div>
             </div>
             
             <h4 className="font-semibold text-slate-800 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-amber-500" />
               Top Opportunities
             </h4>
             {psiData.performanceIssues.length > 0 ? (
               <ul className="space-y-3">
                 {psiData.performanceIssues.map((issue, idx) => (
                   <li key={idx} className="text-sm bg-white p-3 rounded border border-slate-100">
                     <div className="flex justify-between items-start mb-1">
                       <span className="font-medium text-slate-800">{issue.title}</span>
                       <span className="text-xs text-red-600 font-bold">{issue.displayValue}</span>
                     </div>
                     <p className="text-slate-600 text-xs">{issue.description.replace(/\[(.*?)\]\(.*?\)/g, '$1')}</p>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-slate-500 text-sm">Great job! No critical performance issues found.</p>
             )}
          </div>
        );
      
      case 'SEO':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
               <Info className="w-4 h-4 text-blue-500" />
               SEO Audit Findings
             </h4>
             {psiData.seoIssues.length > 0 ? (
               <ul className="space-y-3">
                 {psiData.seoIssues.map((issue, idx) => (
                   <li key={idx} className="text-sm bg-white p-3 rounded border border-slate-100">
                     <div className="font-medium text-slate-800 mb-1">{issue.title}</div>
                     <p className="text-slate-600 text-xs">{issue.description.replace(/\[(.*?)\]\(.*?\)/g, '$1')}</p>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="flex flex-col items-center justify-center p-6 text-center">
                 <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                 <p className="text-slate-800 font-medium">SEO looks healthy!</p>
                 <p className="text-slate-500 text-sm">No critical issues were detected in the technical SEO audit.</p>
               </div>
             )}
          </div>
        );

      case 'Effectiveness':
        return (
          <div className="space-y-4">
             <div className="prose prose-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-100">
                <p className="whitespace-pre-wrap">{geminiResult.effectivenessReasoning || "No detailed reasoning available."}</p>
             </div>
          </div>
        );

      case 'Visual Design':
        return (
          <div className="space-y-4">
             <div className="prose prose-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-100">
                <p className="whitespace-pre-wrap">{geminiResult.designReasoning || "No detailed reasoning available."}</p>
             </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
          {/* Screenshot Preview */}
          {psiData.screenshotBase64 && (
            <div className="w-full md:w-1/3 flex-shrink-0 group relative cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
               <div className="relative aspect-[9/16] md:aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 shadow-inner bg-slate-100 transition-transform hover:scale-[1.02]">
                   {/* We display the mobile screenshot */}
                  <img 
                    src={psiData.screenshotBase64} 
                    alt="Analyzed Website" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md w-8 h-8 transition-opacity" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Smartphone size={12} /> Mobile View
                  </div>
               </div>
            </div>
          )}

          {/* Executive Summary & Scores */}
          <div className="flex-1 space-y-6 w-full">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Summary</h2>
              <p className="text-slate-600 leading-relaxed">{geminiResult.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <ScoreGauge score={psiData.performanceScore} label="Performance" onClick={() => setSelectedDetail('Performance')} />
               <ScoreGauge score={geminiResult.effectivenessScore} label="Effectiveness" onClick={() => setSelectedDetail('Effectiveness')} />
               <ScoreGauge score={geminiResult.designScore} label="Visual Design" onClick={() => setSelectedDetail('Visual Design')} />
               <ScoreGauge score={psiData.seoScore} label="SEO" onClick={() => setSelectedDetail('SEO')} />
            </div>
          </div>
        </div>
      </section>

      {/* Action Items Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Action Plan</h2>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {geminiResult.actionItems.length} Recommendations
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* High Priority First */}
           {geminiResult.actionItems
             .sort((a, b) => {
               const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
               return priorityMap[b.priority] - priorityMap[a.priority];
             })
             .map((item, idx) => (
              <ActionItemCard key={idx} item={item} />
           ))}
        </div>
      </section>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && psiData.screenshotBase64 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer" onClick={() => setIsImageModalOpen(false)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full overflow-hidden rounded-lg bg-slate-100" onClick={(e) => e.stopPropagation()}>
                 <div className="overflow-auto max-h-[90vh]">
                     <img src={psiData.screenshotBase64} alt="Full Screenshot" className="w-full h-auto" />
                 </div>
                 <button 
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors" 
                  onClick={() => setIsImageModalOpen(false)}
                >
                    <X size={20} />
                 </button>
            </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer" onClick={() => setSelectedDetail(null)}>
            <div 
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in transform transition-all" 
              onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="text-xl font-bold text-slate-900">{selectedDetail} Analysis</h3>
                   <button 
                     onClick={() => setSelectedDetail(null)}
                     className="text-slate-400 hover:text-slate-600 transition-colors"
                   >
                     <X size={20} />
                   </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   {renderDetailContent()}
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
                   <button 
                    onClick={() => setSelectedDetail(null)}
                    className="text-indigo-600 font-medium text-sm hover:underline"
                   >
                     Close
                   </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;