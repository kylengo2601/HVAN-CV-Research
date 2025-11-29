import React from 'react';
import { AnalysisResult, ModelArchitecture } from '../types';
import { MODEL_DESCRIPTIONS } from '../constants';
import { BrainCircuit, Check, Target, Eye, FileText, Loader2 } from 'lucide-react';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  model: ModelArchitecture;
  isLoading: boolean;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, model, isLoading }) => {
  const modelConfig = MODEL_DESCRIPTIONS[model];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${modelConfig.bgColor.replace('bg-', 'bg-opacity-20 bg-')}`}></div>
          <Loader2 className={`w-12 h-12 animate-spin ${modelConfig.color}`} />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-slate-900">Processing Image</h3>
        <p className="text-slate-500 mt-2 max-w-md">
          Running inference using <span className="font-medium text-slate-900">{model}</span> architecture...
        </p>
        <div className="mt-8 w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full animate-pulse ${modelConfig.bgColor.replace('bg-', 'bg-') === 'bg-white' ? 'bg-slate-400' : modelConfig.color.replace('text-', 'bg-')}`} style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className={`w-5 h-5 ${modelConfig.color}`} />
            <span className="font-semibold text-slate-700">Inference Results</span>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${modelConfig.bgColor} ${modelConfig.color} ${modelConfig.borderColor}`}>
            {model}
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              Predicted Class
            </h4>
            <p className="text-3xl font-bold text-slate-900 capitalize">{result.predictedClass}</p>
          </div>
          
          <div className="space-y-1">
             <h4 className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Confidence Score
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${modelConfig.color.replace('text-', 'bg-')}`} 
                  style={{ width: result.confidence.replace('%', '') + '%' }}
                ></div>
              </div>
              <span className="text-xl font-bold text-slate-900">{result.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-indigo-500" />
            Visual Features Detected
          </h4>
          <ul className="space-y-3">
            {result.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Architectural Insight */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-amber-500" />
            Architectural Analysis
          </h4>
          <p className="text-slate-700 leading-relaxed text-sm">
            {result.architecturalInsight}
          </p>
        </div>
      </div>
    </div>
  );
};