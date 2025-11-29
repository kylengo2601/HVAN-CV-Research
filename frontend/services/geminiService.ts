import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ModelArchitecture } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  modelArch: ModelArchitecture
): Promise<AnalysisResult> => {
  
  const prompt = `
    Act as a computer vision research system powered by the ${modelArch} architecture.
    Analyze the provided image.
    
    Return a JSON response with the following fields:
    1. predictedClass: The single most likely object class label.
    2. confidence: A simulated confidence score (e.g., "99.2%") typical for ${modelArch}.
    3. features: An array of 3-5 key visual features detected.
    4. architecturalInsight: A brief specific comment on how the ${modelArch} architecture (e.g., attention maps for ViT, residual blocks for ResNet, compound scaling for EfficientNet) would process this specific image features.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedClass: { type: Type.STRING },
            confidence: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            architecturalInsight: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const json = JSON.parse(text);

    return {
      predictedClass: json.predictedClass || "Unknown",
      confidence: json.confidence || "0%",
      features: json.features || [],
      architecturalInsight: json.architecturalInsight || "Analysis completed.",
      rawAnalysis: text
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};