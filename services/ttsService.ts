
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set for Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Converts text to speech using the Gemini API.
 * @param text The text to convert to speech.
 * @returns A base64 encoded string of the audio data.
 */
export const textToSpeech = async (text: string): Promise<string | null> => {
  if (!text) return null;
  try {
    const response = await ai.models.generateContent({
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