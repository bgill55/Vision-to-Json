import { GoogleGenAI } from "@google/genai";
import { VISION_SYSTEM_INSTRUCTION } from "../constants";

export const analyzeImageToJSON = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Perform full visual serialization.",
          },
        ],
      },
      config: {
        systemInstruction: VISION_SYSTEM_INSTRUCTION,
        // We do not strictly enforce responseMimeType: "application/json" here 
        // because the prompt is highly optimized for it, and sometimes strictly 
        // forcing schema on very complex open-ended vision tasks can reduce detail.
        // However, given the prompt's strictness, the model usually complies.
        // If we wanted to be 100% sure of valid JSON at the cost of potential 
        // token flexibility, we would add: responseMimeType: "application/json"
      },
    });

    const text = response.text || "";
    
    // Clean up potential markdown code blocks if the model adds them despite instructions
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return cleanedText;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};