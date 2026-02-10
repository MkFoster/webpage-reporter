import React, { useState } from 'react';
import { Search, Target, ArrowRight } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (url: string, goal: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !isLoading) {
      let finalUrl = url.trim();
      // Auto-prepend https:// if missing
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      onAnalyze(finalUrl, goal);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 md:p-3 flex flex-col md:flex-row gap-2">
        
        {/* URL Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            required
            className="block w-full pl-10 pr-3 py-3 md:py-4 border-none rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-900"
            placeholder="Enter website URL (e.g. example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Goal Input */}
        <div className="flex-1 md:flex-[0.8] relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Target className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 md:py-4 border-none rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-900"
            placeholder="Goal (Optional, e.g. Sell Shoes)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl px-8 py-3 md:py-4 flex items-center justify-center transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Analyzing</span>
            </span>
          ) : (
             <span className="flex items-center gap-2">
              Analyze <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;