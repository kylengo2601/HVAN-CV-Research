import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';
import { ImageState } from '../types';

interface ImageInputProps {
  onImageSelected: (image: ImageState) => void;
  onReset: () => void;
  currentImage: ImageState | null;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, onReset, currentImage }) => {
  const [isCameraMode, setIsCameraMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraMode(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Lỗi camera:", err);
      alert("Không thể sử dụng camera. Kiểm tra lại quyền sử dụng.");
      setIsCameraMode(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        
        onImageSelected({
          base64,
          mimeType: 'image/jpeg',
          previewUrl: dataUrl
        });
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        onImageSelected({
          base64,
          mimeType: file.type,
          previewUrl: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (currentImage) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 group">
        <img 
          src={currentImage.previewUrl} 
          alt="Selected for analysis" 
          className="w-full h-64 sm:h-96 object-contain bg-slate-900"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <button 
            onClick={onReset}
            className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Analyze Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isCameraMode ? (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button 
              onClick={stopCamera}
              className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={captureImage}
              className="p-4 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-lg ring-4 ring-white/50"
            >
              <Camera className="w-8 h-8" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="cursor-pointer flex flex-col items-center justify-center h-48 md:h-64 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <div className="p-4 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">Tải Ảnh Lên</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP</span>
          </label>

          <button 
            onClick={startCamera}
            className="flex flex-col items-center justify-center h-48 md:h-64 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all group"
          >
            <div className="p-4 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">Chụp Ảnh</span>
            <span className="text-xs text-slate-400 mt-1">Sử dụng camera của thiết bị</span>
          </button>
        </div>
      )}
    </div>
  );
};