import React from 'react';
import { ModelArchitecture } from '../types';
import { MODEL_DESCRIPTIONS } from '../constants';
import { CheckCircle2 } from 'lucide-react';

interface ModelCardProps {
  model: ModelArchitecture;
  isSelected: boolean;
  onSelect: (model: ModelArchitecture) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, onSelect }) => {
  const config = MODEL_DESCRIPTIONS[model];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onSelect(model)}
      className={`relative flex flex-col p-6 rounded-xl border-2 transition-all duration-300 text-left h-full
        ${isSelected 
          ? `${config.borderColor} ${config.bgColor} shadow-md ring-1 ring-offset-2 ring-${config.color.split('-')[1]}-400` 
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center justify-between mb-4 w-full">
        <div className={`p-3 rounded-lg ${isSelected ? 'bg-white' : 'bg-slate-100'}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        {isSelected && (
          <CheckCircle2 className={`w-6 h-6 ${config.color}`} />
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2">{model}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        {config.description}
      </p>
    </button>
  );
};