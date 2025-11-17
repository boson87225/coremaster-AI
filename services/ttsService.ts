import { GoogleGenAI, Modality } from "@google/genai";

// Always create a new client to pick up the latest API key from the environment.
// This is crucial for the "Set API Key" functionality to work correctly.
const getAiClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set for Gemini API.");
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable to use AI features.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
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