import { GoogleGenAI, Type, type Chat } from "@google/genai";
import { 
    AI_COACH_SYSTEM_INSTRUCTION, 
    AI_PLANNER_RESPONSE_SCHEMA, 
    AI_PLANNER_SYSTEM_INSTRUCTION,
    COMPETITION_PREP_SYSTEM_INSTRUCTION,
    AI_NUTRITION_SYSTEM_INSTRUCTION,
    AI_NUTRITION_RESPONSE_SCHEMA,
    AI_INSIGHT_SYSTEM_INSTRUCTION
} from "../constants";
import type { ChatMessage, WorkoutPlan, RecognizedFood, NutritionPlan } from "../types";

// 每次呼叫時才建立 client，確保能抓到手機選取後的 process.env.API_KEY
const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const handleAiError = async (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error.toString();
    if (msg.includes("Requested entity was not found") || msg.includes("API_KEY_INVALID")) {
        if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
            // 在手機端 Demo 時，如果金鑰失效，主動觸發選取視窗
            await (window as any).aistudio.openSelectKey();
        }
    }
    throw error;
};

const buildGeminiHistory = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
};

export const getAiCoachResponseStream = async (history: ChatMessage[], message: string) => {
  try {
    const ai = getAiClient();
    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: buildGeminiHistory(history),
      config: {
        systemInstruction: AI_COACH_SYSTEM_INSTRUCTION,
      }
    });
    
    return await chat.sendMessageStream({ message });
  } catch (e) {
    return handleAiError(e);
  }
};

export const getAiWorkoutPlan = async (goal: string, days: number, experience: string): Promise<WorkoutPlan> => {
  try {
    const ai = getAiClient();
    const prompt = `Generate a ${days}-day workout plan for a user with the goal of '${goal}' and an experience level of '${experience}'.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: AI_PLANNER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: AI_PLANNER_RESPONSE_SCHEMA,
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    return handleAiError(e);
  }
};

export const getCompetitionPrepStream = async (history: ChatMessage[], message: string) => {
  try {
    const ai = getAiClient();
    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: buildGeminiHistory(history),
      config: {
        systemInstruction: COMPETITION_PREP_SYSTEM_INSTRUCTION,
      }
    });
    
    return await chat.sendMessageStream({ message });
  } catch (e) {
    return handleAiError(e);
  }
};

export const getAiNutritionPlan = async (goal: string, tdee: number, workoutPlan: WorkoutPlan): Promise<NutritionPlan> => {
  try {
    const ai = getAiClient();
    const prompt = `My TDEE is ${tdee} calories, my goal is '${goal}', and here is my workout plan for today: ${JSON.stringify(workoutPlan, null, 2)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: AI_NUTRITION_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: AI_NUTRITION_RESPONSE_SCHEMA,
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    return handleAiError(e);
  }
};

export const recognizeFoodInImage = async (base64Image: string): Promise<RecognizedFood[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [
                { text: `Analyze the food items in this image. Estimate the nutrition facts for each item (calories, protein, carbohydrates, and fat). Provide your answer as a JSON object containing a single key "foods", which is an array of objects.` },
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foods: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    calories: { type: Type.NUMBER },
                                    protein: { type: Type.NUMBER },
                                    carbs: { type: Type.NUMBER },
                                    fat: { type: Type.NUMBER },
                                },
                                required: ['name', 'calories', 'protein', 'carbs', 'fat'],
                            }
                        }
                    }
                }
            }
        });
        
        const parsed = JSON.parse(response.text || '{"foods": []}');
        return parsed.foods || [];
    } catch(e) {
        return handleAiError(e);
    }
};

export const getAiInsightTip = async (data: object, language: 'en' | 'zh'): Promise<string> => {
  try {
    const ai = getAiClient();
    const langText = language === 'zh' ? 'Traditional Chinese (繁體中文)' : 'English';
    const prompt = `User Data: ${JSON.stringify(data, null, 2)}. Language: ${langText}. Provide a single actionable fitness/nutrition tip.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: AI_INSIGHT_SYSTEM_INSTRUCTION,
      }
    });
    
    return response.text?.trim() || "Stay consistent and keep pushing!";
  } catch (e) {
    console.warn("Insight Tip failed:", e);
    return "AI 提示暫時無法連線，請檢查網路或金鑰。";
  }
};