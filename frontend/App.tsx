import React, { useState, useEffect } from 'react';
import { ModelArchitecture, ImageState, AnalysisResult } from './types';
import { analyzeImageWithGemini } from './services/geminiService';
import { ModelCard } from './components/ModelCard';
import { ImageInput } from './components/ImageInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Microscope, ChevronRight, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelArchitecture | null>(null);
  const [image, setImage] = useState<ImageState | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModelSelect = (model: ModelArchitecture) => {
    setSelectedModel(model);
    // If we have an image and change the model, we should reset results but keep image
    if (image) {
      setResult(null);
      setError(null);
    }
  };

  const handleImageSelected = (newImage: ImageState) => {
    setImage(newImage);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!image || !selectedModel) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeImageWithGemini(image.base64, image.mimeType, selectedModel);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically run analysis when both model and image are present and no result exists
  useEffect(() => {
    if (image && selectedModel && !result && !isLoading && !error) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, selectedModel]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ComputerVision <span className="text-slate-400 font-normal">Research</span></h1>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            v1.0.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Step 1: Model Selection */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm">1</div>
            <h2 className="text-xl font-semibold text-slate-800">Chọn Mô Hình</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(ModelArchitecture).map((model) => (
              <ModelCard
                key={model}
                model={model}
                isSelected={selectedModel === model}
                onSelect={handleModelSelect}
              />
            ))}
          </div>
        </section>

        {/* Step 2: Image Input */}
        <section className={`space-y-6 transition-opacity duration-500 ${selectedModel ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${selectedModel ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <h2 className="text-xl font-semibold text-slate-800">Dữ Liệu Vào</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
             <ImageInput 
               onImageSelected={handleImageSelected} 
               onReset={handleReset}
               currentImage={image}
             />
          </div>
        </section>

        {/* Step 3: Results */}
        {(image || isLoading) && (
          <section className="space-y-6">
             <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                {isLoading ? <Microscope className="w-4 h-4 animate-pulse" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Analysis Report</h2>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4 text-red-700">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Analysis Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                  <button onClick={runAnalysis} className="mt-3 text-sm font-semibold underline hover:text-red-800">Try Again</button>
                </div>
              </div>
            ) : (
              <AnalysisDisplay 
                result={result} 
                model={selectedModel || ModelArchitecture.ViT} 
                isLoading={isLoading} 
              />
            )}
          </section>
        )}

      </main>
    </div>
  );
};

export default App;