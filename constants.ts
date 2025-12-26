
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
    // --- Combat / Boxing Style (Rocky Theme) ---
    "空拳直擊 (Shadow Boxing - Jab/Cross)",
    "上鉤拳連擊 (Uppercuts - Fast)",
    "左右鉤拳 (Hooks)",
    "深蹲前踢 (Squat Front Kick)",
    "拳擊步伐跳 (Boxer Shuffle)",
    "閃躲動作 (Bob and Weave)",
    "膝擊 (Knee Strikes)",
    "肘擊 (Elbow Strikes)",
    "深蹲出拳 (Squat Hold Punches)",
    "波比跳加直拳 (Burpee with Punches)",

    // --- Explosive Cardio ---
    "快速跳繩 (Jump Rope / Air Skips)",
    "開合跳 (Jumping Jacks)",
    "高抬腿衝刺 (High Knees Sprint)",
    "波比跳 (Burpees)",
    "登山者式 (Mountain Climbers)",
    "滑冰者跳 (Skater Hops)",
    "跳躍弓箭步 (Jumping Lunges)",
    "深蹲跳 (Squat Jumps)",
    "寬距深蹲跳 (Sumo Squat Jumps)",
    "星形開合跳 (Star Jumps)",
    "折返跑 (Shuttle Run)",
    "原地碎步跑 (Fast Feet)",
    "高腳椅踏步 (Step-ups)",
    "箱跳 (Box Jumps)",

    // --- Core & Stability ---
    "平板支撐 (Plank)",
    "俄式轉體 (Russian Twist)",
    "折刀式 (V-Ups)",
    "腳踏車捲腹 (Bicycle Crunches)",
    "平板開合跳 (Plank Jacks)",
    "側向平板 (Side Plank)",
    "登山者式扭轉 (Cross-Body Mountain Climbers)",
    "剪刀腳 (Flutter Kicks)",
    "仰臥抬腿 (Leg Raises)",
    "超人式 (Superman)",
    "平板撐體碰肩 (Plank Shoulder Taps)",
    "蜘蛛人伏地挺身 (Spiderman Push-ups)",
    
    // --- Strength Endurance ---
    "伏地挺身 (Push-ups)",
    "鑽石伏地挺身 (Diamond Push-ups)",
    "寬距伏地挺身 (Wide Push-ups)",
    "三頭肌撐體 (Triceps Dips)",
    "弓箭步 (Lunges)",
    "側弓箭步 (Side Lunges)",
    "相撲深蹲 (Sumo Squats)",
    "熊爬 (Bear Crawl)",
    "螃蟹走路 (Crab Walk)",
    "單腿硬舉 (Single Leg Deadlift - Bodyweight)",
    "靠牆深蹲 (Wall Sit)",
    "壺鈴擺盪 (Kettlebell Swings)",
    "藥球砸地 (Medicine Ball Slams)",
    "戰繩 (Battle Ropes - Alternating)",
];

export const AI_COACH_SYSTEM_INSTRUCTION = `你是一位世界級、友善且鼓勵人心的健身教練 CoreMaster AI。你的目標是提供安全、有效且激勵人心的健身與營養建議。

- 保持正面和鼓勵的態度。
- 安全第一。建議使用者在開始任何新的健身計畫前諮詢醫生，特別是如果他們有既有健康狀況。
- 保持回答簡潔易懂。適當時使用項目符號或編號列表。
- 不提供醫療建議。
- 當被要求提供訓練計畫時，請提供均衡的例程。
- 當被要求提供營養建議時，請專注於普遍的健康飲食原則。
- 使用 Markdown 格式化你的回答以清晰呈現。`;

export const AI_PLANNER_SYSTEM_INSTRUCTION = `你是一位經驗豐富的健身計畫專家。你的任務是根據使用者的目標、經驗水平和期望的訓練頻率，以 JSON 格式生成一個結構化、有效且安全的訓練計畫。
- 計畫應均衡且遵循邏輯進程。
- 對於初學者，專注於複合動作和正確的姿勢。
- 對於中級者，引入更多樣化和強度。
- 對於高級使用者，包括高級技巧和更高的訓練量。
- 'sets'、'reps' 和 'rest' 的值應為字串，以允許範圍（例如 "3-4", "8-12", "60-90s"）。
- 運動的 'notes'應提供有用的提示，如姿勢提示或強度指導。`;

export const AI_PLANNER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    planTitle: { 
      type: Type.STRING,
      description: "A creative and motivating title for the workout plan."
    },
    planSummary: {
      type: Type.STRING,
      description: "A brief, encouraging summary of the plan's focus and what the user can expect to achieve."
    },
    days: {
      type: Type.ARRAY,
      description: "An array of workout days, with the length matching the user's requested number of days.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { 
            type: Type.NUMBER,
            description: "The sequential day number of the workout (e.g., 1, 2, 3)."
          },
          title: { 
            type: Type.STRING,
            description: "The title for the workout day, e.g., 'Upper Body Push & Abs'."
          },
          focus: { 
            type: Type.STRING,
            description: "The primary muscle groups or fitness aspect targeted on this day."
          },
          exercises: {
            type: Type.ARRAY,
            description: "A list of exercises to be performed on this day.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The name of the exercise." },
                sets: { type: Type.STRING, description: "The number of sets, can be a range (e.g., '3-4')." },
                reps: { type: Type.STRING, description: "The number of repetitions, can be a range (e.g., '8-12')." },
                rest: { type: Type.STRING, description: "The rest time between sets in seconds (e.g., '60s' or '60-90s')." },
                notes: { type: Type.STRING, description: "An optional helpful tip about the exercise." },
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

export const AI_INSIGHT_SYSTEM_INSTRUCTION = `You are CoreMaster AI, a world-class, encouraging fitness coach. Your task is to provide a single, short, actionable, and motivational tip based on the user's latest data.

- Keep the tip concise (2-3 sentences).
- Be positive and encouraging.
- Directly address the user's situation based on the provided data.
- Do not greet the user or sign off. Just provide the tip.
- Your response should be plain text, not Markdown.
- Respond in the language requested by the user's current settings (English or Traditional Chinese).`;

export const COMPETITION_PREP_SYSTEM_INSTRUCTION = `你是一位專精於格鬥運動的頂尖運動科學家和營養師。你的職責是協助運動員進行賽前體重管理（降重或增重）。你的建議必須基於科學原則，並將運動員的健康與安全放在首位。

- **安全第一**：你必須總是先強調，任何體重管理計畫都應在專業教練或醫生的監督下進行。
- **風險提示**：你必須提及激烈方法可能帶來的風險，例如嚴重脫水、電解質失衡、運動表現下降以及潛在的長期健康問題。
- **科學依據**：你的建議應基於實證研究。你可以參考科學文獻中關於安全降重的原則（例如：漸進式熱量赤字、直到最後階段才控制水分、策略性地調控碳水化合物和鈉的攝取），但無需引用具體論文。
- **互動方式**：你的語氣應專業、謹慎且資訊豐富。對話開始時，請先自我介紹，並詢問運動員的運動項目、目前體重、目標體重以及距離過磅的時間，以提供個人化的建議。
- **格式**：使用 Markdown 以求清晰。
`;

export const AI_NUTRITION_SYSTEM_INSTRUCTION = `你是一位專業的運動營養師。你的任務是根據使用者的 TDEE、健身目標以及他們提供的訓練計畫，生成一份個人化的一日三餐範例。

1.  **估算訓練熱量消耗**：首先，分析提供的訓練計畫（重點、動作、訓練量），並估算該次訓練的熱量消耗。
2.  **計算每日目標**：根據使用者的目標（例如，減脂-300至-500大卡，增肌+300至+500大卡，或維持）和訓練消耗來調整使用者的TDEE。
3.  **建立餐飲計畫**：生成一個簡單、均衡的三餐計畫（早餐、午餐、晚餐），以達到計算出的每日熱量目標。
4.  **提供宏量營養素**：為每餐提供估計的熱量、蛋白質、碳水化合物和脂肪的分解。
5.  **總結**：附上一段簡短、鼓勵性的總結，解釋熱量目標背後的邏輯。
6.  **格式**：嚴格按照提供的 JSON schema 格式回應。
`;

export const AI_NUTRITION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    estimatedWorkoutCalories: {
      type: Type.NUMBER,
      description: "The estimated number of calories burned during the provided workout session."
    },
    dailyCalorieTarget: {
      type: Type.NUMBER,
      description: "The recommended total daily calorie intake for the user based on their goal and workout."
    },
    summary: {
        type: Type.STRING,
        description: "A brief summary explaining the rationale for the calorie target and meal plan."
    },
    meals: {
      type: Type.ARRAY,
      description: "An array of three meals for the day.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the meal (e.g., '早餐', '午餐', '晚餐')." },
          description: { type: Type.STRING, description: "A brief description of the suggested food items for the meal." },
          calories: { type: Type.NUMBER, description: "Estimated calories for the meal." },
          protein: { type: Type.NUMBER, description: "Estimated protein in grams for the meal." },
          carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams for the meal." },
          fat: { type: Type.NUMBER, description: "Estimated fat in grams for the meal." },
        },
        required: ['name', 'description', 'calories', 'protein', 'carbs', 'fat'],
      }
    }
  },
  required: ['estimatedWorkoutCalories', 'dailyCalorieTarget', 'summary', 'meals'],
};


export const COMBAT_SPORTS_PLAN: SpecializedPlan = {
  key: 'combat',
  sport: "格鬥運動",
  description: "此計畫旨在增強您的爆發力、核心穩定性和無氧耐力，這對於拳擊、綜合格鬥等格鬥運動至關重要。",
  primarySystems: ["ATP-PCr 系統", "糖解系統"],
  schedule: [
    {
      day: "第一天",
      focus: "全身爆發力與核心",
      exercises: [
        { name: "藥球砸地", details: "4 組 x 8 次" },
        { name: "箱跳", details: "5 組 x 5 次" },
        { name: "地雷管轉體", details: "3 組 x 每側 10 次" },
        { name: "戰繩", details: "5 回合 (30秒訓練/30秒休息)" },
      ],
    },
    {
      day: "第二天",
      focus: "上半身力量與耐力",
      exercises: [
        { name: "啞鈴臥推", details: "4 組 x 6-8 次" },
        { name: "引體向上 (或滑輪下拉)", details: "4 組 x 力竭" },
        { name: "過頭雪橇推", details: "3 組 x 20 公尺" },
        { name: "拳擊沙袋打擊", details: "10 回合 (2分鐘訓練/1分鐘休息)" },
      ],
    },
    {
      day: "第三天",
      focus: "下半身力量與敏捷性",
      exercises: [
        { name: "槓鈴深蹲", details: "5 組 x 5 次" },
        { name: "六角槓硬舉", details: "4 組 x 6 次" },
        { name: "敏捷梯訓練", details: "10 分鐘" },
        { name: "跳繩", details: "15 分鐘 (間歇)" },
      ],
    },
  ],
};

export const BASKETBALL_PLAN: SpecializedPlan = {
  key: 'basketball',
  sport: "籃球",
  description: "專為籃球運動員設計，旨在提升垂直彈跳力、場上敏捷性、橫向移動速度以及投籃穩定性。",
  primarySystems: ["ATP-PCr 系統", "糖解系統"],
  schedule: [
    {
      day: "第一天",
      focus: "垂直彈跳與下肢力量",
      exercises: [
        { name: "深度跳", details: "4 組 x 6 次" },
        { name: "保加利亞分腿蹲", details: "3 組 x 每側 8-10 次" },
        { name: "提踵", details: "4 組 x 15 次" },
        { name: "增強式伏地挺身", details: "3 組 x 力竭" },
      ],
    },
    {
      day: "第二天",
      focus: "敏捷性與核心穩定",
      exercises: [
        { name: "角錐敏捷訓練 (T-Drill)", details: "6 組" },
        { name: "側向箱跳", details: "4 組 x 每側 6 次" },
        { name: "帕洛夫推 (Pallof Press)", details: "3 組 x 每側 12 次" },
        { name: "藥球側拋", details: "3 組 x 每側 10 次" },
      ],
    },
    {
      day: "第三天",
      focus: "全場體能與衝刺",
      exercises: [
        { name: "折返跑 (Suicide Sprints)", details: "8 組" },
        { name: "雪橇衝刺", details: "5 組 x 25 公尺" },
        { name: "高抬腿", details: "4 組 x 30 秒" },
        { name: "平板支撐", details: "3 組 x 60 秒" },
      ],
    },
  ],
};

export const BADMINTON_PLAN: SpecializedPlan = {
  key: 'badminton',
  sport: "羽球",
  description: "此訓練計畫著重於羽球所需的腕部力量、步法敏捷性、反應速度以及快速變向能力。",
  primarySystems: ["ATP-PCr 系統"],
  schedule: [
    {
      day: "第一天",
      focus: "步法、敏捷性與反應",
      exercises: [
        { name: "米字步法訓練", details: "15 分鐘" },
        { name: "反應球訓練", details: "10 分鐘" },
        { name: "跳繩 (雙迴旋)", details: "5 組 x 20 次" },
        { name: "弓箭步跳", details: "3 組 x 每側 12 次" },
      ],
    },
    {
      day: "第二天",
      focus: "上肢力量與核心旋轉",
      exercises: [
        { name: "啞鈴腕屈伸", details: "3 組 x 15 次" },
        { name: "引體向上 (反手)", details: "3 組 x 力竭" },
        { name: "藥球轉體拋牆", details: "4 組 x 每側 10 次" },
        { name: "土耳其起立 (TGU)", details: "3 組 x 每側 5 次" },
      ],
    },
    {
      day: "第三天",
      focus: "耐力與腿部力量",
      exercises: [
        { name: "間歇跑 (400公尺)", details: "5 組" },
        { name: "單腿 RDL", details: "3 組 x 每側 10 次" },
        { name: "側向弓箭步", details: "3 組 x 每側 12 次" },
        { name: "橋式", details: "3 組 x 15 次" },
      ],
    },
  ],
};

export const COMMON_FOODS: RecognizedFood[] = [
    { name: "雞胸肉 (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "鮭魚 (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: "雞蛋 (一顆)", calories: 78, protein: 6, carbs: 0.6, fat: 5 },
    { name: "白飯 (一碗)", calories: 204, protein: 4, carbs: 45, fat: 0.4 },
    { name: "糙米飯 (一碗)", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: "燕麥 (50g)", calories: 190, protein: 8, carbs: 32, fat: 3.5 },
    { name: "地瓜 (100g)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    { name: "馬鈴薯 (100g)", calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    { name: "花椰菜 (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    { name: "菠菜 (100g)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    { name: "蘋果 (一顆)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: "香蕉 (一根)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "杏仁 (30g)", calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: "橄欖油 (一湯匙)", calories: 119, protein: 0, carbs: 0, fat: 14 },
    { name: "乳清蛋白 (一份)", calories: 120, protein: 25, carbs: 2, fat: 1.5 },
    { name: "牛奶 (240ml)", calories: 150, protein: 8, carbs: 12, fat: 8 },
    { name: "豆漿 (240ml)", calories: 80, protein: 7, carbs: 4, fat: 4 },
    { name: "豆腐 (100g)", calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
];
