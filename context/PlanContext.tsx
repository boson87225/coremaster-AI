
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WorkoutPlan, NutritionPlan, FoodLogItem, PlanContextType, WeightLogItem } from '../types';

const PLAN_STORAGE_KEY = 'coreMasterActivePlan';

const initialContextState: PlanContextType = {
  activeWorkoutPlan: null,
  activeNutritionPlan: null,
  foodLog: [],
  weightLog: [],
  setActivePlan: () => {},
  setActiveWorkoutPlan: () => {},
  addFoodLogItem: () => {},
  removeFoodLogItem: () => {},
  addWeightLogItem: () => {},
  removeWeightLogItem: () => {},
  clearPlan: () => {},
};

export const PlanContext = createContext<PlanContextType>(initialContextState);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkoutPlan, setActiveWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [activeNutritionPlan, setActiveNutritionPlanState] = useState<NutritionPlan | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogItem[]>([]);
  const [weightLog, setWeightLog] = useState<WeightLogItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PLAN_STORAGE_KEY);
      if (storedData) {
        const { workoutPlan, nutritionPlan, log, weight } = JSON.parse(storedData);
        if (workoutPlan) setActiveWorkoutPlanState(workoutPlan);
        if (nutritionPlan) setActiveNutritionPlanState(nutritionPlan);
        if (log) setFoodLog(log.map((item: any) => ({...item, timestamp: new Date(item.timestamp)})));
        if (weight) setWeightLog(weight);
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
      };
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save plan to localStorage", error);
    }
  }, [activeWorkoutPlan, activeNutritionPlan, foodLog, weightLog, isLoaded]);

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


  const clearPlan = useCallback(() => {
    setActiveWorkoutPlanState(null);
    setActiveNutritionPlanState(null);
    setFoodLog([]);
    setWeightLog([]);
    localStorage.removeItem(PLAN_STORAGE_KEY);
  }, []);

  const value = {
    activeWorkoutPlan,
    activeNutritionPlan,
    foodLog,
    weightLog,
    setActivePlan,
    setActiveWorkoutPlan,
    addFoodLogItem,
    removeFoodLogItem,
    addWeightLogItem,
    removeWeightLogItem,
    clearPlan,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};