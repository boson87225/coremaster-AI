
import { Type } from '@google/genai';
import type { Exercise, SpecializedPlan, RecognizedFood } from './types';

// 重訓動作清單
export const STRENGTH_EXERCISES: Exercise[] = [
    { id: 1, name: "槓鈴臥推", primary: "胸", secondary: "上半身" },
    { id: 2, name: "啞鈴飛鳥", primary: "胸", secondary: "上半身" },
    { id: 3, name: "滑輪下拉", primary: "背", secondary: "上半身" },
    { id: 4, name: "槓鈴划船", primary: "背", secondary: "上半身" },
    { id: 5, name: "槓鈴深蹲", primary: "腿", secondary: "下半身" },
    { id: 6, name: "腿推機", primary: "腿", secondary: "下半身" },
    { id: 7, name: "硬舉", primary: "背", secondary: "下半身" },
    { id: 8, name: "機械胸推", primary: "胸", secondary: "上半身" },
];

export const HIIT_WORKOUT_PLAN: string[] = [
    "空拳直擊", "上鉤拳連擊", "波比跳", "高抬腿衝刺", "開合跳", "深蹲跳"
];

// AI 指令
export const AI_COACH_SYSTEM_INSTRUCTION = "您是 CoreMaster AI，一位專業的健身與營養教練。請提供基於科學且具備激勵性的建議。請務必使用繁體中文。";
export const AI_PLANNER_SYSTEM_INSTRUCTION = "您是一位專業的健身教練。請根據使用者的目標、天數與經驗，產生一個結構化的健身計畫。請務必使用繁體中文並以 JSON 格式回傳。";
export const AI_NUTRITION_SYSTEM_INSTRUCTION = "您是一位運動營養師。請根據使用者的精確數據產生每日三餐建議。請務必使用繁體中文並以 JSON 格式回傳。";
export const AI_INSIGHT_SYSTEM_INSTRUCTION = "請根據提供的使用者數據產生短小、具備激勵性的專業健身提示。請務必使用繁體中文。";
export const COMPETITION_PREP_SYSTEM_INSTRUCTION = "您是一位格鬥運動備賽專家。請針對體重管理提供專業建議。請務必使用繁體中文。";

// AI Response Schemas
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
          day: { type: Type.INTEGER },
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
            }
          }
        },
        required: ['day', 'title', 'focus', 'exercises'],
      }
    }
  },
  required: ['planTitle', 'planSummary', 'days'],
};

export const AI_NUTRITION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    estimatedWorkoutCalories: { type: Type.NUMBER },
    dailyCalorieTarget: { type: Type.NUMBER },
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
    },
    summary: { type: Type.STRING },
  },
  required: ['estimatedWorkoutCalories', 'dailyCalorieTarget', 'meals', 'summary'],
};

const genEx = (name: string, details: string) => ({ name, details });

// --- 專項運動計畫資料庫 (3日完整版) ---

export const COMBAT_PLAN: SpecializedPlan = {
  key: 'combat', sport: "格鬥", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1552072805-2a9039d00e57?q=80&w=1000&auto=format&fit=crop",
  description: "職業級打擊與抗摔體能計畫。", primarySystems: ["糖解", "ATP-PCr"], stats: { pwr: 90, agi: 95, end: 85 }, nutritionTips: "賽前補醣、碳水循環。", trainingFocus: "爆發傳導與旋轉鏈", keyPoints: ["拳背平整", "重心下沉"],
  schedule: [
    { day: "Day 1", focus: "打擊爆發", exercises: [genEx("跳繩", "3x3min"), genEx("空拳擊影", "4x3min"), genEx("地雷管側轉", "3x12"), genEx("藥球胸前砸牆", "4x10"), genEx("擊影接波比跳", "5x1min"), genEx("戰繩全力", "8x30s"), genEx("平板旋轉", "3x60s")] },
    { day: "Day 2", focus: "抗摔肌力", exercises: [genEx("六角槓硬舉", "5x5"), genEx("農夫走路", "4x40m"), genEx("負重雪橇推行", "5x20m"), genEx("引體向上", "4xMAX"), genEx("土耳其起立", "3x5"), genEx("懸垂舉腿", "4x15"), genEx("負重分腿蹲", "3x12")] },
    { day: "Day 3", focus: "無氧恢復", exercises: [genEx("波比跳", "5x15"), genEx("穿梭跑", "8組"), genEx("動態肩部熱身", "2x20"), genEx("腳踏車捲腹", "4x30"), genEx("擊影(放鬆)", "3x3min"), genEx("泡沫軸滾動", "15min"), genEx("靜態延展", "10min")] }
  ]
};

export const BASKETBALL_PLAN: SpecializedPlan = {
  key: 'hoops', sport: "籃球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?q=80&w=1000&auto=format&fit=crop",
  description: "垂直彈跳與空中對抗強化計畫。", primarySystems: ["ATP-PCr"], stats: { pwr: 95, agi: 92, end: 80 }, nutritionTips: "補充足夠鈣質與蛋白質。", trainingFocus: "三關節伸展與變向速度", keyPoints: ["落地吸震", "重心切換"],
  schedule: [
    { day: "Day 1", focus: "垂直彈跳", exercises: [genEx("深度跳 (Depth Jump)", "5x6"), genEx("箱跳 (高)", "4x8"), genEx("單腳助跑起跳", "4x6"), genEx("提踵強化", "4x25"), genEx("盪壺 (KB Swing)", "5x20"), genEx("藥球側拋", "4x12"), genEx("核心抗力撐", "3x60s")] },
    { day: "Day 2", focus: "籃下對抗", exercises: [genEx("槓鈴深蹲", "5x5"), genEx("負重肺步", "3x12"), genEx("臥推 (爆發)", "4x8"), genEx("單臂划船", "4x10"), genEx("硬舉", "3x5"), genEx("腹斜肌轉體", "4x20"), genEx("農夫走路", "3x30m")] },
    { day: "Day 3", focus: "敏捷步法", exercises: [genEx("米字步衝刺", "5x8"), genEx("梯形步法", "10組"), genEx("側向跨步跳", "4x15"), genEx("Shuttle Run", "6x40m"), genEx("單腳平衡穩定", "3x60s"), genEx("筋膜放鬆", "20min"), genEx("投籃手感訓練", "30min")] }
  ]
};

export const FOOTBALL_PLAN: SpecializedPlan = {
  key: 'football', sport: "足球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
  description: "綠茵體能與高頻變向訓練。", primarySystems: ["糖解", "氧化"], stats: { pwr: 80, agi: 98, end: 100 }, nutritionTips: "高碳水高電解質。", trainingFocus: "間歇耐力與制動能力", keyPoints: ["降低重心", "核心剛性"],
  schedule: [
    { day: "Day 1", focus: "高速衝刺", exercises: [genEx("繞錐衝刺", "8組"), genEx("T-Drill 變向", "6組"), genEx("100m 全力跑", "5組"), genEx("波比跳衝刺", "5x15"), genEx("箱跳連發", "4x10"), genEx("跳繩間歇", "5x2min"), genEx("死蟲式核心", "3x20")] },
    { day: "Day 2", focus: "下肢穩定", exercises: [genEx("槓鈴深蹲", "4x10"), genEx("保加利亞蹲", "4x12"), genEx("北歐捲腿", "3x10"), genEx("單腳RDL", "4x12"), genEx("引體向上", "3xMAX"), genEx("帕洛夫推舉", "4x15"), genEx("側向弓步", "3x15")] },
    { day: "Day 3", focus: "長效恢復", exercises: [genEx("8km 節奏跑", "1組"), genEx("慢跑恢復", "20min"), genEx("泡沫軸放鬆", "20min"), genEx("動態拉伸", "15min"), genEx("提踵練習", "4x20"), genEx("腳踝穩定", "3x30"), genEx("冰浴恢復", "15min")] }
  ]
};

export const BADMINTON_PLAN: SpecializedPlan = {
  key: 'badminton', sport: "羽球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1626225967045-9410dd99ec0f?q=80&w=1000&auto=format&fit=crop",
  description: "羽球專項急停、變向與扣殺力量。", primarySystems: ["ATP-PCr"], stats: { pwr: 75, agi: 100, end: 75 }, nutritionTips: "補充 B 群提升專注力。", trainingFocus: "側向移動與腕力", keyPoints: ["腳尖一致", "重心前傾"],
  schedule: [
    { day: "Day 1", focus: "敏捷步法", exercises: [genEx("六點米字步", "8組"), genEx("梯形側向移動", "10組"), genEx("單腳跳躍穩定", "4x15"), genEx("反應球訓練", "5min"), genEx("波比跳", "3x15"), genEx("核心側撐", "3x60s"), genEx("前場低重心跑", "5x10m")] },
    { day: "Day 2", focus: "扣殺力量", exercises: [genEx("腕力強化 (捲繩)", "4x30s"), genEx("肩部 YWT", "3x20"), genEx("地雷管斜推", "4x10"), genEx("引體向上", "3x8"), genEx("TRX 划船", "3x12"), genEx("藥球側拋", "4x10"), genEx("直臂下壓", "4x15")] },
    { day: "Day 3", focus: "心肺恢復", exercises: [genEx("跳繩", "5x3min"), genEx("慢跑", "30min"), genEx("動態肩頸放鬆", "10min"), genEx("瑜珈拉伸", "15min"), genEx("筋膜球按壓", "10min"), genEx("腳踝平衡", "3x60s"), genEx("手感揮拍", "100次")] }
  ]
};

export const RUNNING_PLAN: SpecializedPlan = {
  key: 'marathon', sport: "跑步", level: 'Elite', imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop",
  description: "專業跑者耐力與跑步效能優化。", primarySystems: ["氧化"], stats: { pwr: 50, agi: 65, end: 100 }, nutritionTips: "補醣與電解質平衡。", trainingFocus: "步頻穩定與核心剛性", keyPoints: ["180步頻", "腹式呼吸"],
  schedule: [
    { day: "Day 1", focus: "節奏跑訓練", exercises: [genEx("10km Tempo Run", "1組"), genEx("間歇 800m跑", "6組"), genEx("提踵練習", "4x25"), genEx("單腳平衡", "3x60s"), genEx("臀中肌強化", "4x20"), genEx("平板撐", "3x90s"), genEx("A-Skip 步法", "4x30m")] },
    { day: "Day 2", focus: "跑步肌力", exercises: [genEx("單腳深蹲", "3x10"), genEx("保加利亞蹲", "4x12"), genEx("硬舉", "3x8"), genEx("北歐捲腿", "3x10"), genEx("死蟲式", "4x30"), genEx("抗力球核心", "3x15"), genEx("懸垂舉腿", "3x12")] },
    { day: "Day 3", focus: "主動修復", exercises: [genEx("放鬆跑 5km", "1組"), genEx("泡沫軸放鬆", "25min"), genEx("靜態全身伸展", "20min"), genEx("腳踝穩定", "3x20"), genEx("低強度游泳", "20min"), genEx("熱敷恢復", "15min"), genEx("冰浴足部", "10min")] }
  ]
};

export const SWIMMING_PLAN: SpecializedPlan = {
  key: 'swimming', sport: "游泳", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1530549387074-d562b66bc44b?q=80&w=1000&auto=format&fit=crop",
  description: "提升推进力與流線型穩定度。", primarySystems: ["糖解", "氧化"], stats: { pwr: 75, agi: 60, end: 95 }, nutritionTips: "高品質脂肪攝取。", trainingFocus: "背闊肌拉力與核心鎖死", keyPoints: ["維持流線型", "核心剛性"],
  schedule: [
    { day: "Day 1", focus: "上肢拉力", exercises: [genEx("引體向上", "4xMAX"), genEx("滑輪下拉", "4x12"), genEx("TRX 划船", "4x15"), genEx("直臂下壓", "4x15"), genEx("抗力球死蟲", "4x20"), genEx("鳥狗式", "3x20"), genEx("划船機衝刺", "5x500m")] },
    { day: "Day 2", focus: "核心穩定", exercises: [genEx("藥球轉體", "4x20"), genEx("平板支撐 (負重)", "3x90s"), genEx("伐木動作", "4x12"), genEx("槓鈴深蹲", "4x10"), genEx("硬舉 (輕量)", "3x12"), genEx("反向飛鳥", "3x15"), genEx("核心側轉", "3x15")] },
    { day: "Day 3", focus: "水中修復", exercises: [genEx("慢速自由式 1km", "1組"), genEx("肩部活動度練習", "15min"), genEx("靜態伸展", "15min"), genEx("泡沫軸上半身", "20min"), genEx("呼吸練習", "10min"), genEx("熱水浴/按摩", "20min"), genEx("冥想放鬆", "10min")] }
  ]
};

export const YOGA_PLAN: SpecializedPlan = {
  key: 'yoga', sport: "瑜珈", level: 'Novice', imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fbb009e0b?q=80&w=1000&auto=format&fit=crop",
  description: "活動度與神經肌肉連結計畫。", primarySystems: ["氧化"], stats: { pwr: 35, agi: 75, end: 65 }, nutritionTips: "清淡飲食、多喝水。", trainingFocus: "呼吸意識與關節活動度", keyPoints: ["鼻吸鼻呼", "對齊正確"],
  schedule: [
    { day: "Day 1", focus: "動態流動", exercises: [genEx("貓牛式熱身", "10次"), genEx("太陽禮拜 A", "8組"), genEx("戰士一/二式", "每側45s"), genEx("側角伸展", "每側60s"), genEx("船式核心", "4x20"), genEx("下犬式停留", "3min"), genEx("大休息", "5min")] },
    { day: "Day 2", focus: "核心與平衡", exercises: [genEx("鳥狗式", "4x15"), genEx("樹式平衡", "每側60s"), genEx("鷹式伸展", "每側60s"), genEx("側平板", "3x45s"), genEx("橋式啟動", "4x20"), genEx("虎式流動", "3x12"), genEx("蝗蟲式", "3x15")] },
    { day: "Day 3", focus: "深層修復", exercises: [genEx("陰瑜珈 (開髖)", "15min"), genEx("鴿式伸展", "每側3min"), genEx("嬰兒式停留", "5min"), genEx("腹式呼吸", "10min"), genEx("脊椎扭轉", "每側3min"), genEx("冥想", "15min"), genEx("筋膜按摩", "10min")] }
  ]
};

export const TENNIS_PLAN: SpecializedPlan = {
  key: 'tennis', sport: "網球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1595435063835-510b67ff9c8d?q=80&w=1000&auto=format&fit=crop",
  description: "網球旋轉發力與多向折返體能。", primarySystems: ["糖解", "ATP-PCr"], stats: { pwr: 85, agi: 95, end: 85 }, nutritionTips: "低 GI 碳水化合物。", trainingFocus: "發球爆發力與回位速度", keyPoints: ["重心降低", "低手轉體"],
  schedule: [
    { day: "Day 1", focus: "旋轉爆發", exercises: [genEx("藥球轉體砸牆", "4x12"), genEx("帕洛夫斜推", "4x15"), genEx("T-Drill 敏捷", "8組"), genEx("單臂啞鈴推舉", "4x10"), genEx("側向跨步跳", "4x12"), genEx("擊影(模擬)", "5x2min"), genEx("腹斜肌捲腹", "4x30")] },
    { day: "Day 2", focus: "制動肌力", exercises: [genEx("槓鈴深蹲", "4x8"), genEx("保加利亞蹲", "4x10"), genEx("單臂划船", "4x12"), genEx("側向弓步 (負重)", "3x12"), genEx("農夫走路", "4x30m"), genEx("提踵", "4x20"), genEx("死蟲式", "4x20")] },
    { day: "Day 3", focus: "間歇耐力", exercises: [genEx("Shuttle Run", "8組"), genEx("穿梭跳繩", "5x3min"), genEx("慢跑", "20min"), genEx("泡沫軸腿部", "20min"), genEx("動態肩部放鬆", "10min"), genEx("靜態拉伸", "15min"), genEx("冰敷肩膀", "10min")] }
  ]
};

export const CROSSFIT_PLAN: SpecializedPlan = {
  key: 'crossfit', sport: "混合健身", level: 'Elite', imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
  description: "全方位體能與高強度技術挑戰。", primarySystems: ["混合"], stats: { pwr: 100, agi: 85, end: 95 }, nutritionTips: "全天候營養補給。", trainingFocus: "動作經濟性與心理韌性", keyPoints: ["技術優先", "呼吸調節"],
  schedule: [
    { day: "Day 1", focus: "WOD 挑戰", exercises: [genEx("抓舉技術 (Snatch)", "8x2"), genEx("倒立撐 (HSPU)", "4x10"), genEx("雙重跳繩 (DU)", "5x50"), genEx("波比跳 (Over bar)", "5x15"), genEx("盪壺 (24kg)", "4x20"), genEx("引體向上", "4xMAX"), genEx("划船機 2km", "1組")] },
    { day: "Day 2", focus: "最大肌力", exercises: [genEx("背蹲舉", "5x5"), genEx("硬舉", "3x3"), genEx("嚴格推舉", "4x8"), genEx("負重引體向上", "4x6"), genEx("前蹲舉", "3x8"), genEx("核心土耳其起立", "3x5"), genEx("俄羅斯轉體", "4x40")] },
    { day: "Day 3", focus: "主動修復", exercises: [genEx("Zone 2 騎行", "45min"), genEx("空桿動作練習", "20min"), genEx("泡沫軸全身", "30min"), genEx("瑜珈活動度", "20min"), genEx("熱浴恢復", "15min"), genEx("高蛋白補充", "1組"), genEx("冥想", "10min")] }
  ]
};

export const VOLLEYBALL_PLAN: SpecializedPlan = {
  key: 'volleyball', sport: "排球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1592656670411-591e4033a07b?q=80&w=1000&auto=format&fit=crop",
  description: "提升助跑高度與肩膀穩定度。", primarySystems: ["ATP-PCr"], stats: { pwr: 98, agi: 90, end: 70 }, nutritionTips: "膠原蛋白補給。", trainingFocus: "垂直彈跳與核心抗旋轉", keyPoints: ["落地輕盈", "肩膀穩定"],
  schedule: [
    { day: "Day 1", focus: "垂直爆發", exercises: [genEx("助跑跳箱", "5x5"), genEx("深度跳", "4x6"), genEx("負重深蹲跳", "4x10"), genEx("藥球砸牆", "4x10"), genEx("藥球胸前拋", "4x12"), genEx("提踵爆發", "4x20"), genEx("側向快速跨步", "5x10m")] },
    { day: "Day 2", focus: "防禦肌力", exercises: [genEx("槓鈴深蹲", "5x5"), genEx("地雷管斜推", "4x12"), genEx("肩部 YWT", "3x20"), genEx("臥推", "4x8"), genEx("反向飛鳥", "3x15"), genEx("帕洛夫推", "4x15"), genEx("側向弓步", "3x12")] },
    { day: "Day 3", focus: "活動修復", exercises: [genEx("低強度傳球訓練", "30min"), genEx("慢跑恢復", "20min"), genEx("泡沫軸背部/腿", "25min"), genEx("靜態拉伸", "15min"), genEx("冰敷肩膀", "15min"), genEx("腳踝平衡", "3x60s"), genEx("瑜珈蛇式", "3min")] }
  ]
};

export const GOLF_PLAN: SpecializedPlan = {
  key: 'golf', sport: "高爾夫", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1000&auto=format&fit=crop",
  description: "優化揮桿旋轉爆發力與胸椎活動度。", primarySystems: ["ATP-PCr"], stats: { pwr: 65, agi: 55, end: 60 }, nutritionTips: "低 GI 零食、充足水分。", trainingFocus: "髖胸分離與單腳穩定", keyPoints: ["重心維持", "旋轉流暢"],
  schedule: [
    { day: "Day 1", focus: "旋轉鏈優化", exercises: [genEx("胸椎旋轉練習", "3x20"), genEx("藥球側拋 (揮桿向)", "4x12"), genEx("伐木動作", "4x15"), genEx("單腳平衡 (閉眼)", "3x60s"), genEx("帕洛夫推", "4x12"), genEx("俄羅斯轉體", "4x40"), genEx("側向跨步", "3x15")] },
    { day: "Day 2", focus: "支撐肌力", exercises: [genEx("六角槓硬舉", "4x8"), genEx("單腿 RDL", "4x12"), genEx("啞鈴划船", "4x12"), genEx("前蹲舉", "3x10"), genEx("負重農夫走路", "3x40m"), genEx("引體向上", "3xMAX"), genEx("平板撐轉體", "3x15")] },
    { day: "Day 3", focus: "柔韌修復", exercises: [genEx("泡沫軸背部/腰", "25min"), genEx("靜態全身伸展", "20min"), genEx("揮桿動作演練", "50次"), genEx("脊椎扭轉伸展", "每側3min"), genEx("冥想放鬆", "15min"), genEx("熱水浴", "20min"), genEx("腳踝穩定", "3x30")] }
  ]
};

// 匯總所有專項計畫
export const ALL_SPECIALIZED_PLANS: SpecializedPlan[] = [
    COMBAT_PLAN,
    BASKETBALL_PLAN,
    FOOTBALL_PLAN,
    BADMINTON_PLAN,
    RUNNING_PLAN,
    SWIMMING_PLAN,
    YOGA_PLAN,
    TENNIS_PLAN,
    CROSSFIT_PLAN,
    VOLLEYBALL_PLAN,
    GOLF_PLAN
];

export const COMMON_FOODS: RecognizedFood[] = [
    { name: "雞胸肉 (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "鮭魚 (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: "雞蛋 (一顆)", calories: 78, protein: 6, carbs: 0.6, fat: 5 },
];
