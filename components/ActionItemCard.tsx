import React from 'react';
import { ActionItem } from '../types';
import { AlertCircle, CheckCircle, Zap, MousePointer, Layout, TrendingUp } from 'lucide-react';

interface ActionItemCardProps {
  item: ActionItem;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item }) => {
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'Performance': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Effectiveness': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Design': return <Layout className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{item.category}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor()}`}>
          {item.priority} Priority
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{item.description}</p>
      
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-start space-x-2">
          <MousePointer className="w-4 h-4 text-slate-400 mt-0.5" />
          <p className="text-sm text-slate-500"><span className="font-medium text-slate-700">Impact:</span> {item.impact}</p>
        </div>
      </div>
    </div>
  );
};

export default ActionItemCard;