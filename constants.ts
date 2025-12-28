
import { Type } from '@google/genai';
import type { Exercise, SpecializedPlan, RecognizedFood } from './types';

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

export const AI_COACH_SYSTEM_INSTRUCTION = "您是 CoreMaster AI 健身營養教練。請務必使用繁體中文提供科學建議。";
export const AI_PLANNER_SYSTEM_INSTRUCTION = "您是健身教練，請根據使用者目標產生 JSON 格式的結構化計畫。務必使用繁體中文。";
export const AI_NUTRITION_SYSTEM_INSTRUCTION = "您是一位運動營養師。請根據提供的使用者最新體重、目標與訓練計畫，產生一份每日三餐的營養建議。請務必使用繁體中文並以 JSON 格式回傳。";
export const AI_INSIGHT_SYSTEM_INSTRUCTION = "產生短小、具備激勵性的健身提示。務必使用繁體中文。";
export const COMPETITION_PREP_SYSTEM_INSTRUCTION = "您是格鬥備賽專家，提供體重管理建議。務必使用繁體中文。";

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

// --- 完整的 12 項專項計畫 ---

export const COMBAT_PLAN: SpecializedPlan = {
  key: 'combat', sport: "格鬥", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1552072805-2a9039d00e57?q=80&w=1000&auto=format&fit=crop",
  description: "職業級打擊與抗摔體能計畫。", primarySystems: ["糖解", "ATP-PCr"], stats: { pwr: 95, agi: 95, end: 85 }, nutritionTips: "賽前補醣、碳水循環。", trainingFocus: "爆發傳導與旋轉鏈", 
  keyPoints: ["拳背平整、重心下沉", "旋轉力由腳跟啟動", "頸部肌肉剛性維持"],
  precautions: ["注意手腕保護，擊影時避免過度鎖死手肘", "旋轉動作需由核心帶動而非腰椎"],
  schedule: [
    { day: "Day 1", focus: "打擊爆發", exercises: [genEx("跳繩", "3x3min"), genEx("空拳擊影", "4x3min"), genEx("地雷管側轉", "3x12"), genEx("藥球砸牆", "4x10"), genEx("擊影接波比跳", "5x1min")] },
    { day: "Day 2", focus: "抗摔肌力", exercises: [genEx("六角槓硬舉", "5x5"), genEx("農夫走路", "4x40m"), genEx("引體向上", "4xMAX"), genEx("土耳其起立", "3x5"), genEx("懸垂舉腿", "4x15")] },
    { day: "Day 3", focus: "修復活動度", exercises: [genEx("動態肩部熱身", "10min"), genEx("瑜珈拉伸", "15min"), genEx("腳踏車捲腹", "4x30"), genEx("泡沫軸放鬆", "15min"), genEx("冥想", "10min")] }
  ]
};

export const BASKETBALL_PLAN: SpecializedPlan = {
  key: 'hoops', sport: "籃球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?q=80&w=1000&auto=format&fit=crop",
  description: "垂直彈跳與空中對抗強化。", primarySystems: ["ATP-PCr"], stats: { pwr: 95, agi: 92, end: 80 }, nutritionTips: "補充足夠鈣質與蛋白質。", trainingFocus: "三關節伸展與起跳速度",
  keyPoints: ["落地時髖關節緩衝", "三關節（踝膝髖）爆發同步", "核心對抗能力"],
  precautions: ["跳躍訓練前確保踝關節充分熱身", "膝蓋避免過度內扣"],
  schedule: [
    { day: "Day 1", focus: "彈跳爆發", exercises: [genEx("深度跳", "5x6"), genEx("單腳助跑起跳", "4x6"), genEx("提踵強化", "4x25"), genEx("盪壺", "5x20"), genEx("箱跳", "4x10")] },
    { day: "Day 2", focus: "對抗肌力", exercises: [genEx("槓鈴深蹲", "5x5"), genEx("臥推", "4x8"), genEx("單臂划船", "4x10"), genEx("硬舉", "3x5"), genEx("腹斜肌轉體", "4x20")] },
    { day: "Day 3", focus: "敏捷恢復", exercises: [genEx("米字步衝刺", "5x8"), genEx("梯形步法", "10組"), genEx("側向跨步跳", "4x15"), genEx("單腳平衡", "3x60s"), genEx("筋膜放鬆", "20min")] }
  ]
};

export const FOOTBALL_PLAN: SpecializedPlan = {
  key: 'football', sport: "足球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
  description: "綠茵體能與高頻變向訓練。", primarySystems: ["糖解", "氧化"], stats: { pwr: 80, agi: 98, end: 100 }, nutritionTips: "高碳水高電解質。", trainingFocus: "制動能力與折返速度",
  keyPoints: ["降低重心切換方向", "大腿後側（膕繩肌）剛性", "單腳平衡穩定"],
  precautions: ["注意 ACL 預防訓練", "草地滑動風險，確保鞋釘與場地匹配"],
  schedule: [
    { day: "Day 1", focus: "高速衝刺", exercises: [genEx("繞錐衝刺", "8組"), genEx("T-Drill 變向", "6組"), genEx("100m 全力跑", "5組"), genEx("波比跳", "5x15"), genEx("跳繩間歇", "5x2min")] },
    { day: "Day 2", focus: "下肢穩定", exercises: [genEx("負重深蹲", "4x10"), genEx("保加利亞蹲", "4x12"), genEx("北歐捲腿", "3x10"), genEx("單腳RDL", "4x12"), genEx("帕洛夫推舉", "4x15")] },
    { day: "Day 3", focus: "長效恢復", exercises: [genEx("慢跑恢復", "20min"), genEx("泡沫軸放鬆", "20min"), genEx("動態拉伸", "15min"), genEx("腳踝穩定", "3x30"), genEx("冰浴恢復", "15min")] }
  ]
};

export const BADMINTON_PLAN: SpecializedPlan = {
  key: 'badminton', sport: "羽球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1626225967045-9410dd99ec0f?q=80&w=1000&auto=format&fit=crop",
  description: "羽球急停變向與扣殺力量。", primarySystems: ["ATP-PCr"], stats: { pwr: 75, agi: 100, end: 75 }, nutritionTips: "補充 B 群提升神經傳導。", trainingFocus: "側向跨步速度與腕力",
  keyPoints: ["腳尖一致指向目標", "持拍手肩膀旋轉幅度", "前場低重心控制"],
  precautions: ["防止阿基里斯腱過度負荷", "注意揮拍過度導致的網球肘"],
  schedule: [
    { day: "Day 1", focus: "敏捷步法", exercises: [genEx("六點米字步", "8組"), genEx("梯形側移", "10組"), genEx("單腳跳躍穩定", "4x15"), genEx("波比跳", "3x15"), genEx("核心側撐", "3x60s")] },
    { day: "Day 2", focus: "扣殺爆發", exercises: [genEx("腕力捲繩", "4x30s"), genEx("肩部 YWT", "3x20"), genEx("地雷管斜推", "4x10"), genEx("引體向上", "3x8"), genEx("藥球側拋", "4x10")] },
    { day: "Day 3", focus: "關節保護", exercises: [genEx("慢跑", "30min"), genEx("肩頸放鬆", "10min"), genEx("瑜珈拉伸", "15min"), genEx("筋膜球按壓", "10min"), genEx("手感揮拍", "100次")] }
  ]
};

export const RUNNING_PLAN: SpecializedPlan = {
  key: 'marathon', sport: "跑步", level: 'Elite', imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop",
  description: "專業跑者耐力與跑步效能優化。", primarySystems: ["氧化"], stats: { pwr: 50, agi: 65, end: 100 }, nutritionTips: "補醣與電解質平衡。", trainingFocus: "步頻穩定與核心支撐",
  keyPoints: ["維持 180 步頻", "骨盆中立不晃動", "腹式呼吸節奏"],
  precautions: ["循序漸進增加跑量，預防疲勞性骨折", "注意跑步路面軟硬切換"],
  schedule: [
    { day: "Day 1", focus: "節奏跑訓練", exercises: [genEx("10km Tempo Run", "1組"), genEx("間歇 800m跑", "6組"), genEx("提踵練習", "4x25"), genEx("單腳平衡", "3x60s"), genEx("平板撐", "3x90s")] },
    { day: "Day 2", focus: "跑步肌力", exercises: [genEx("單腳深蹲", "3x10"), genEx("保加利亞蹲", "4x12"), genEx("硬舉", "3x8"), genEx("北歐捲腿", "3x10"), genEx("死蟲式", "4x30")] },
    { day: "Day 3", focus: "主動修復", exercises: [genEx("放鬆跑 5km", "1組"), genEx("泡沫軸放鬆", "25min"), genEx("靜態伸展", "20min"), genEx("腳踝穩定", "3x20"), genEx("熱敷恢復", "15min")] }
  ]
};

export const SWIMMING_PLAN: SpecializedPlan = {
  key: 'swimming', sport: "游泳", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1530549387074-d562b66bc44b?q=80&w=1000&auto=format&fit=crop",
  description: "提升推進力與流線型穩定。", primarySystems: ["糖解"], stats: { pwr: 75, agi: 60, end: 95 }, nutritionTips: "高品質脂肪攝取。", trainingFocus: "背闊肌拉力與核心鎖死",
  keyPoints: ["高肘抱水意識", "維持身體軸線平直", "核心對抗轉動"],
  precautions: ["注意肩袖肌群（Rotator Cuff）保護", "長時間訓練注意耳部與皮膚護理"],
  schedule: [
    { day: "Day 1", focus: "上肢拉力", exercises: [genEx("引體向上", "4xMAX"), genEx("滑輪下拉", "4x12"), genEx("TRX 划船", "4x15"), genEx("直臂下壓", "4x15"), genEx("划船機衝刺", "5x500m")] },
    { day: "Day 2", focus: "核心剛性", exercises: [genEx("藥球轉體", "4x20"), genEx("平板支撐", "3x90s"), genEx("伐木動作", "4x12"), genEx("槓鈴深蹲", "4x10"), genEx("反向飛鳥", "3x15")] },
    { day: "Day 3", focus: "水中修復", exercises: [genEx("慢速自泳 1km", "1組"), genEx("肩部活動度", "15min"), genEx("靜態伸展", "15min"), genEx("泡沫軸", "20min"), genEx("呼吸練習", "10min")] }
  ]
};

export const YOGA_PLAN: SpecializedPlan = {
  key: 'yoga', sport: "瑜珈", level: 'Novice', imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fbb009e0b?q=80&w=1000&auto=format&fit=crop",
  description: "活動度與神經肌肉連結。", primarySystems: ["氧化"], stats: { pwr: 35, agi: 75, end: 65 }, nutritionTips: "清淡飲食、多喝水。", trainingFocus: "呼吸意識與關節活動度",
  keyPoints: ["鼻吸鼻呼維持穩定", "骨盆對齊正確", "肌肉收縮與延展平衡"],
  precautions: ["不要在疼痛時硬推強度", "注意膝蓋在負擔重量時的排列"],
  schedule: [
    { day: "Day 1", focus: "動態流動", exercises: [genEx("貓牛式熱身", "10次"), genEx("太陽禮拜 A", "8組"), genEx("戰士二式", "每側45s"), genEx("側角伸展", "每側60s"), genEx("下犬式", "3min")] },
    { day: "Day 2", focus: "平衡穩定", exercises: [genEx("鳥狗式", "4x15"), genEx("樹式平衡", "每側60s"), genEx("鷹式伸展", "每側60s"), genEx("側平板", "3x45s"), genEx("虎式流動", "3x12")] },
    { day: "Day 3", focus: "深層放鬆", exercises: [genEx("陰瑜珈", "15min"), genEx("鴿式伸展", "每側3min"), genEx("嬰兒式", "5min"), genEx("腹式呼吸", "10min"), genEx("冥想", "15min")] }
  ]
};

export const TENNIS_PLAN: SpecializedPlan = {
  key: 'tennis', sport: "網球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1595435063835-510b67ff9c8d?q=80&w=1000&auto=format&fit=crop",
  description: "網球旋轉發力與多向折返體能。", primarySystems: ["糖解"], stats: { pwr: 85, agi: 95, end: 85 }, nutritionTips: "低 GI 碳水化合物。", trainingFocus: "回位速度與發球爆發力",
  keyPoints: ["低重心轉體擊球", "腳步多碎步調整", "肩膀與核心連動"],
  precautions: ["注意手肘支撐點強度", "側向移動時避免腳踝扭傷"],
  schedule: [
    { day: "Day 1", focus: "旋轉爆發", exercises: [genEx("藥球砸牆", "4x12"), genEx("帕洛夫斜推", "4x15"), genEx("T-Drill 敏捷", "8組"), genEx("單臂推舉", "4x10"), genEx("模擬揮拍", "5x2min")] },
    { day: "Day 2", focus: "制動力量", exercises: [genEx("負重深蹲", "4x8"), genEx("保加利亞蹲", "4x10"), genEx("單臂划船", "4x12"), genEx("側向弓步", "3x12"), genEx("農夫走路", "4x30m")] },
    { day: "Day 3", focus: "間歇恢復", exercises: [genEx("Shuttle Run", "8組"), genEx("跳繩", "5x3min"), genEx("慢跑", "20min"), genEx("泡沫軸", "20min"), genEx("肩部放鬆", "10min")] }
  ]
};

export const CROSSFIT_PLAN: SpecializedPlan = {
  key: 'crossfit', sport: "混合健身", level: 'Elite', imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
  description: "全方位體能與高強度技術挑戰。", primarySystems: ["混合"], stats: { pwr: 100, agi: 85, end: 95 }, nutritionTips: "全天候營養補給。", trainingFocus: "動作經濟性與恢復能力",
  keyPoints: ["技術優先於速度", "呼吸節奏控制", "核心穩定維持強度"],
  precautions: ["在大重量與高心率結合時特別注意動作模式", "預防手掌撕裂，使用保護具"],
  schedule: [
    { day: "Day 1", focus: "WOD 挑戰", exercises: [genEx("抓舉技術", "8x2"), genEx("倒立撐", "4x10"), genEx("雙重跳繩", "5x50"), genEx("波比跳", "5x15"), genEx("引體向上", "4xMAX")] },
    { day: "Day 2", focus: "最大肌力", exercises: [genEx("背蹲舉", "5x5"), genEx("硬舉", "3x3"), genEx("嚴格推舉", "4x8"), genEx("負重引體", "4x6"), genEx("土耳其起立", "3x5")] },
    { day: "Day 3", focus: "主動修復", exercises: [genEx("Zone 2 騎行", "45min"), genEx("空桿動作練習", "20min"), genEx("泡沫軸全身", "30min"), genEx("活動度練習", "20min"), genEx("高蛋白補充", "1組")] }
  ]
};

export const VOLLEYBALL_PLAN: SpecializedPlan = {
  key: 'volleyball', sport: "排球", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1592656670411-591e4033a07b?q=80&w=1000&auto=format&fit=crop",
  description: "提升跳躍高度與肩膀穩定度。", primarySystems: ["ATP-PCr"], stats: { pwr: 98, agi: 90, end: 70 }, nutritionTips: "膠原蛋白補給。", trainingFocus: "垂直彈跳與核心抗旋轉",
  keyPoints: ["助跑起跳連貫性", "落地腳尖先著地緩衝", "肩膀背側肌群穩定"],
  precautions: ["注意跳躍膝（Patellar Tendonitis）防範", "擊球手腕靈活性訓練"],
  schedule: [
    { day: "Day 1", focus: "垂直爆發", exercises: [genEx("助跑跳箱", "5x5"), genEx("深度跳", "4x6"), genEx("深蹲跳", "4x10"), genEx("藥球砸牆", "4x10"), genEx("提踵爆發", "4x20")] },
    { day: "Day 2", focus: "防守肌力", exercises: [genEx("槓鈴深蹲", "5x5"), genEx("地雷管斜推", "4x12"), genEx("肩部 YWT", "3x20"), genEx("臥推", "4x8"), genEx("帕洛夫推", "4x15")] },
    { day: "Day 3", focus: "主動修復", exercises: [genEx("低強度傳球", "30min"), genEx("慢跑恢復", "20min"), genEx("泡沫軸背腿", "25min"), genEx("靜態拉伸", "15min"), genEx("腳踝平衡", "3x60s")] }
  ]
};

export const GOLF_PLAN: SpecializedPlan = {
  key: 'golf', sport: "高爾夫", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1000&auto=format&fit=crop",
  description: "優化揮桿旋轉爆發與胸椎活動度。", primarySystems: ["ATP-PCr"], stats: { pwr: 65, agi: 55, end: 60 }, nutritionTips: "補充足夠水分。", trainingFocus: "髖胸分離與單腳穩定",
  keyPoints: ["穩定下盤支撐旋轉", "胸椎與肩膀分離度", "核心抗旋轉剛性"],
  precautions: ["防止腰椎代償胸椎旋轉", "注意單側運動導致的身體失衡"],
  schedule: [
    { day: "Day 1", focus: "旋轉優化", exercises: [genEx("胸椎旋轉", "3x20"), genEx("藥球側拋", "4x12"), genEx("伐木動作", "4x15"), genEx("單腳平衡", "3x60s"), genEx("俄羅斯轉體", "4x40")] },
    { day: "Day 2", focus: "支撐力量", exercises: [genEx("六角槓硬舉", "4x8"), genEx("單腿 RDL", "4x12"), genEx("啞鈴划船", "4x12"), genEx("前蹲舉", "3x10"), genEx("引體向上", "3xMAX")] },
    { day: "Day 3", focus: "柔韌恢復", exercises: [genEx("泡沫軸背腰", "25min"), genEx("靜態拉伸", "20min"), genEx("揮桿演練", "50次"), genEx("脊椎扭轉", "3min"), genEx("冥想放鬆", "15min")] }
  ]
};

export const STRENGTH_PLAN: SpecializedPlan = {
  key: 'bodybuilding', sport: "重訓", level: 'Pro', imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
  description: "增肌與肌肥大專項訓練。", primarySystems: ["糖解"], stats: { pwr: 100, agi: 50, end: 70 }, nutritionTips: "蛋白質盈餘攝取。", trainingFocus: "孤立收縮與機械做功",
  keyPoints: ["離心控制緩慢感", "目標肌群最大拉伸", "漸進式負荷增加"],
  precautions: ["避免借力代償", "在大重量訓練時確保有護導或安全架"],
  schedule: [
    { day: "Day 1", focus: "推力訓練", exercises: [genEx("槓鈴臥推", "4x10"), genEx("啞鈴上斜推", "3x12"), genEx("器械夾胸", "3x15"), genEx("肩推", "4x10"), genEx("三頭肌下壓", "3x15")] },
    { day: "Day 2", focus: "拉力訓練", exercises: [genEx("引體向上", "4xMAX"), genEx("槓鈴划船", "4x10"), genEx("坐姿划船", "3x12"), genEx("反飛鳥", "3x15"), genEx("二頭肌彎舉", "4x12")] },
    { day: "Day 3", focus: "下肢訓練", exercises: [genEx("槓鈴深蹲", "4x8"), genEx("腿推機", "4x12"), genEx("腿伸展", "3x15"), genEx("腿後勾", "3x15"), genEx("硬舉", "3x8")] }
  ]
};

export const ALL_SPECIALIZED_PLANS: SpecializedPlan[] = [
    COMBAT_PLAN, BASKETBALL_PLAN, FOOTBALL_PLAN, BADMINTON_PLAN, RUNNING_PLAN,
    SWIMMING_PLAN, YOGA_PLAN, TENNIS_PLAN, CROSSFIT_PLAN, VOLLEYBALL_PLAN, GOLF_PLAN, STRENGTH_PLAN
];

export const COMMON_FOODS: RecognizedFood[] = [
    { name: "雞胸肉 (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "鮭魚 (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: "雞蛋 (一顆)", calories: 78, protein: 6, carbs: 0.6, fat: 5 },
];
