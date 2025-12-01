
import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ModelSelector } from './components/ModelSelector';
import { ModelArchitecture, AnalysisState } from './types';
import { analyzeImageWithModel } from './services/imageAnalyzer';
import { Upload, X, Camera, AlertCircle, Loader2, Aperture, Clock } from 'lucide-react';

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

  return (
    <div className="min-h-screen pb-20 font-sans selection:bg-primary/30 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Intro Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Hệ Thống <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Định Danh</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Tải lên hình ảnh hoặc sử dụng camera để nhận diện danh tính.
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
                  <Loader2 className="animate-spin w-5 h-5" /> Đang nhận diện...
                </span>
              ) : (
                "Xác Định Danh Tính"
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Kết Quả Định Danh</h2>
            
            {!analysis.result && !analysis.isLoading && !analysis.error && (
              <div className="h-[500px] border border-gray-800 rounded-xl bg-surfaceHighlight flex flex-col items-center justify-center text-gray-600">
                <div className="w-16 h-16 mb-4 rounded-full bg-black/30 flex items-center justify-center">
                  <Aperture className="w-8 h-8 opacity-50" />
                </div>
                <p>Chọn mô hình và tải ảnh để bắt đầu định danh.</p>
              </div>
            )}

            {analysis.isLoading && (
               <div className="h-[500px] border border-gray-800 rounded-xl bg-surfaceHighlight flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-4 border-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Đang xử lý hình ảnh...</h3>
                  <p className="text-gray-500 font-mono text-sm">Đang trích xuất đặc trưng và so khớp...</p>
               </div>
            )}

            {analysis.error && (
               <div className="p-6 border border-red-900/50 bg-red-900/10 rounded-xl text-red-200 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                 <div>
                   <h3 className="font-bold mb-1">Định Danh Thất Bại</h3>
                   <p className="text-sm opacity-80">{analysis.error}</p>
                 </div>
               </div>
            )}

            {analysis.result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-8 rounded-xl border border-gray-800 flex flex-col items-center text-center bg-surfaceHighlight/50">
                  
                  {/* The Input Image Displayed Again */}
                  <div className="relative w-full max-w-sm rounded-lg overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.15)] mb-8 group">
                     {previewUrl && (
                       <img 
                         src={previewUrl} 
                         alt="Identified Subject" 
                         className="w-full h-auto object-cover"
                       />
                     )}
                     
                     {/* Overlay Effect */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40"></div>
                     
                     {/* Scanning Line Animation (Optional aesthetic) */}
                     <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-20">
                       <div className="w-full h-1 bg-primary shadow-[0_0_15px_#00f2ff] animate-scan"></div>
                     </div>
                  </div>

                  {/* Identification Result */}
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em] mb-3">Kết Quả Định Danh</h3>
                  <div className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                    {analysis.result.name}
                  </div>

                  {/* Confidence Display */}
                  {analysis.result.confidence !== undefined && analysis.result.confidence > 0 && (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="text-4xl font-mono font-bold text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                        {(analysis.result.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-primary/70 uppercase tracking-widest mt-1">Độ Tin Cậy</div>
                    </div>
                  )}
                  
                  {/* Processing Time Footnote
                   {(analysis.result.processingTimeMs || 0) > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-800 w-full flex justify-center text-xs font-mono text-gray-600 gap-2">
                        <Clock className="w-3 h-3" />
                        Thời gian xử lý: {analysis.result.processingTimeMs}ms
                      </div>
                   )} */}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
