
import { GoogleGenAI, Type } from "@google/genai";
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
 */
export const getEffectiveApiKey = () => {
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
        if (localKey && localKey.trim() !== "") return localKey.trim();
    }
    return process.env.API_KEY || "";
};

export const setCustomApiKey = (key: string) => {
    if (typeof window !== 'undefined' && key.startsWith("AIza")) {
        localStorage.setItem(CUSTOM_KEY_STORAGE_KEY, key.trim());
    }
};

export const removeCustomApiKey = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_KEY_STORAGE_KEY);
    }
};

/**
 * 檢查金鑰是否有效 (僅格式檢查)
 */
export const checkHasApiKey = async (): Promise<boolean> => {
    const key = getEffectiveApiKey();
    return key.length > 20 && key.startsWith("AIza");
};

/**
 * 每次呼叫 API 前動態初始化
 */
const getAiClient = () => {
    const apiKey = getEffectiveApiKey();
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * 錯誤處理攔截器
 */
const handleAiError = async (error: any) => {
    const msg = error.toString().toLowerCase();
    
    if (msg.includes("403") || msg.includes("401") || msg.includes("api_key_invalid")) {
        window.dispatchEvent(new CustomEvent('coremaster-api-revoked', { 
            detail: { message: "你的 API 金鑰可能已被 Google 撤銷或限制。請前往設定更換金鑰。" } 
        }));
    }
    throw error;
};

// Convert history to format expected by generateContent
const buildHistoryContents = (history: ChatMessage[], message: string) => {
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });
  return contents;
};

/**
 * 觸發 API Key 設定對話框 (支援 AI Studio 環境)
 */
export const triggerKeySetup = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
    } else {
        window.dispatchEvent(new CustomEvent('coremaster-request-settings'));
    }
};

export const getAiCoachResponseStream = async (history: ChatMessage[], message: string) => {
  try {
    const ai = getAiClient();
    // Use generateContentStream for text tasks with context history
    return await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: buildHistoryContents(history, message),
      config: { 
        systemInstruction: AI_COACH_SYSTEM_INSTRUCTION,
        temperature: 0.8
      }
    });
  } catch (e) {
    return handleAiError(e);
  }
};

export const getAiWorkoutPlan = async (goal: string, days: number, experience: string): Promise<WorkoutPlan> => {
  try {
    const ai = getAiClient();
    const prompt = `Generate a ${days}-day workout plan for goal '${goal}' and experience '${experience}'. 
    IMPORTANT: Use Traditional Chinese.`;
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
        const prompt = `使用者 TDEE: ${tdee}. 目標: ${goal}. 訓練計畫: ${JSON.stringify(workoutPlan)}. 請產生一份一日三餐營養建議計畫。`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
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
                { text: `Analyze food nutrition. JSON output. Traditional Chinese.` },
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
    const prompt = `Data: ${JSON.stringify(data)}. Tip in ${language === 'zh' ? '繁體中文' : 'English'}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: AI_INSIGHT_SYSTEM_INSTRUCTION }
    });
    return response.text?.trim() || "Keep pushing!";
  } catch (e) {
    console.warn("Insight failed:", e);
    return "AI 提示目前不可用。";
  }
};
