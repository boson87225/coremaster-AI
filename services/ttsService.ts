import { GoogleGenAI, Modality } from "@google/genai";

// Lazy initialization to prevent app crash if API key is missing.
let ai: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set for Gemini API.");
      throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable to use AI features.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


/**
 * Converts text to speech using the Gemini API.
 * @param text The text to convert to speech.
 * @returns A base64 encoded string of the audio data.
 */
export const textToSpeech = async (text: string): Promise<string | null> => {
  if (!text) return null;
  try {
    const client = getAiClient(); // Use the lazy-initialized client
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `請用充滿活力的語氣說: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Other available voices: Puck, Charon, Kore, Fenrir, Zephyr
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Text-to-speech service error:", error);
    return null;
  }
};