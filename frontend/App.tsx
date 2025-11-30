import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ModelSelector } from './components/ModelSelector';
import { ModelArchitecture, AnalysisState } from './types';
import { analyzeImageWithModel } from './services/imageAnalyzer';
import { Upload, X, Camera, AlertCircle, Loader2, Aperture, User, Activity, Layers, Terminal, Sparkles, Fingerprint } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Helper component for result items
const ResultItem = ({label, value}: {label: string, value: string}) => (
    <div className="space-y-2">
        <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest">{label}</span>
        <div className="text-xl sm:text-2xl text-white font-light tracking-tight break-words">{value}</div>
    </div>
);

export default function App() {
  const [selectedModel, setSelectedModel] = useState<ModelArchitecture>(ModelArchitecture.VIT);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis({ isLoading: false, result: null, error: null });
      setIsCameraOpen(false);
      setCameraError(null);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysis({ isLoading: false, result: null, error: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
    setCameraError(null);
  };

  const startCamera = async () => {
    try {
      setAnalysis({ isLoading: false, result: null, error: null });
      setSelectedImage(null);
      setPreviewUrl(null);
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập của trình duyệt.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      setIsFlashing(true);
      
      // Small delay for flash effect and to ensure frame is captured
      setTimeout(() => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Flip horizontally if using front camera (matches video mirror)
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          
          ctx.drawImage(videoRef.current, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
              setSelectedImage(file);
              setPreviewUrl(URL.createObjectURL(file));
              stopCamera();
              setIsFlashing(false);
            }
          }, 'image/jpeg', 0.95);
        }
      }, 100);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;

    setAnalysis({ isLoading: true, result: null, error: null });

    try {
      const result = await analyzeImageWithModel(selectedImage, selectedModel);
      setAnalysis({ isLoading: false, result, error: null });
    } catch (err: any) {
      setAnalysis({ 
        isLoading: false, 
        result: null, 
        error: err.message || "Đã xảy ra lỗi không mong muốn trong quá trình suy luận." 
      });
    }
  };

  // Prepare data for charts if result exists
  const confidenceData = analysis.result ? [
    { name: 'Độ tin cậy', value: analysis.result.confidence * 100 },
    { name: 'Không chắc chắn', value: (1 - analysis.result.confidence) * 100 },
  ] : [];

  const embeddingData = analysis.result ? analysis.result.modelSpecifics.embeddingVector.map((val, idx) => ({
    feature: `Chiều ${idx + 1}`,
    value: Math.abs(val),
  })) : [];

  return (
    <div className="min-h-screen pb-20 font-sans selection:bg-primary/30 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Intro Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Kiểm Chuẩn Các Kiến Trúc <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Computer Vision</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Tải lên hình ảnh hoặc sử dụng camera để đánh giá hiệu suất nhận diện khuôn mặt trên ba kiến trúc hiện đại nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            <ModelSelector 
              selectedModel={selectedModel} 
              onSelect={setSelectedModel} 
              disabled={analysis.isLoading} 
            />

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Nguồn Đầu Vào</h2>
              
              {cameraError && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs flex items-center gap-2 mb-2 animate-pulse">
                   <AlertCircle className="w-4 h-4 shrink-0" />
                   {cameraError}
                 </div>
              )}

              {!previewUrl && !isCameraOpen ? (
                // Input Selection State
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col gap-4 items-center justify-center text-gray-500 bg-surfaceHighlight/30">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {/* File Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-6 rounded-lg bg-white/5 hover:bg-white/10 hover:text-primary transition-all border border-transparent hover:border-primary/30 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-sm">Tải Ảnh</span>
                    </button>

                    {/* Camera Button */}
                    <button
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center p-6 rounded-lg bg-white/5 hover:bg-white/10 hover:text-primary transition-all border border-transparent hover:border-primary/30 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 mb-3 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-sm">Dùng Camera</span>
                    </button>
                  </div>
                  <span className="text-xs opacity-60">Hỗ trợ JPEG, PNG</span>
                </div>
              ) : isCameraOpen ? (
                // Camera View
                <div className="relative rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(0,242,255,0.1)] bg-black">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="w-full h-64 object-cover transform scale-x-[-1]" 
                   />
                   
                   {/* Flash Overlay */}
                   <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-200 ${isFlashing ? 'opacity-100' : 'opacity-0'} z-50`}></div>

                   {/* Camera Overlays */}
                   <div className="absolute top-4 right-4 animate-pulse z-10">
                     <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-md">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       <span className="text-xs text-red-200 font-mono font-bold">GHI</span>
                     </div>
                   </div>

                   {/* Camera Controls */}
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6 z-20">
                      <button 
                        onClick={stopCamera}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all hover:rotate-90"
                        title="Hủy"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={capturePhoto}
                        className="p-1 rounded-full border-2 border-white transition-all hover:scale-105 active:scale-95 group"
                        title="Chụp"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-black group-active:scale-90 transition-transform"></div>
                      </button>

                       {/* Spacer to balance layout */}
                       <div className="w-9"></div>
                   </div>
                </div>
              ) : (
                // Preview View
                <div className="relative group rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-black">
                   <img src={previewUrl!} alt="Preview" className="w-full h-auto object-cover max-h-[400px]" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button 
                        onClick={() => {
                          clearImage();
                          startCamera();
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 hover:scale-110"
                        title="Chụp lại bằng Camera"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                           clearImage();
                           fileInputRef.current?.click();
                        }}
                         className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 hover:scale-110"
                         title="Đổi tệp"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={clearImage}
                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-md transition-all border border-red-500/20 hover:scale-110"
                        title="Xóa ảnh"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </div>
                   
                   {/* Scanning Effect Overlay during loading */}
                   {analysis.isLoading && (
                     <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                       <div className="w-full h-1 bg-primary/50 shadow-[0_0_15px_#00f2ff] animate-scan"></div>
                     </div>
                   )}
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={!selectedImage || analysis.isLoading}
              className={`
                w-full py-4 px-6 rounded-lg font-bold text-lg tracking-wide uppercase transition-all shadow-lg
                ${!selectedImage || analysis.isLoading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-blue-600 text-black hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {analysis.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...
                </span>
              ) : (
                "Chạy Suy Luận"
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Kết Quả Sau Xử Lý</h2>
            
            {!analysis.result && !analysis.isLoading && !analysis.error && (
              <div className="h-[500px] border border-gray-800 rounded-xl bg-surfaceHighlight flex flex-col items-center justify-center text-gray-600">
                <div className="w-16 h-16 mb-4 rounded-full bg-black/30 flex items-center justify-center">
                  <Aperture className="w-8 h-8 opacity-50" />
                </div>
                <p>Chọn mô hình và tải ảnh (hoặc chụp ảnh) để bắt đầu.</p>
              </div>
            )}

            {analysis.isLoading && (
               <div className="h-[500px] border border-gray-800 rounded-xl bg-surfaceHighlight flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-4 border-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Đang phân tích đặc trưng...</h3>
                  <p className="text-gray-500 font-mono text-sm">Đang truyền tensor qua {selectedModel}...</p>
               </div>
            )}

            {analysis.error && (
               <div className="p-6 border border-red-900/50 bg-red-900/10 rounded-xl text-red-200 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                 <div>
                   <h3 className="font-bold mb-1">Suy Luận Thất Bại</h3>
                   <p className="text-sm opacity-80">{analysis.error}</p>
                 </div>
               </div>
            )}

            {analysis.result && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Primary Result Section - The "Answer" */}
                <div className="glass-panel rounded-xl p-6 border-l-4 border-l-primary relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                      <User className="w-64 h-64 text-primary" />
                  </div>
                  
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary ring-1 ring-primary/50">
                              <Fingerprint className="w-6 h-6"/>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white">Phân Tích Chủ Thể</h3>
                              <p className="text-xs text-gray-500 font-mono">ID: {selectedModel.split(' ')[0].toUpperCase()}-{Date.now().toString().slice(-4)}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                          <ResultItem label="Giới tính" value={analysis.result.primaryFace.gender} />
                          <ResultItem label="Độ tuổi" value={analysis.result.primaryFace.ageRange} />
                          <ResultItem label="Cảm xúc" value={analysis.result.primaryFace.emotion} />
                          <ResultItem label="Sắc tộc" value={analysis.result.primaryFace.ethnicity} />
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-800/50">
                          <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phụ kiện & Đặc điểm</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {analysis.result.primaryFace.accessories.length > 0 ? (
                                  analysis.result.primaryFace.accessories.map((acc, i) => (
                                      <span key={i} className="px-3 py-1.5 rounded-full bg-surfaceHighlight border border-white/10 text-sm text-gray-300 hover:border-primary/50 transition-colors cursor-default">
                                          {acc}
                                      </span>
                                  ))
                              ) : (
                                  <span className="text-sm text-gray-600 italic pl-2">Không phát hiện phụ kiện đặc biệt</span>
                              )}
                          </div>
                      </div>
                  </div>
                </div>

                {/* 2. Metrics & Visualizations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Confidence */}
                    <div className="glass-panel p-6 rounded-xl flex flex-col min-h-[280px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-400" /> Độ Tin Cậy
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Điểm xác suất Softmax</p>
                            </div>
                            <span className="text-3xl font-mono font-bold text-primary tracking-tighter">
                                {(analysis.result.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={confidenceData} layout="vertical" margin={{left: 0, right: 30, top: 10, bottom: 10}}>
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" width={110} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                      cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                      contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff'}} 
                                    />
                                    <Bar dataKey="value" barSize={28} radius={[0, 6, 6, 0]} background={{ fill: 'rgba(255,255,255,0.05)' }}>
                                      {confidenceData.map((e, i) => <Cell key={i} fill={i===0 ? '#00f2ff' : '#4b5563'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Vector Map */}
                    <div className="glass-panel p-6 rounded-xl flex flex-col min-h-[280px]">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-400" /> Vector Đặc Trưng
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Biểu diễn Embeddings</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={embeddingData}>
                                    <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="feature" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                    <Radar name="Feature" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Tech Footer */}
                <div className="glass-panel p-4 rounded-xl border border-gray-800 bg-black/40">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="p-2.5 bg-gray-900 rounded-lg shrink-0 border border-gray-800 hidden sm:block">
                            <Terminal className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 mb-3 font-mono border-b border-gray-800 pb-2">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> ARCH: {selectedModel}</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> TIME: {analysis.result.modelSpecifics.processingTimeMs}ms</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> FACES: {analysis.result.detectedFaces}</span>
                            </div>
                            <div className="font-mono text-xs text-green-400/90 break-words whitespace-pre-wrap bg-black/50 p-3 rounded-lg border border-gray-800/50">
                                <span className="opacity-50 select-none mr-2">$</span>
                                {analysis.result.modelSpecifics.technicalLog}
                            </div>
                        </div>
                    </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}