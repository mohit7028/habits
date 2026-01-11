
import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateHabitMotivation = async (summary: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this habit tracking summary: ${summary}, give me a brief, punchy motivational insight and one specific tip to improve. Keep it under 100 words.`
  });
  return response.text;
};

export const generateVeoVideo = async (imageB64: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getGeminiClient();
  
  // Step 1: Start operation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this character celebrating a goal achievement in a vibrant cinematic style.',
    image: {
      imageBytes: imageB64.split(',')[1],
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Step 2: Poll operation
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");

  // Step 3: Fetch video bytes
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
