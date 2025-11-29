import { ModelArchitecture } from './types';
import { Activity, Box, Layers, Zap } from 'lucide-react';

export const MODEL_DESCRIPTIONS = {
  [ModelArchitecture.ViT]: {
    description: "Áp dụng cơ chế \"tự chú ý\" của mô hình Transformer cho từng mảng hình ảnh.",
    icon: Layers,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  [ModelArchitecture.ResNet]: {
    description: "Áp dụng kết nối \"nhảy cóc\" để gradient không quá nhỏ trong thiết kế sâu.",
    icon: Box,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  [ModelArchitecture.EfficientNet]: {
    description: "Cân bằng giữa chiều sâu, chiều rộng và độ phân giải giúp tối ưu hóa mô hình neural network.",
    icon: Zap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  }
};