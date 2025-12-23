
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WorkoutPlan, NutritionPlan, FoodLogItem, PlanContextType, WeightLogItem, UserProfile, ActivityLogItem } from '../types';

const PLAN_STORAGE_KEY = 'coreMasterActivePlan_v3';

const initialContextState: PlanContextType = {
  activeWorkoutPlan: null,
  activeNutritionPlan: null,
  foodLog: [],
  weightLog: [],
  activityLog: [],
  userProfile: null,
  isLoaded: false,
  setActivePlan: () => {},
  setActiveWorkoutPlan: () => {},
  addFoodLogItem: () => {},
  removeFoodLogItem: () => {},
  addWeightLogItem: () => {},
  removeWeightLogItem: () => {},
  addActivityLogItem: () => {},
  setUserProfile: () => {},
  clearPlan: () => {},
};

export const PlanContext = createContext<PlanContextType>(initialContextState);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkoutPlan, setActiveWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [activeNutritionPlan, setActiveNutritionPlanState] = useState<NutritionPlan | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogItem[]>([]);
  const [weightLog, setWeightLog] = useState<WeightLogItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PLAN_STORAGE_KEY);
      if (storedData) {
        const { workoutPlan, nutritionPlan, log, weight, profile, activity } = JSON.parse(storedData);
        if (workoutPlan) setActiveWorkoutPlanState(workoutPlan);
        if (nutritionPlan) setActiveNutritionPlanState(nutritionPlan);
        if (log) setFoodLog(log.map((item: any) => ({...item, timestamp: new Date(item.timestamp)})));
        if (weight) setWeightLog(weight);
        if (profile) setUserProfileState(profile);
        if (activity) setActivityLog(activity.map((item: any) => ({...item, timestamp: new Date(item.timestamp)})));
      }
    } catch (error) {
      console.error("Failed to load plan from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToStore = {
        workoutPlan: activeWorkoutPlan,
        nutritionPlan: activeNutritionPlan,
        log: foodLog,
        weight: weightLog,
        profile: userProfile,
        activity: activityLog,
      };
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save plan to localStorage", error);
    }
  }, [activeWorkoutPlan, activeNutritionPlan, foodLog, weightLog, userProfile, activityLog, isLoaded]);

  const setActivePlan = useCallback((workoutPlan: WorkoutPlan, nutritionPlan: NutritionPlan | null) => {
    setActiveWorkoutPlanState(workoutPlan);
    setActiveNutritionPlanState(nutritionPlan);
  }, []);

  const setActiveWorkoutPlan = useCallback((workoutPlan: WorkoutPlan) => {
    setActiveWorkoutPlanState(workoutPlan);
    setActiveNutritionPlanState(null);
  }, []);

  const addFoodLogItem = useCallback((item: Omit<FoodLogItem, 'id' | 'timestamp'>) => {
      const newLogItem: FoodLogItem = { ...item, id: crypto.randomUUID(), timestamp: new Date() };
      setFoodLog(prevLog => [newLogItem, ...prevLog]);
  }, []);
  
  const removeFoodLogItem = useCallback((id: string) => {
    setFoodLog(prevLog => prevLog.filter(item => item.id !== id));
  }, []);

  const addWeightLogItem = useCallback((item: WeightLogItem) => {
    setWeightLog(prevLog => {
        const existingEntryIndex = prevLog.findIndex(entry => entry.date === item.date);
        if (existingEntryIndex > -1) {
            const updatedLog = [...prevLog];
            updatedLog[existingEntryIndex] = item;
            return updatedLog.sort((a, b) => b.date.localeCompare(a.date));
        } else {
            return [...prevLog, item].sort((a, b) => b.date.localeCompare(a.date));
        }
    });
  }, []);

  const removeWeightLogItem = useCallback((date: string) => {
    setWeightLog(prevLog => prevLog.filter(item => item.date !== date));
  }, []);

  const addActivityLogItem = useCallback((item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLogItem = { ...item, id: crypto.randomUUID(), timestamp: new Date() };
    setActivityLog(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
  }, []);

  const clearPlan = useCallback(() => {
    setActiveWorkoutPlanState(null);
    setActiveNutritionPlanState(null);
    setFoodLog([]);
    setWeightLog([]);
    setActivityLog([]);
    setUserProfileState(null);
    localStorage.removeItem(PLAN_STORAGE_KEY);
  }, []);

  const value = {
    activeWorkoutPlan,
    activeNutritionPlan,
    foodLog,
    weightLog,
    activityLog,
    userProfile,
    isLoaded,
    setActivePlan,
    setActiveWorkoutPlan,
    addFoodLogItem,
    removeFoodLogItem,
    addWeightLogItem,
    removeWeightLogItem,
    addActivityLogItem,
    setUserProfile,
    clearPlan,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};
