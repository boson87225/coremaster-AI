import { Type } from '@google/genai';
import type { Exercise, SpecializedPlan, RecognizedFood } from './types';

export const STRENGTH_EXERCISES: Exercise[] = [
    { id: 1, name: "臥推 (Bench Press)", primary: '胸', secondary: '上半身' },
    { id: 2, name: "深蹲 (Squat)", primary: '腿', secondary: '下半身' },
    { id: 3, name: "硬舉 (Deadlift)", primary: '背', secondary: '下半身' },
    { id: 4, name: "肩推 (Overhead Press)", primary: '胸', secondary: '上半身' },
    { id: 5, name: "引體向上 (Pull-ups)", primary: '背', secondary: '上半身' },
    { id: 6, name: "划船 (Barbell Row)", primary: '背', secondary: '上半身' },
    { id: 7, name: "腿舉 (Leg Press)", primary: '腿', secondary: '下半身' },
    { id: 8, name: "二頭彎舉 (Bicep Curl)", primary: '上半身', secondary: '上半身' },
    { id: 9, name: "三頭肌下壓 (Triceps Pushdown)", primary: '上半身', secondary: '上半身' },
    { id: 10, name: "羅馬尼亞硬舉 (RDL)", primary: '腿', secondary: '下半身' },
];

export const HIIT_WORKOUT_PLAN: string[] = [
    "空拳直擊 (Shadow Boxing)", "快速跳繩", "開合跳", "高抬腿衝刺", "波比跳", "登山者式", "滑冰者跳", "跳躍弓箭步", "深蹲跳", "平板支撐", "俄式轉體", "伏地挺身"
];

export const AI_COACH_SYSTEM_INSTRUCTION = `你是一位世界級、友善且鼓勵人心的健身教練 CoreMaster AI。你的目標是提供安全、有效且激勵人心的健身與營養建議。`;
export const AI_PLANNER_SYSTEM_INSTRUCTION = `你是一位經驗豐富的健身計畫專家。你的任務是根據使用者的目標、經驗水平和期望的訓練頻率，以 JSON 格式生成一個結構化、有效且安全的訓練計畫。`;

export const AI_PLANNER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    planTitle: { type: Type.STRING },
    planSummary: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          title: { type: Type.STRING },
          focus: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.STRING },
                reps: { type: Type.STRING },
                rest: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ['name', 'sets', 'reps', 'rest'],
            },
          },
        },
        required: ['day', 'title', 'focus', 'exercises'],
      },
    },
  },
  required: ['planTitle', 'planSummary', 'days'],
};

export const AI_INSIGHT_SYSTEM_INSTRUCTION = `You are CoreMaster AI, a world-class coach providing motivational tips based on data.`;
export const COMPETITION_PREP_SYSTEM_INSTRUCTION = `你是一位專精於格鬥運動的頂尖運動科學家協助賽前體重管理。`;
export const AI_NUTRITION_SYSTEM_INSTRUCTION = `你是一位專業的運動營養師，根據計畫生成三餐。`;

export const AI_NUTRITION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    estimatedWorkoutCalories: { type: Type.NUMBER },
    dailyCalorieTarget: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
        },
        required: ['name', 'description', 'calories', 'protein', 'carbs', 'fat'],
      }
    }
  },
  required: ['estimatedWorkoutCalories', 'dailyCalorieTarget', 'summary', 'meals'],
};

// --- Specialized Plans (Sports Science Based) ---

export const COMBAT_SPORTS_PLAN: SpecializedPlan = {
  key: 'combat',
  sport: "格鬥運動",
  description: "強化爆發力與無氧耐力，針對反應強度（RSI）優化。",
  primarySystems: ["ATP-PCr 系統", "糖解系統"],
  schedule: [
    { day: "第一天", focus: "全身爆發力", exercises: [{ name: "藥球砸地", details: "4 組 x 8 次" }, { name: "箱跳", details: "5 組 x 5 次" }] },
    { day: "第二天", focus: "上肢打擊力量", exercises: [{ name: "啞鈴臥推", details: "4 組 x 6 次" }, { name: "沙袋練習", details: "10 回合" }] },
    { day: "第三天", focus: "下肢位移敏捷", exercises: [{ name: "槓鈴深蹲", details: "5 組 x 5 次" }, { name: "敏捷梯", details: "10 分鐘" }] },
  ],
};

export const BASKETBALL_PLAN: SpecializedPlan = {
  key: 'basketball',
  sport: "籃球",
  description: "垂直彈跳（V-Jump）與橫向變向速度（COD）強化。",
  primarySystems: ["ATP-PCr 系統"],
  schedule: [
    { day: "第一天", focus: "彈跳爆發", exercises: [{ name: "深度跳 (Depth Jump)", details: "4 組 x 6 次" }] },
    { day: "第二天", focus: "敏捷與變向", exercises: [{ name: "T-Drill 敏捷測試", details: "6 組" }] },
    { day: "第三天", focus: "體能耐力", exercises: [{ name: "全場折返跑", details: "8 組" }] },
  ],
};

export const BADMINTON_PLAN: SpecializedPlan = {
  key: 'badminton',
  sport: "羽球",
  description: "腕部發力與米字步法微敏捷性。",
  primarySystems: ["ATP-PCr 系統"],
  schedule: [
    { day: "第一天", focus: "步法與反應", exercises: [{ name: "米字步敏捷", details: "15 分鐘" }] },
    { day: "第二天", focus: "核心旋轉爆發", exercises: [{ name: "藥球對牆拋", details: "4 組 x 10 次" }] },
    { day: "第三天", focus: "下肢動態穩定", exercises: [{ name: "側向弓箭步", details: "3 組 x 12 次" }] },
  ],
};

export const VOLLEYBALL_PLAN: SpecializedPlan = {
    key: 'volleyball',
    sport: "排球",
    description: "起跳爆發力與攔網橫移穩定性。",
    primarySystems: ["ATP-PCr 系統"],
    schedule: [
      { day: "第一天", focus: "起跳爆發", exercises: [{ name: "負重深蹲跳", details: "4 組 x 6 次" }] },
      { day: "第二天", focus: "攔網步伐", exercises: [{ name: "側向快速移動", details: "6 組" }] },
      { day: "第三天", focus: "核心穩定", exercises: [{ name: "平板支撐碰肩", details: "3 組 x 15 次" }] },
    ],
};

export const TENNIS_PLAN: SpecializedPlan = {
    key: 'tennis',
    sport: "網球",
    description: "橫向爆發力與單邊肢體力量平衡（Unilateral Power）。",
    primarySystems: ["糖解系統"],
    schedule: [
      { day: "第一天", focus: "橫向變向 (COD)", exercises: [{ name: "Spider Drill", details: "8 組" }] },
      { day: "第二天", focus: "螺旋旋轉動能", exercises: [{ name: "地雷管轉體", details: "4 組 x 10 次" }] },
      { day: "第三天", focus: "高強度間歇", exercises: [{ name: "400m 間歇跑", details: "5 組" }] },
    ],
};

export const SWIMMING_DRYLAND_PLAN: SpecializedPlan = {
    key: 'swimming',
    sport: "游泳乾地",
    description: "拉水背部力量與流體力學核心張力。",
    primarySystems: ["氧化系統"],
    schedule: [
      { day: "第一天", focus: "背部拉力鏈", exercises: [{ name: "引體向上", details: "4 組" }] },
      { day: "第二天", focus: "流體核心控制", exercises: [{ name: "中空支撐 (Hollow Hold)", details: "4 組 x 45 秒" }] },
      { day: "第三天", focus: "肩髖活動度", exercises: [{ name: "世界最偉大伸展", details: "3 組" }] },
    ],
};

export const GOLF_PLAN: SpecializedPlan = {
    key: 'golf',
    sport: "高爾夫球",
    description: "螺旋動力鏈傳導與身體分離度（X-Factor）。",
    primarySystems: ["ATP-PCr 系統"],
    schedule: [
      { day: "第一天", focus: "旋轉爆發力", exercises: [{ name: "藥球側向拋球", details: "4 組 x 8 次" }] },
      { day: "第二天", focus: "單側平衡穩定", exercises: [{ name: "單腿硬舉 (RDL)", details: "4 組 x 10 次" }] },
      { day: "第三天", focus: "胸椎活動度", exercises: [{ name: "T-Spine 旋轉", details: "3 組 x 10 次" }] },
    ],
};

export const BASEBALL_PLAN: SpecializedPlan = {
    key: 'baseball',
    sport: "棒球",
    description: "投球螺旋鏈爆發與肩袖肌群離心緩衝預防受傷。",
    primarySystems: ["ATP-PCr 系統"],
    schedule: [
      { day: "第一天", focus: "投擲螺旋鏈", exercises: [{ name: "地雷管轉體爆發", details: "4 組 x 8 次" }] },
      { day: "第二天", focus: "後鏈發力 (Hinge)", exercises: [{ name: "六角槓硬舉", details: "4 組 x 6 次" }] },
      { day: "第三天", focus: "肩胛控制與穩定", exercises: [{ name: "Face Pull 面拉", details: "3 組 x 15 次" }] },
    ],
};

export const SOCCER_PLAN: SpecializedPlan = {
    key: 'soccer',
    sport: "足球",
    description: "優化 COD 變向能力與重複衝刺能力 (RSA)。",
    primarySystems: ["糖解系統"],
    schedule: [
      { day: "第一天", focus: "多向敏捷爆發", exercises: [{ name: "T-Drill 敏捷跑", details: "8 組" }] },
      { day: "第二天", focus: "下肢離心韌性", exercises: [{ name: "北歐挺身 (Nordic)", details: "3 組 x 8 次" }] },
      { day: "第三天", focus: "有氧無氧混合", exercises: [{ name: "15-15 間歇跑", details: "15 分鐘" }] },
    ],
};

export const TABLE_TENNIS_PLAN: SpecializedPlan = {
    key: 'table_tennis',
    sport: "桌球",
    description: "極短程微敏捷（Micro-Agility）與快縮肌徵召。",
    primarySystems: ["ATP-PCr 系統"],
    schedule: [
      { day: "第一天", focus: "微敏捷步法", exercises: [{ name: "快速碎步 (Fast Feet)", details: "6 組 x 15 秒" }] },
      { day: "第二天", focus: "旋轉回位效率", exercises: [{ name: "藥球快速側拋", details: "4 組 x 12 次" }] },
      { day: "第三天", focus: "神經肌肉反應", exercises: [{ name: "反應球對牆", details: "10 分鐘" }] },
    ],
};

export const COMMON_FOODS: RecognizedFood[] = [
    { name: "雞胸肉 (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "鮭魚 (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
];