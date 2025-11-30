export enum ModelArchitecture {
  VIT = 'Vision Transformer (ViT-H/14)',
  RESNET = 'ResNet-152',
  EFFICIENTNET = 'EfficientNet-B7',
}

export interface AnalysisResult {
  name: string;
  // modelSpecifics: {
  //   processingTimeMs: number;
  //   embeddingVector: number[];
  //   technicalLog: string;
  //   architectureNotes: string;
  // };
  confidence: number;
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
