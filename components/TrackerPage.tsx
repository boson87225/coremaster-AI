
import React, { useState, useRef, useMemo, useContext, useEffect } from 'react';
import { History, Camera, Loader2, X, Trash2, Edit, List, Scale, Zap, Clock, WifiOff } from './icons';
import { recognizeFoodInImage } from '../services/geminiService';
import type { FoodLogItem, RecognizedFood, ActivityLogItem } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { ManualFoodInput } from './ManualFoodInput';
import { FoodMenu } from './FoodMenu';
import { TabButton } from './TabButton';
import { WeightTracker } from './WeightTracker';

type TrackerMode = 'food' | 'weight' | 'activity';
type InputMode = 'camera' | 'manual' | 'menu';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const ActivityTracker: React.FC = () => {
    const { activityLog } = useContext(PlanContext);
    const { t } = useTranslation();

    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: ActivityLogItem[] } = {};
        activityLog.forEach(item => {
            const date = new Date(item.timestamp).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [activityLog]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-200">{t('WEIGHT_HISTORY')}</h3>
            {activityLog.length === 0 ? (
                <p className="text-center text-slate-500 py-8 italic">{t('NO_FOOD_LOGGED')}</p>
            ) : (
                <div className="space-y-6">
                    {groupedActivities.map(([date, items]) => (
                        <div key={date} className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{date}</h4>
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="p-4 bg-slate-700/40 rounded-xl border border-slate-700 flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${item.type === 'strength' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {item.type === 'strength' ? <Zap size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-slate-200">{item.name}</p>
                                            <p className="text-xs text-slate-400">{item.details}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RecognitionResult: React.FC<{
  results: RecognizedFood[];
  onAdd: (food: RecognizedFood) => void;
  onClose: () => void;
}> = ({ results, onAdd, onClose }) => {
    const { t } = useTranslation();
    return (
      <div className="mt-4 p-4 bg-slate-700/50 rounded-lg animate-fade-in border border-slate-600">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-cyan-300">{t('AI_RECOGNITION_RESULT')}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-600"><X size={18} /></button>
        </div>
        {results.length === 0 ? (
          <p className="text-slate-400">{t('AI_RECOGNITION_NO_FOOD')}</p>
        ) : (
          <ul className="space-y-2">
            {results.map((food, index) => (
              <li key={index} className="p-3 bg-slate-800 rounded-md shadow-sm border border-slate-700">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-200">{food.name}</p>
                  <button onClick={() => onAdd(food)} className="px-3 py-1 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700">{t('ADD_TO_LOG_BUTTON')}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-2 text-xs text-center">
                  <div className="bg-red-900/50 text-red-300 p-1 rounded"><span className="font-semibold">{Math.round(food.calories)}</span> {t('CALORIES_UNIT')}</div>
                  <div className="bg-blue-900/50 text-blue-300 p-1 rounded"><span className="font-semibold">{Math.round(food.protein)}g</span> {t('PROTEIN')}</div>
                  <div className="bg-yellow-900/50 text-yellow-300 p-1 rounded"><span className="font-semibold">{Math.round(food.carbs)}g</span> {t('CARBS')}</div>
                  <div className="bg-purple-900/50 text-purple-300 p-1 rounded"><span className="font-semibold">{Math.round(food.fat)}g</span> {t('FAT')}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
}

const FoodTracker: React.FC = () => {
  const { foodLog, addFoodLogItem, removeFoodLogItem } = useContext(PlanContext);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedFood, setRecognizedFood] = useState<RecognizedFood[] | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [apiKeyError, setApiKeyError] = useState(false);
  const [imageForRetry, setImageForRetry] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const totalCalories = useMemo(() => {
    return foodLog.reduce((sum, item) => sum + item.calories, 0);
  }, [foodLog]);
  
  const doRecognition = async (base64Image: string) => {
    if (!navigator.onLine) return;
    setIsLoading(true);
    setError(null);
    setRecognizedFood(null);
    setApiKeyError(false);

    try {
      const results = await recognizeFoodInImage(base64Image);
      setRecognizedFood(results);
      setImageForRetry(null); 
    } catch (err: any) {
        const errorMessage = err.toString().toLowerCase();
        if (errorMessage.includes("api key") || errorMessage.includes("permission denied") || errorMessage.includes("authentication") || errorMessage.includes("requested entity was not found")) {
            setApiKeyError(true);
            setImageForRetry(base64Image); 
        } else {
            const displayMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(t('RECOGNITION_FAILED', { message: displayMessage }));
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    const base64Image = await fileToBase64(file);
    doRecognition(base64Image);
  };
  
  const handleAddFoodToLog = (food: Omit<FoodLogItem, 'id' | 'timestamp'>) => {
      addFoodLogItem(food);
      setRecognizedFood(null);
      setSelectedImage(null);
  };
  
  const handleAddFromRecognition = (food: RecognizedFood) => {
     addFoodLogItem({
          imageUrl: selectedImage || undefined,
          ...food
      });
      setRecognizedFood(null);
      setSelectedImage(null);
  }
  
  const handleSetApiKeyAndRetry = async () => {
      if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
          await (window as any).aistudio.openSelectKey();
          setApiKeyError(false);
          if (imageForRetry) {
               setTimeout(() => {
                  doRecognition(imageForRetry);
              }, 500);
          }
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-center space-x-2 bg-slate-700/50 p-1 rounded-full">
         <TabButton<InputMode> mode="camera" currentMode={inputMode} setMode={setInputMode} label={t('INPUT_MODE_CAMERA')} icon={<Camera size={16}/>} />
         <TabButton<InputMode> mode="manual" currentMode={inputMode} setMode={setInputMode} label={t('INPUT_MODE_MANUAL')} icon={<Edit size={16}/>} />
         <TabButton<InputMode> mode="menu" currentMode={inputMode} setMode={setInputMode} label={t('INPUT_MODE_MENU')} icon={<List size={16}/>} />
      </div>

      {inputMode === 'camera' && (
        <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 relative overflow-hidden group">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !isOnline}
            className={`w-full flex flex-col items-center justify-center gap-3 py-6 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 ${
              !isOnline 
              ? 'border-slate-800 bg-slate-900/50 text-slate-700 cursor-not-allowed' 
              : 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50'
            }`}
          >
            <Camera className={`w-8 h-8 ${!isOnline ? 'text-slate-800' : 'text-cyan-400 animate-pulse'}`} />
            <div className="text-center">
              <span className="text-sm font-black uppercase tracking-widest block">{t('RECOGNIZE_FOOD_PHOTO')}</span>
              {!isOnline && (
                <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-tighter mt-1 flex items-center justify-center gap-1">
                  <WifiOff size={10} /> {t('OFFLINE_FEATURE_DISABLED')}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {inputMode === 'manual' && <ManualFoodInput onAdd={handleAddFoodToLog} />}
      {inputMode === 'menu' && <FoodMenu onAdd={handleAddFoodToLog} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="mt-3 text-slate-300 font-semibold">{t('AI_ANALYZING')}</p>
        </div>
      )}
      
      {apiKeyError && (
         <div className="p-4 text-center bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg">
            <p className="font-bold">{t('API_KEY_MISSING_ERROR_TITLE')}</p>
            <p className="text-sm mt-1">{t('API_KEY_MISSING_ERROR_DESC')}</p>
             <button onClick={handleSetApiKeyAndRetry} className="mt-4 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">
                {t('SET_API_KEY_BUTTON')}
            </button>
        </div>
      )}

      {error && !apiKeyError && (
        <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-center">
            <p>{error}</p>
            <button onClick={() => { setError(null); setSelectedImage(null); }} className="mt-2 text-sm font-semibold underline">{t('CLOSE_BUTTON')}</button>
        </div>
      )}
      
      {selectedImage && !recognizedFood && !isLoading && !error && !apiKeyError && (
           <div className="relative animate-fade-in">
              <img src={selectedImage} alt={t('SELECTED_FOOD_ALT')} className="rounded-lg w-full h-auto" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={18} /></button>
           </div>
      )}

      {recognizedFood && (
          <RecognitionResult 
            results={recognizedFood} 
            onAdd={handleAddFromRecognition}
            onClose={() => { setRecognizedFood(null); setSelectedImage(null); }}
          />
      )}
      
      <div className="border-t border-slate-700 pt-4 space-y-3">
        <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold text-slate-200">{t('TODAYS_LOG')}</h3>
            <p className="text-lg font-bold text-cyan-300">{t('TOTAL_CALORIES')}: {Math.round(totalCalories)}</p>
        </div>
        {foodLog.length > 0 ? (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {foodLog.map(item => (
              <li key={item.id} className="p-3 bg-slate-700/50 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-200">{item.name}</p>
                  <p className="text-sm text-slate-400">{Math.round(item.calories)} {t('CALORIES_UNIT')}</p>
                </div>
                <button onClick={() => removeFoodLogItem(item.id)} className="p-1 text-red-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-4">{t('NO_FOOD_LOGGED')}</p>
        )}
      </div>
    </div>
  )
}

export const TrackerPage: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [mode, setMode] = useState<TrackerMode>('food');
  const { t } = useTranslation();

  const pageConfig = {
    food: {
      title: t('FOOD_LOG_TITLE'),
      icon: <History className="w-6 h-6 mr-2" />
    },
    weight: {
      title: t('WEIGHT_TRACKING_TITLE'),
      icon: <Scale className="w-6 h-6 mr-2" />
    },
    activity: {
        title: '運動紀錄',
        icon: <Zap className="w-6 h-6 mr-2" />
    }
  };

  return (
    <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
        {pageConfig[mode].icon} {pageConfig[mode].title}
      </h2>

      <div className="flex justify-center space-x-2 bg-slate-900/40 p-1 rounded-full">
        <TabButton<TrackerMode>
          mode="food"
          currentMode={mode}
          setMode={setMode}
          label={t('FOOD_LOG_TAB')}
          icon={<History size={18} />}
        />
        <TabButton<TrackerMode>
          mode="weight"
          currentMode={mode}
          setMode={setMode}
          label={t('WEIGHT_LOG_TAB')}
          icon={<Scale size={18} />}
        />
        <TabButton<TrackerMode>
          mode="activity"
          currentMode={mode}
          setMode={setMode}
          label="活動"
          icon={<Zap size={18} />}
        />
      </div>

      <div className="animate-fade-in">
        {mode === 'food' && <FoodTracker />}
        {mode === 'weight' && <WeightTracker />}
        {mode === 'activity' && <ActivityTracker />}
      </div>
    </section>
  );
};
