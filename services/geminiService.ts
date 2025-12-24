import { GoogleGenAI, Type, type Chat } from "@google/genai";
import { 
    AI_COACH_SYSTEM_INSTRUCTION, 
    AI_PLANNER_RESPONSE_SCHEMA, 
    AI_PLANNER_SYSTEM_INSTRUCTION,
    AI_NUTRITION_SYSTEM_INSTRUCTION,
    AI_NUTRITION_RESPONSE_SCHEMA,
    AI_INSIGHT_SYSTEM_INSTRUCTION
} from "../constants";
import type { ChatMessage, WorkoutPlan, RecognizedFood, NutritionPlan } from "../types";

const CUSTOM_KEY_STORAGE_KEY = 'coremaster_custom_api_key';

/**
 * 取得當前有效的 API Key
 * 優先順序：
 * 1. 使用者手動輸入的 Local Key (LocalStorage)
 * 2. 環境變數 (Vercel Env)
 */
export const getEffectiveApiKey = () => {
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        if (localKey && localKey.trim() !== "") return localKey;
    }
    return process.env.API_KEY || "";
};

/**
 * 儲存使用者手動輸入的 API Key
 */
export const setCustomApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CUSTOM_KEY_STORAGE_KEY, key.trim());
    }
};

/**
 * 移除使用者手動輸入的 API Key
 */
export const removeCustomApiKey = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_KEY_STORAGE_KEY);
    }
};

/**
 * 統一觸發金鑰選擇對話框
 * 僅在 Google AI Studio 預覽環境中有效。
 */
export const triggerKeySetup = async () => {
    if (typeof window !== 'undefined') {
        const aiStudio = (window as any).aistudio;
        if (aiStudio?.openSelectKey) {
            await aiStudio.openSelectKey();
            return true;
        } else {
            // 如果不在 AI Studio 內（例如在 Vercel 域名下），且沒有環境變數，引導去設定頁面
             const hasLocal = !!localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
             if(!hasLocal) {
                 alert("請前往「設定 (Settings)」頁面手動輸入您的 Gemini API Key 即可開始使用。");
             }
            return false;
        }
    }
    return false;
};

/**
 * 檢查是否已具備 API 操作權限
 */
export const checkHasApiKey = async (): Promise<boolean> => {
    // 1. 檢查是否有 Local Custom Key
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        if (localKey && localKey.trim() !== "") return true;
    }

    // 2. 檢查環境變數 (Vercel 或本地開發)
    if (process.env.API_KEY && process.env.API_KEY !== "") return true;
    
    // 3. 檢查 AI Studio 橋接狀態
    if (typeof window !== 'undefined') {
        const aiStudio = (window as any).aistudio;
        if (aiStudio?.hasSelectedApiKey) {
            return await aiStudio.hasSelectedApiKey();
        }
    }
    return false;
};

/**
 * 每次呼叫都獲取新實例，確保使用最新的 API Key
 */
const getAiClient = () => {
    const apiKey = getEffectiveApiKey();
    return new GoogleGenAI({ apiKey });
};

const handleAiError = async (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error.toString().toLowerCase();
    
    // 規範：若實體找不到或未授權，重置金鑰選取狀態
    if (msg.includes("api_key_invalid") || msg.includes("requested entity was not found") || msg.includes("unauthorized")) {
        // 如果是 Local Key 錯誤，可能需要提示使用者
        if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
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