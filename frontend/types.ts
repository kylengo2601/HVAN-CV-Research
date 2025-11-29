export enum ModelArchitecture {
  ViT = 'Vision Transformer (ViT-H/14)',
  ResNet = 'ResNet-152',
  EfficientNet = 'EfficientNet-B7'
}

export interface AnalysisResult {
  predictedClass: string;
  confidence: string;
  features: string[];
  architecturalInsight: string;
  rawAnalysis: string;
}

export interface ImageState {
  base64: string;
  mimeType: string;
  previewUrl: string;
}