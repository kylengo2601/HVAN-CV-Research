import React from 'react';
import { ModelArchitecture } from '../types';
import { Cpu, Grid, Zap } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: ModelArchitecture;
  onSelect: (model: ModelArchitecture) => void;
  disabled: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, disabled }) => {
  const models = [
    {
      id: ModelArchitecture.VIT,
      name: 'Vision Transformer',
      desc: 'Bối cảnh toàn cục thông qua cơ chế self-attention.',
      icon: <Grid className="w-5 h-5" />,
      color: 'border-blue-500',
      bg: 'hover:bg-blue-900/20'
    },
    {
      id: ModelArchitecture.RESNET,
      name: 'ResNet-152',
      desc: 'Học dư sâu (Deep residual) với các kết nối tắt.',
      icon: <LayersIcon className="w-5 h-5" />,
      color: 'border-red-500',
      bg: 'hover:bg-red-900/20'
    },
    {
      id: ModelArchitecture.EFFICIENTNET,
      name: 'EfficientNet-B7',
      desc: 'Tỷ lệ hỗn hợp (Compound scaling) để đạt hiệu quả tối ưu.',
      icon: <Zap className="w-5 h-5" />,
      color: 'border-green-500',
      bg: 'hover:bg-green-900/20'
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Chọn Kiến Trúc</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border transition-all duration-300 text-left group flex flex-col h-full
              ${selectedModel === m.id ? `${m.color} bg-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'border-gray-800 bg-surfaceHighlight hover:border-gray-600'}
              ${m.bg}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`
              absolute top-4 right-4 w-3 h-3 rounded-full transition-colors
              ${selectedModel === m.id ? 'bg-primary shadow-[0_0_8px_#00f2ff]' : 'bg-gray-700'}
            `}></div>
            
            <div className={`mb-3 ${selectedModel === m.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
              {m.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-1 break-words">{m.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed break-words">{m.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper icon component
const LayersIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);