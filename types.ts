
export interface Exercise {
  id: number;
  name: string;
  primary: string;
  secondary: string;
}

export type Page = 'home' | 'my_plan' | 'workout' | 'tracker' | 'profile' | 'ai_coach' | 'ai_planner' | 'manual_planner' | 'settings';
export type WorkoutPageMode = 'cardio' | 'strength' | 'specialized';
export type CardioMode = 'hiit' | 'liss';
export type StrengthMode = 'primary' | 'secondary';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  title: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  planTitle: string;
  planSummary: string;
  days: WorkoutDay[];
}

export type WorkoutStatus = 'idle' | 'playing' | 'paused' | 'finished' | 'resting';

export interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  currentDayIndex: number;
  currentExerciseIndex: number;
  status: WorkoutStatus;
  isExpanded: boolean;
  restTimer: number;
}

export interface WorkoutContextType {
  workoutState: WorkoutState;
  startWorkout: (plan: WorkoutPlan, dayIndex: number) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  nextExercise: () => void;
  endWorkout: () => void;
  toggleExpand: () => void;
  startRest: () => void;
  apiKeyError: boolean;
  handleSetApiKey: () => Promise<void>;
}

export interface FoodLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
  imageUrl?: string;
}

export interface RecognizedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ActivityLogItem {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'specialized';
  details: string; // e.g., "3 sets x 10 reps" or "30 mins"
  timestamp: Date;
}

export interface WeeklyWorkout {
  day: string;
  focus: string;
  exercises: { name: string; details: string; }[];
}

export interface SpecializedPlan {
  key: 'combat' | 'basketball' | 'badminton';
  sport: string;
  description: string;
  primarySystems: string[];
  schedule: WeeklyWorkout[];
}

export interface Meal {
  name: "早餐" | "午餐" | "晚餐" | "Breakfast" | "Lunch" | "Dinner";
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  estimatedWorkoutCalories: number;
  dailyCalorieTarget: number;
  meals: Meal[];
  summary: string;
}

export interface WeightLogItem {
  date: string;
  weight: number;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  goal: 'MUSCLE_GAIN' | 'FAT_LOSS' | 'ENDURANCE';
}

export interface PlanContextType {
    activeWorkoutPlan: WorkoutPlan | null;
    activeNutritionPlan: NutritionPlan | null;
    foodLog: FoodLogItem[];
    weightLog: WeightLogItem[];
    activityLog: ActivityLogItem[];
    userProfile: UserProfile | null;
    isLoaded: boolean;
    setActivePlan: (workoutPlan: WorkoutPlan, nutritionPlan: NutritionPlan | null) => void;
    setActiveWorkoutPlan: (workoutPlan: WorkoutPlan) => void;
    addFoodLogItem: (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => void;
    removeFoodLogItem: (id: string) => void;
    addWeightLogItem: (item: WeightLogItem) => void;
    removeWeightLogItem: (date: string) => void;
    addActivityLogItem: (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
    setUserProfile: (profile: UserProfile) => void;
    clearPlan: () => void;
}

export type Language = 'en' | 'zh';
