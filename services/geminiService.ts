
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

// Helper to get the API client.
const getAiClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Convert our app's message format to the format required by the Gemini API
const buildGeminiHistory = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
};

export const getAiCoachResponseStream = async (history: ChatMessage[], message: string) => {
  const client = getAiClient();
  const chat: Chat = client.chats.create({
    model: 'gemini-3-flash-preview',
    history: buildGeminiHistory(history),
    config: {
      systemInstruction: AI_COACH_SYSTEM_INSTRUCTION,
    }
  });
  
  const result = await chat.sendMessageStream({ message });
  return result;
};

export const getAiWorkoutPlan = async (goal: string, days: number, experience: string): Promise<WorkoutPlan> => {
  const client = getAiClient();
  const prompt = `Generate a ${days}-day workout plan for a user with the goal of '${goal}' and an experience level of '${experience}'.`;
  
  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview', // Complex reasoning task
    contents: prompt,
    config: {
      systemInstruction: AI_PLANNER_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: AI_PLANNER_RESPONSE_SCHEMA,
    }
  });

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI workout plan JSON:", text, e);
    throw new Error("The AI returned an invalid plan format. Please try again.");
  }
};

export const getCompetitionPrepStream = async (history: ChatMessage[], message: string) => {
  const client = getAiClient();
  const chat: Chat = client.chats.create({
    model: 'gemini-3-flash-preview',
    history: buildGeminiHistory(history),
    config: {
      systemInstruction: COMPETITION_PREP_SYSTEM_INSTRUCTION,
    }
  });
  
  const result = await chat.sendMessageStream({ message });
  return result;
};

export const getAiNutritionPlan = async (goal: string, tdee: number, workoutPlan: WorkoutPlan): Promise<NutritionPlan> => {
  const client = getAiClient();
  const prompt = `My TDEE is ${tdee} calories, my goal is '${goal}', and here is my workout plan for today: ${JSON.stringify(workoutPlan, null, 2)}`;
  
  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview', // Complex reasoning task
    contents: prompt,
    config: {
      systemInstruction: AI_NUTRITION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: AI_NUTRITION_RESPONSE_SCHEMA,
    }
  });

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI nutrition plan JSON:", text, e);
    throw new Error("The AI returned an invalid nutrition plan format. Please try again.");
  }
};

export const recognizeFoodInImage = async (base64Image: string): Promise<RecognizedFood[]> => {
    const client = getAiClient();
    const prompt = `Analyze the food items in this image. Estimate the nutrition facts for each item (calories, protein, carbohydrates, and fat). Provide your answer as a JSON object containing a single key "foods", which is an array of objects.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = { text: prompt };

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [textPart, imagePart] },
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
    
    try {
        const parsed = JSON.parse(response.text);
        return parsed.foods || [];
    } catch(e) {
        console.error("Failed to parse food recognition JSON:", response.text, e);
        throw new Error("AI 無法分析此圖片，請嘗試另一張照片。");
    }
};

export const getAiInsightTip = async (data: object, language: 'en' | 'zh'): Promise<string> => {
  const client = getAiClient();
  const langText = language === 'zh' ? 'Traditional Chinese (繁體中文)' : 'English';
  const prompt = `Here is the user's current status data. Please provide a short, actionable tip based on this information. 
  IMPORTANT: You must respond ONLY in ${langText}.
  
  Data:
  ${JSON.stringify(data, null, 2)}`;

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: AI_INSIGHT_SYSTEM_INSTRUCTION,
    }
  });
  
  return response.text.trim();
};
