import React from 'react';
import { Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-16 border-b border-gray-800 bg-black/50 backdrop-blur-md flex items-center px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Layers className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          NeuroFace <span className="text-primary">ID</span>
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-mono hidden md:block">
          Trạng thái: Trực tuyến
        </span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
    </nav>
  );
};