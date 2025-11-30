import { ModelArchitecture, AnalysisResult } from "../types";

export const analyzeImageWithModel = async (
  file: File,
  modelArch: ModelArchitecture
): Promise<AnalysisResult> => {
  
  // Create FormData to send the file and data to the backend
  const formData = JSON.stringify({ 
    image: file, 
    modelArch: modelArch 
  });

  try {
    // Call the local Node.js backend
    // Updated port to 3000 to match server.js
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Let browser set it including boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Lỗi máy chủ: ${response.status}`);
    }

    const data = await response.json();
    return data as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    throw new Error(error.message || "Không thể kết nối tới máy chủ phân tích cục bộ.");
  }
};