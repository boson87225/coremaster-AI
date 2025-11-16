import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WorkoutPlan, NutritionPlan, FoodLogItem, PlanContextType, WeightLogItem, UserProfile } from '../types';

const PLAN_STORAGE_KEY = 'coreMasterActivePlan_v2';

const initialContextState: PlanContextType = {
  activeWorkoutPlan: null,
  activeNutritionPlan: null,
  foodLog: [],
  weightLog: [],
  userProfile: null,
  isLoaded: false,
  setActivePlan: () => {},
  setActiveWorkoutPlan: () => {},
  addFoodLogItem: () => {},
  removeFoodLogItem: () => {},
  addWeightLogItem: () => {},
  removeWeightLogItem: () => {},
  setUserProfile: () => {},
  clearPlan: () => {},
};

export const PlanContext = createContext<PlanContextType>(initialContextState);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkoutPlan, setActiveWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [activeNutritionPlan, setActiveNutritionPlanState] = useState<NutritionPlan | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogItem[]>([]);
  const [weightLog, setWeightLog] = useState<WeightLogItem[]>([]);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PLAN_STORAGE_KEY);
      if (storedData) {
        const { workoutPlan, nutritionPlan, log, weight, profile } = JSON.parse(storedData);
        if (workoutPlan) setActiveWorkoutPlanState(workoutPlan);
        if (nutritionPlan) setActiveNutritionPlanState(nutritionPlan);
        if (log) setFoodLog(log.map((item: any) => ({...item, timestamp: new Date(item.timestamp)})));
        if (weight) setWeightLog(weight);
        if (profile) setUserProfileState(profile);
      }
    } catch (error) {
      console.error("Failed to load plan from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const today = new Date().toDateString();
      const todaysLog = foodLog.filter(item => new Date(item.timestamp).toDateString() === today);
      
      const dataToStore = {
        workoutPlan: activeWorkoutPlan,
        nutritionPlan: activeNutritionPlan,
        log: todaysLog,
        weight: weightLog,
        profile: userProfile,
      };
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save plan to localStorage", error);
    }
  }, [activeWorkoutPlan, activeNutritionPlan, foodLog, weightLog, userProfile, isLoaded]);

  const setActivePlan = useCallback((workoutPlan: WorkoutPlan, nutritionPlan: NutritionPlan | null) => {
    setActiveWorkoutPlanState(workoutPlan);
    setActiveNutritionPlanState(nutritionPlan);
    setFoodLog([]); // Reset food log when a new plan is set
  }, []);

  const setActiveWorkoutPlan = useCallback((workoutPlan: WorkoutPlan) => {
    setActiveWorkoutPlanState(workoutPlan);
    setActiveNutritionPlanState(null); // Clear nutrition plan if only workout is set
    setFoodLog([]);
  }, []);

  const addFoodLogItem = useCallback((item: Omit<FoodLogItem, 'id' | 'timestamp'>) => {
      const newLogItem: FoodLogItem = {
          ...item,
          id: crypto.randomUUID(),
          timestamp: new Date(),
      };
    setFoodLog(prevLog => [newLogItem, ...prevLog]);
  }, []);
  
  const removeFoodLogItem = useCallback((id: string) => {
    setFoodLog(prevLog => prevLog.filter(item => item.id !== id));
  }, []);

  const addWeightLogItem = useCallback((item: WeightLogItem) => {
    setWeightLog(prevLog => {
        const existingEntryIndex = prevLog.findIndex(entry => entry.date === item.date);

        if (existingEntryIndex > -1) {
            // Update the entry for the given date
            const updatedLog = [...prevLog];
            updatedLog[existingEntryIndex] = item;
            return updatedLog.sort((a, b) => b.date.localeCompare(a.date));
        } else {
            // Add new entry
            return [...prevLog, item].sort((a, b) => b.date.localeCompare(a.date));
        }
    });
  }, []);

  const removeWeightLogItem = useCallback((date: string) => {
    setWeightLog(prevLog => prevLog.filter(item => item.date !== date));
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
  }, []);

  const clearPlan = useCallback(() => {
    setActiveWorkoutPlanState(null);
    setActiveNutritionPlanState(null);
    setFoodLog([]);
    setWeightLog([]);
    setUserProfileState(null); // Also clear user profile on full reset
    localStorage.removeItem(PLAN_STORAGE_KEY);
  }, []);

  const value = {
    activeWorkoutPlan,
    activeNutritionPlan,
    foodLog,
    weightLog,
    userProfile,
    isLoaded,
    setActivePlan,
    setActiveWorkoutPlan,
    addFoodLogItem,
    removeFoodLogItem,
    addWeightLogItem,
    removeWeightLogItem,
    setUserProfile,
    clearPlan,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};