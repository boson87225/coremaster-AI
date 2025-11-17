
export interface Exercise {
  id: number;
  name: string;
  primary: string;
  secondary: string;
}

export type Page = 'home' | 'my_plan' | 'workout' | 'tracker' | 'profile' | 'ai_coach' | 'ai_planner' | 'settings';
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

// Added for Workout Player
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
}

// Added for Food Tracker
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

// Added for Specialized Training Page
export interface SportExercise {
  name: string;
  details: string; // e.g., "3 sets of 5 reps"
}

export interface WeeklyWorkout {
  day: string; // e.g., "Day 1" or "Monday"
  focus: string; // e.g., "Explosive Power & Core"
  exercises: SportExercise[];
}

export interface SpecializedPlan {
  key: 'combat' | 'basketball' | 'badminton';
  sport: string;
  description: string;
  primarySystems: string[];
  schedule: WeeklyWorkout[];
}

// Added for Personalized Nutrition Plan
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

// Added for Weight Tracker
export interface WeightLogItem {
  date: string; // YYYY-MM-DD
  weight: number; // in kg
}

// Added for User Profile
export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number; // in kg
  height: number; // in cm
  goal: 'MUSCLE_GAIN' | 'FAT_LOSS' | 'ENDURANCE';
}

// Added for Plan Context
export interface PlanContextType {
    activeWorkoutPlan: WorkoutPlan | null;
    activeNutritionPlan: NutritionPlan | null;
    foodLog: FoodLogItem[];
    weightLog: WeightLogItem[];
    userProfile: UserProfile | null;
    isLoaded: boolean;
    setActivePlan: (workoutPlan: WorkoutPlan, nutritionPlan: NutritionPlan | null) => void;
    setActiveWorkoutPlan: (workoutPlan: WorkoutPlan) => void;
    addFoodLogItem: (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => void;
    removeFoodLogItem: (id: string) => void;
    addWeightLogItem: (item: WeightLogItem) => void;
    removeWeightLogItem: (date: string) => void;
    setUserProfile: (profile: UserProfile) => void;
    clearPlan: () => void;
}

// Added for i18n
export type Language = 'en' | 'zh';