import { GoogleGenAI } from "@google/genai";

// Ensure API key is present, safely checking for process existence
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';

const ai = new GoogleGenAI({ apiKey });

export const generateMuseThought = async (topic: string): Promise<string> => {
  if (!apiKey) {
    return "Please configure your API Key to hear the muse's whispers.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a digital muse for a creative developer named "Eververdants". 
      The user has given you a topic: "${topic}".
      
      Generate a short, poetic, and inspiring thought (max 50 words) that connects this topic to nature, growth, coding, or creativity. 
      The tone should be ethereal, encouraging, and wise. 
      Do not use markdown formatting. Just plain text.`,
    });

    return response.text || "The muse is silent at the moment. Try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The wind is too strong to hear the muse right now. (API Error)";
  }
};