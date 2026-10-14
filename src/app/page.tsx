'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Camera,
  LogOut,
  Flame,
  Scale,
  Ruler,
  Trash2,
  Loader2,
  Check,
  Plus,
  Search,
  Barcode,
  Dumbbell,
  TrendingUp,
  Download,
  Sparkles,
  Zap,
  Heart,
  ChevronRight,
  ChevronLeft,
  Info,
  Calendar,
  Utensils,
  Award,
  Clock,
  Droplets,
  FileText,
  ChefHat,
  Sliders,
  MessageSquare,
} from 'lucide-react';

// Fórmulas y Utilidades
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  Gender,
  ActivityLevel,
  FitnessGoal,
  MacroPreset,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  MACRO_PRESET_CONFIGS,
} from '@/lib/nutrition-calculator';

// Componentes Modulares
import { MacroRings } from '@/components/MacroRings';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { NaturalAiSearchModal } from '@/components/NaturalAiSearchModal';
import { ExerciseModal } from '@/components/ExerciseModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { WeightTrackerModal } from '@/components/WeightTrackerModal';
import { TrendCharts } from '@/components/TrendCharts';
import { ExportReportModal } from '@/components/ExportReportModal';
import { ExerciseList } from '@/components/ExerciseList';
import { WaterTracker } from '@/components/WaterTracker';
import { NutritionCoachModal } from '@/components/NutritionCoachModal';
import { LabelScannerModal } from '@/components/LabelScannerModal';
import { FitMakerModal } from '@/components/FitMakerModal';
import { FastingTimerModal } from '@/components/FastingTimerModal';
import { AchievementsModal } from '@/components/AchievementsModal';

export default function NutriScanApp() {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Estados de Autenticación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Navegación de Pestañas
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'analytics' | 'profile'>('dashboard');

  // Navegación por Fechas (Hoy, Ayer, selector de fecha)
  const [todayStr, setTodayStr] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Perfil Antropométrico & Metas (Core 1)
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('deficit_moderate');
  const [macroPreset, setMacroPreset] = useState<MacroPreset>('balanced');
  const [calorieGoal, setCalorieGoal] = useState<number>(2200);
  const [proteinGoalG, setProteinGoalG] = useState<number>(165);
  const [carbsGoalG, setCarbsGoalG] = useState<number>(220);
  const [fatGoalG, setFatGoalG] = useState<number>(73);
  const [carbCyclingEnabled, setCarbCyclingEnabled] = useState(false);
  const [isWorkoutDay, setIsWorkoutDay] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [streakCount, setStreakCount] = useState<number>(1);

  // Hidratación diaria en ml
  const [waterMl, setWaterMl] = useState<number>(0);

  // Escáner Foto IA Gemini (Core 2)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);

  // Listados de datos
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<any[]>([]);

  // Modales
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showNaturalAiModal, setShowNaturalAiModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNutritionCoach, setShowNutritionCoach] = useState(false);
  const [showLabelScanner, setShowLabelScanner] = useState(false);
  const [showFastingTimer, setShowFastingTimer] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [fitMakerTarget, setFitMakerTarget] = useState<{ name: string; calories: number } | null>(null);

  // Cargar agua del día seleccionado desde Supabase o localStorage
  async function loadWaterForDate(userId: string, date: string) {
    if (!userId || !date) return;
    try {
      const { data: wLog } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('logged_date', date)
        .maybeSingle();

      if (wLog && wLog.amount_ml !== undefined) {
        setWaterMl(Number(wLog.amount_ml) || 0);
        return;
      }
    } catch {}

    const saved = localStorage.getItem(`nutriscan_water_${date}`);
    setWaterMl(saved ? Number(saved) : 0);
  }

  // Sincronizar agua al cambiar de fecha o iniciar sesión
  useEffect(() => {
    if (session?.user?.id && selectedDate) {
      loadWaterForDate(session.user.id, selectedDate);
    }
  }, [selectedDate, session]);

  // 1. Manejo de Sesión de Supabase
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setTodayStr(today);
    setSelectedDate(today);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) {
        loadUserData(session.user.id);
        loadWaterForDate(session.user.id, today);
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
        loadWaterForDate(session.user.id, today);
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    const savedFavs = localStorage.getItem('nutriscan_favorites');
    if (savedFavs) {
      try {
        setFavoriteFoods(JSON.parse(savedFavs));
      } catch (e) {}
    }

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargar perfil y datos del usuario
  async function loadUserData(userId: string) {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

      if (profile) {
        setWeightKg(Number(profile.weight_kg) || 75);
        setHeightCm(Number(profile.height_cm) || 175);
        setAge(Number(profile.age) || 28);
        setGender((profile.gender as Gender) || 'male');
        setActivityLevel((profile.activity_level as ActivityLevel) || 'moderate');
        setFitnessGoal((profile.fitness_goal as FitnessGoal) || 'deficit_moderate');
        setMacroPreset((profile.macro_preset as MacroPreset) || 'balanced');
        setCalorieGoal(Number(profile.daily_calorie_goal) || 2200);
        setProteinGoalG(Number(profile.protein_goal_g) || 165);
        setCarbsGoalG(Number(profile.carbs_goal_g) || 220);
        setFatGoalG(Number(profile.fat_goal_g) || 73);
        setCarbCyclingEnabled(Boolean(profile.carb_cycling_enabled));
        setStreakCount(Number(profile.streak_count) || 1);
      }

      const { data: logs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (logs) setFoodLogs(logs);

      const { data: exercises } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (exercises) setExerciseLogs(exercises);

      const { data: weights } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (weights && weights.length > 0) {
        setWeightHistory(
          weights.map((w: any) => ({
            date: new Date(w.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            weight: Number(w.weight_kg),
          }))
        );
      } else {
        setWeightHistory([{ date: 'Inicio', weight: Number(profile?.weight_kg || 75) }]);
      }
    } catch (err) {
      console.warn('Cargando con respaldo local:', err);
    }
  }

  // 3. Recalcular metas científicas (Mifflin-St Jeor)
  function recalculateGoals(w = weightKg, h = heightCm, a = age, g = gender, act = activityLevel, goal = fitnessGoal, preset = macroPreset) {
    const bmr = calculateBMR(w, h, a, g);
    const tdee = calculateTDEE(bmr, act);
    const baseCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(baseCalories, preset);

    setCalorieGoal(baseCalories);
    setProteinGoalG(macros.proteinG);
    setCarbsGoalG(macros.carbsG);
    setFatGoalG(macros.fatG);

    return { bmr, tdee, baseCalories, macros };
  }

  // 4. Guardar Perfil
  async function saveProfile() {
    if (!session) return;
    setSavingProfile(true);
    setSavedSuccess(false);

    const { baseCalories, macros } = recalculateGoals();

    try {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        weight_kg: weightKg,
        height_cm: heightCm,
        age,
        gender,
        activity_level: activityLevel,
        fitness_goal: fitnessGoal,
        macro_preset: macroPreset,
        daily_calorie_goal: baseCalories,
        protein_goal_g: macros.proteinG,
        carbs_goal_g: macros.carbsG,
        fat_goal_g: macros.fatG,
        carb_cycling_enabled: carbCyclingEnabled,
        updated_at: new Date().toISOString(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  }

  // 5. Autenticación
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');

    if (isSignUp) {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (data.user && !data.session) {
        setAuthNotice('¡Cuenta creada! Revisa tu correo o desactiva "Confirm email" en Supabase.');
      } else if (data.session) {
        setSession(data.session);
        loadUserData(data.session.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        setSession(data.session);
        loadUserData(data.session.user.id);
      }
    }
  }

  // 6. Subida de imagen para Gemini Vision
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setLastAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  }

  // 7. Enviar a Gemini Vision API y Guardar Comida
  async function analyzeFoodWithGemini() {
    if (!imagePreview || !session) return;
    setAnalyzing(true);
    setLastAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
          weightKg,
          heightCm,
          userGoal: GOAL_ADJUSTMENTS[fitnessGoal]?.label || 'Equilibrado',
          mealType: selectedMealType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar la imagen con Gemini');

      setLastAnalysisResult(data);

      const newLog = {
        user_id: session.user.id,
        food_name: data.foodName,
        meal_type: selectedMealType,
        source: 'gemini_photo',
        total_calories: data.totalCalories,
        protein_g: data.proteinG,
        carbs_g: data.carbsG,
        fat_g: data.fatG,
        breakdown: data.items,
        created_at: new Date().toISOString(),
      };

      const { data: inserted } = await supabase.from('food_logs').insert(newLog).select().single();
      setFoodLogs([inserted || { id: Math.random().toString(), ...newLog }, ...foodLogs]);
    } catch (err: any) {
      alert('Error analizando foto con Gemini: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  // 8. Agregar comida genérica
  async function handleAddGenericFood(food: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
    source: string;
    breakdown?: any[];
  }) {
    if (!session) return;

    const newLog = {
      user_id: session.user.id,
      food_name: food.name,
      meal_type: food.mealType,
      source: food.source,
      total_calories: food.calories,
      protein_g: food.proteinG,
      carbs_g: food.carbsG,
      fat_g: food.fatG,
      breakdown: food.breakdown || [],
      created_at: new Date().toISOString(),
    };

    try {
      const { data: inserted } = await supabase.from('food_logs').insert(newLog).select().single();
      setFoodLogs([inserted || { id: Math.random().toString(), ...newLog }, ...foodLogs]);
    } catch {
      setFoodLogs([{ id: Math.random().toString(), ...newLog }, ...foodLogs]);
    }
  }

  // 9. Registrar Ejercicio
  async function handleAddExercise(exercise: {
    activityName: string;
    durationMin: number;
    caloriesBurned: number;
  }) {
    if (!session) return;

    const newExercise = {
      user_id: session.user.id,
      activity_name: exercise.activityName,
      duration_min: exercise.durationMin,
      calories_burned: exercise.caloriesBurned,
      created_at: new Date().toISOString(),
    };

    try {
      const { data: inserted } = await supabase.from('exercise_logs').insert(newExercise).select().single();
      setExerciseLogs([inserted || { id: Math.random().toString(), ...newExercise }, ...exerciseLogs]);
    } catch {
      setExerciseLogs([{ id: Math.random().toString(), ...newExercise }, ...exerciseLogs]);
    }
  }

  // 10. Registrar Peso y Medidas
  async function handleSaveWeightLog(log: {
    weightKg: number;
    waistCm?: number;
    chestCm?: number;
    armsCm?: number;
    notes?: string;
    newCalorieGoal?: number;
  }) {
    if (!session) return;

    setWeightKg(log.weightKg);
    const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    setWeightHistory([...weightHistory, { date: dateLabel, weight: log.weightKg }]);

    if (log.newCalorieGoal) {
      setCalorieGoal(log.newCalorieGoal);
    }

    try {
      await supabase.from('weight_logs').insert({
        user_id: session.user.id,
        weight_kg: log.weightKg,
        waist_cm: log.waistCm,
        chest_cm: log.chestCm,
        arms_cm: log.armsCm,
        notes: log.notes,
      });

      await supabase.from('profiles').update({
        weight_kg: log.weightKg,
        daily_calorie_goal: log.newCalorieGoal || calorieGoal,
      }).eq('id', session.user.id);
    } catch {}
  }

  // 11. Eliminar Comida
  async function deleteFoodLog(id: string) {
    try {
      await supabase.from('food_logs').delete().eq('id', id);
    } catch {}
    setFoodLogs(foodLogs.filter((f) => f.id !== id));
  }

  // 12. Eliminar Ejercicio
  async function deleteExerciseLog(id: string) {
    try {
      await supabase.from('exercise_logs').delete().eq('id', id);
    } catch {}
    setExerciseLogs(exerciseLogs.filter((e) => e.id !== id));
  }

  // 13. Manejo de Agua (Persistencia en Supabase y localStorage)
  async function handleUpdateWater(newMl: number) {
    setWaterMl(newMl);
    const dateKey = selectedDate || todayStr || new Date().toISOString().slice(0, 10);
    localStorage.setItem(`nutriscan_water_${dateKey}`, String(newMl));

    if (session?.user?.id) {
      try {
        await supabase.from('water_logs').upsert(
          {
            user_id: session.user.id,
            logged_date: dateKey,
            amount_ml: newMl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,logged_date' }
        );
      } catch (e) {
        console.warn('Persistencia local de agua activa:', e);
      }
    }
  }

  // 14. Guardar / Quitar Favoritos
  function toggleFavoriteMeal(log: any) {
    const exists = favoriteFoods.some((f) => f.name === log.food_name);
    let updated: any[];
    if (exists) {
      updated = favoriteFoods.filter((f) => f.name !== log.food_name);
    } else {
      updated = [
        ...favoriteFoods,
        {
          name: log.food_name,
          calories: log.total_calories,
          proteinG: log.protein_g,
          carbsG: log.carbs_g,
          fatG: log.fat_g,
          mealType: log.meal_type || 'lunch',
        },
      ];
    }
    setFavoriteFoods(updated);
    localStorage.setItem('nutriscan_favorites', JSON.stringify(updated));
  }

  // Filtro de Comidas y Ejercicios según la fecha seleccionada
  const filteredFoodLogs = foodLogs.filter((log) => {
    if (!log.created_at) return true;
    return log.created_at.slice(0, 10) === selectedDate;
  });

  const filteredExerciseLogs = exerciseLogs.filter((ex) => {
    if (!ex.created_at) return true;
    return ex.created_at.slice(0, 10) === selectedDate;
  });

  // Totales de la fecha seleccionada
  const caloriesConsumedToday = filteredFoodLogs.reduce((acc, log) => acc + (Number(log.total_calories) || 0), 0);
  const proteinConsumedToday = filteredFoodLogs.reduce((acc, log) => acc + (Number(log.protein_g) || 0), 0);
  const carbsConsumedToday = filteredFoodLogs.reduce((acc, log) => acc + (Number(log.carbs_g) || 0), 0);
  const fatConsumedToday = filteredFoodLogs.reduce((acc, log) => acc + (Number(log.fat_g) || 0), 0);
  const caloriesBurnedToday = filteredExerciseLogs.reduce((acc, ex) => acc + (Number(ex.calories_burned) || 0), 0);

  const effectiveCalorieGoal = carbCyclingEnabled
    ? isWorkoutDay
      ? Math.round(calorieGoal * 1.15)
      : Math.round(calorieGoal * 0.85)
    : calorieGoal;

  const caloriesRemaining = Math.max(0, effectiveCalorieGoal - caloriesConsumedToday + caloriesBurnedToday);

  // Histórico de 7 días para gráfica
  const calorieHistoryData = [
    { dayName: 'Lun', calories: 2100, goal: effectiveCalorieGoal },
    { dayName: 'Mar', calories: 1950, goal: effectiveCalorieGoal },
    { dayName: 'Mié', calories: 2300, goal: effectiveCalorieGoal },
    { dayName: 'Jue', calories: 2050, goal: effectiveCalorieGoal },
    { dayName: 'Vie', calories: 2180, goal: effectiveCalorieGoal },
    { dayName: 'Sáb', calories: 2400, goal: effectiveCalorieGoal },
    { dayName: 'Hoy', calories: caloriesConsumedToday, goal: effectiveCalorieGoal },
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-400">NutriScan AI</span>
        </div>
      </div>
    );
  }

  // PANTALLA DE LOGIN / REGISTRO
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl">
              <Flame className="w-7 h-7 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-white">NutriScan AI</h1>
          <p className="text-slate-400 text-center text-xs mt-1 mb-6">
            Ecosistema Nutricional Completo con Gemini Vision 2.5
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            {authError && <p className="text-rose-400 text-xs bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">{authError}</p>}
            {authNotice && <p className="text-emerald-400 text-xs bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/50">{authNotice}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {isSignUp ? 'Crear Cuenta Gratuita' : 'Iniciar Sesión'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError('');
              setAuthNotice('');
            }}
            className="w-full mt-4 text-xs text-slate-400 hover:text-white text-center transition"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Nuevo usuario? Regístrate en 5 segundos'}
          </button>
        </div>
      </div>
    );
  }

  // APLICACIÓN COMPLETA
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Barra de Navegación Superior */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-slate-950">
              <Camera className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-white leading-none">NutriScan AI</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Gemini Vision 2.5</span>
            </div>
          </div>

          {/* Acciones Rápidas Superior */}
          <div className="flex items-center gap-2">
            {/* Botón Asistente IA */}
            <button
              onClick={() => setShowNutritionCoach(true)}
              className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Coach IA</span>
            </button>

            {/* Temporizador de Ayuno */}
            <button
              onClick={() => setShowFastingTimer(true)}
              title="Cronómetro de Ayuno Intermitente"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs"
            >
              <Clock className="w-4 h-4 text-amber-400" />
            </button>

            {/* Medallas & Logros */}
            <button
              onClick={() => setShowAchievements(true)}
              title="Ver Logros y Medallas"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs"
            >
              <Award className="w-4 h-4 text-amber-400" />
            </button>

            {/* Exportar */}
            <button
              onClick={() => setShowExportModal(true)}
              title="Exportar informe en CSV o PDF"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Salir */}
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl transition text-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selector de Fecha Histórica */}
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between border-t border-slate-800/60 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const base = selectedDate || todayStr || new Date().toISOString().slice(0, 10);
                const d = new Date(base);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {!selectedDate || selectedDate === todayStr ? 'Hoy' : selectedDate}
            </span>

            <button
              onClick={() => {
                const base = selectedDate || todayStr || new Date().toISOString().slice(0, 10);
                const d = new Date(base);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedDate && selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30"
              >
                Volver a Hoy
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            {filteredFoodLogs.length} comidas · {filteredExerciseLogs.length} entrenamientos
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 border-t border-slate-800/60 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> Diario & Balance
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <Camera className="w-4 h-4" /> Escáner Foto IA
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Progreso & Medidas
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Objetivos & Macros
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* ========================================================================= */}
        {/* PESTAÑA 1: DIARIO Y BALANCE */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <>
            {/* Banner de Ciclo de Carbohidratos */}
            {carbCyclingEnabled && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">
                    Ciclo Activo:{' '}
                    <strong>{isWorkoutDay ? 'Día de Entrenamiento (+15% kcal)' : 'Día de Descanso (-15% kcal)'}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setIsWorkoutDay(!isWorkoutDay)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition"
                >
                  Cambiar a {isWorkoutDay ? 'Descanso' : 'Entrenamiento'}
                </button>
              </div>
            )}

            {/* Anillos de Macros y Calorías Restantes */}
            <MacroRings
              calorieGoal={effectiveCalorieGoal}
              caloriesConsumed={caloriesConsumedToday}
              caloriesBurned={caloriesBurnedToday}
              proteinGoalG={proteinGoalG}
              proteinConsumedG={Math.round(proteinConsumedToday)}
              carbsGoalG={carbsGoalG}
              carbsConsumedG={Math.round(carbsConsumedToday)}
              fatGoalG={fatGoalG}
              fatConsumedG={Math.round(fatConsumedToday)}
              streakCount={streakCount}
            />

            {/* Control de Hidratación (Water Tracker) */}
            <WaterTracker currentMl={waterMl} weightKg={weightKg} onChangeWater={handleUpdateWater} />

            {/* Botones de Registro Multimodal Rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                onClick={() => setActiveTab('scanner')}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:brightness-110 p-3.5 rounded-2xl text-slate-950 font-bold flex flex-col items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs">Foto con Gemini</span>
              </button>

              <button
                onClick={() => setShowBarcodeModal(true)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl text-white font-semibold flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Barcode className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">Código Barras</span>
              </button>

              <button
                onClick={() => setShowLabelScanner(true)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl text-white font-semibold flex flex-col items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-5 h-5 text-teal-400" />
                <span className="text-xs">OCR Etiqueta</span>
              </button>

              <button
                onClick={() => setShowNaturalAiModal(true)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl text-white font-semibold flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span className="text-xs">Búsqueda IA</span>
              </button>

              <button
                onClick={() => setShowQuickAddModal(true)}
                className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl text-white font-semibold flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-5 h-5 text-amber-400" />
                <span className="text-xs">Calorías Libres</span>
              </button>
            </div>

            {/* Listado y Desglose Visible de Ejercicios de Hoy */}
            <ExerciseList
              exercises={filteredExerciseLogs}
              onDeleteExercise={deleteExerciseLog}
              onOpenAddModal={() => setShowExerciseModal(true)}
            />

            {/* Bandeja de Comidas Favoritas (1-Tap Add) */}
            {favoriteFoods.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tus Comidas Favoritas (1-Tap)</h4>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {favoriteFoods.map((fav, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddGenericFood({ ...fav, source: 'favorite' })}
                      className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-2xl text-left shrink-0 transition flex items-center gap-2.5 min-w-[180px]"
                    >
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block line-clamp-1">{fav.name}</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">{fav.calories} kcal</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Listado de Comidas del Día Seleccionado */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300">Comidas Registradas ({selectedDate === todayStr ? 'Hoy' : selectedDate})</h3>
                <span className="text-xs text-slate-500">{filteredFoodLogs.length} platos</span>
              </div>

              {filteredFoodLogs.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                  <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No hay comidas en esta fecha</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Toma una foto con Gemini, escanea un código de barras o escribe en lenguaje natural.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredFoodLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {log.meal_type === 'breakfast'
                              ? 'Desayuno'
                              : log.meal_type === 'lunch'
                              ? 'Almuerzo'
                              : log.meal_type === 'dinner'
                              ? 'Cena'
                              : 'Snack'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {log.source === 'gemini_photo'
                              ? '📸 Foto Gemini'
                              : log.source === 'barcode'
                              ? '🏷️ Barcode'
                              : log.source === 'ai_natural'
                              ? '✨ IA'
                              : '⚡ Rápido'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{log.food_name}</h4>
                        <p className="text-xs text-slate-400">
                          Proteína: <b className="text-slate-200">{log.protein_g}g</b> · Carbos:{' '}
                          <b className="text-slate-200">{log.carbs_g}g</b> · Grasas:{' '}
                          <b className="text-slate-200">{log.fat_g}g</b>
                        </p>

                        {/* Botón Fit-Maker */}
                        {log.total_calories > 400 && (
                          <button
                            onClick={() => setFitMakerTarget({ name: log.food_name, calories: log.total_calories })}
                            className="mt-1 text-[11px] text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                          >
                            <ChefHat className="w-3.5 h-3.5" /> Ver Versión Fitness con IA
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-extrabold text-emerald-400">{log.total_calories} kcal</span>
                        <button
                          onClick={() => toggleFavoriteMeal(log)}
                          title="Guardar o quitar de favoritos"
                          className="text-slate-600 hover:text-rose-400 transition"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favoriteFoods.some((f) => f.name === log.food_name)
                                ? 'fill-rose-400 text-rose-400'
                                : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteFoodLog(log.id)}
                          className="text-slate-600 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 2: ESCÁNER FOTO IA (CORE DE LA APP) */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="text-center max-w-md mx-auto">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                Motor Multimodal Gemini 2.5 Flash
              </span>
              <h2 className="text-2xl font-black text-white">Escáner Nutricional con Cámara</h2>
              <p className="text-xs text-slate-400 mt-1">
                Apunta al plato. La inteligencia artificial identificará los ingredientes, estimará el gramaje y calculará calorías y macronutrientes al instante.
              </p>
            </div>

            {/* Alternar entre Foto de Plato y OCR de Etiqueta */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowLabelScanner(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-md"
              >
                📸 Foto del Plato
              </button>
              <button
                type="button"
                onClick={() => setShowLabelScanner(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                📄 Leer Tabla Nutricional (OCR)
              </button>
            </div>

            {/* Selector de Tiempo de Comida */}
            <div className="flex justify-center gap-2">
              {[
                { id: 'breakfast', label: 'Desayuno' },
                { id: 'lunch', label: 'Almuerzo' },
                { id: 'dinner', label: 'Cena' },
                { id: 'snack', label: 'Snack' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMealType(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedMealType === m.id
                      ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Área de Cámara */}
            <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[260px] border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/60 transition overflow-hidden relative group">
              {imagePreview ? (
                <div className="relative w-full h-80">
                  <img src={imagePreview} alt="Comida capturada" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700">
                      Cambiar foto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400 p-6 text-center">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl mb-3 text-emerald-400">
                    <Camera className="w-12 h-12" />
                  </div>
                  <span className="text-sm font-bold text-white">Tomar foto o subir imagen del plato</span>
                  <span className="text-xs text-slate-500 mt-1 max-w-xs">
                    Compatible con la cámara trasera de tu teléfono móvil o archivos locales
                  </span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            </label>

            {/* Botón de Análisis */}
            {imagePreview && (
              <button
                onClick={analyzeFoodWithGemini}
                disabled={analyzing}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/25"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Analizando porciones y micronutrientes con Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Calcular Calorías y Registrar Plato
                  </>
                )}
              </button>
            )}

            {/* Resultado del Análisis en Vivo */}
            {lastAnalysisResult && (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Detectado con éxito
                    </span>
                    <h3 className="text-lg font-bold text-white">{lastAnalysisResult.foodName}</h3>
                  </div>
                  {lastAnalysisResult.healthScore && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Calidad</span>
                      <span className="text-sm font-black text-white">{lastAnalysisResult.healthScore}/100</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl text-center border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Calorías</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {lastAnalysisResult.totalCalories} kcal
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Proteína</span>
                    <span className="text-sm font-bold text-white">{lastAnalysisResult.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Carbos</span>
                    <span className="text-sm font-bold text-white">{lastAnalysisResult.carbsG}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Grasas</span>
                    <span className="text-sm font-bold text-white">{lastAnalysisResult.fatG}g</span>
                  </div>
                </div>

                {lastAnalysisResult.items && (
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-1">Porciones estimadas:</span>
                    <ul className="text-xs text-slate-400 space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      {lastAnalysisResult.items.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between">
                          <span>• {item.name} (~{item.estimatedGrams}g)</span>
                          <span className="text-slate-300 font-medium">{item.calories} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastAnalysisResult.advice && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200">
                    💡 <strong>Consejo del Nutricionista IA:</strong> {lastAnalysisResult.advice}
                  </div>
                )}

                <button
                  onClick={() => setFitMakerTarget({ name: lastAnalysisResult.foodName, calories: lastAnalysisResult.totalCalories })}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <ChefHat className="w-4 h-4" /> Generar Versión Fitness de este Plato con IA
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 3: PROGRESO Y ANALÍTICA */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Progreso & Medidas Corporales</h2>
                <p className="text-xs text-slate-400">Evolución del peso, curva metabólica y cumplimiento calórico</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAchievements(true)}
                  className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Award className="w-4 h-4" /> Medallas
                </button>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Scale className="w-4 h-4" /> Registrar Peso
                </button>
              </div>
            </div>

            <TrendCharts weightHistory={weightHistory} calorieHistory={calorieHistoryData} currentGoal={effectiveCalorieGoal} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 4: OBJETIVOS & METAS */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block mb-0.5">
                Cálculo Antropométrico Clínico
              </span>
              <h2 className="text-xl font-bold text-white">Objetivos Calóricos y Macronutrientes</h2>
              <p className="text-xs text-slate-400 mt-1">
                Fórmula Mifflin-St Jeor con multiplicadores de actividad física y presets de dieta.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Peso Actual (kg):</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWeightKg(val);
                    recalculateGoals(val, heightCm, age, gender, activityLevel, fitnessGoal, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Altura (cm):</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeightCm(val);
                    recalculateGoals(weightKg, val, age, gender, activityLevel, fitnessGoal, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Edad:</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAge(val);
                    recalculateGoals(weightKg, heightCm, val, gender, activityLevel, fitnessGoal, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sexo Biológico:</label>
                <select
                  value={gender}
                  onChange={(e) => {
                    const val = e.target.value as Gender;
                    setGender(val);
                    recalculateGoals(weightKg, heightCm, age, val, activityLevel, fitnessGoal, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nivel de Actividad Física:</label>
                <select
                  value={activityLevel}
                  onChange={(e) => {
                    const val = e.target.value as ActivityLevel;
                    setActivityLevel(val);
                    recalculateGoals(weightKg, heightCm, age, gender, val, fitnessGoal, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} - {item.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Nutricional:</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => {
                    const val = e.target.value as FitnessGoal;
                    setFitnessGoal(val);
                    recalculateGoals(weightKg, heightCm, age, gender, activityLevel, val, macroPreset);
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  {Object.entries(GOAL_ADJUSTMENTS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} ({item.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets de Macros */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">Preset de Macronutrientes:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(MACRO_PRESET_CONFIGS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const val = key as MacroPreset;
                      setMacroPreset(val);
                      recalculateGoals(weightKg, heightCm, age, gender, activityLevel, fitnessGoal, val);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      macroPreset === key
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Calorías Objetivo</span>
                <span className="text-xl font-black text-emerald-400">{calorieGoal} kcal/día</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Proteína</span>
                <span className="text-sm font-bold text-white">{proteinGoalG}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Carbohidratos</span>
                <span className="text-sm font-bold text-white">{carbsGoalG}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Grasas</span>
                <span className="text-sm font-bold text-white">{fatGoalG}g</span>
              </div>
            </div>

            {/* Ciclo de Carbohidratos */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Ciclo de Carbohidratos (Carb Cycling)</span>
                <span className="text-xs text-slate-400">
                  +15% de calorías en días de entrenamiento y -15% en días de descanso.
                </span>
              </div>
              <input
                type="checkbox"
                checked={carbCyclingEnabled}
                onChange={(e) => setCarbCyclingEnabled(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-emerald-500 accent-emerald-500"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando perfil...
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> ¡Perfil y Metas Guardados!
                </>
              ) : (
                'Actualizar y Guardar Configuración'
              )}
            </button>
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* TODOS LOS MODALES INTERACTIVOS */}
      {/* ========================================================================= */}
      <BarcodeScannerModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        onAddFood={handleAddGenericFood}
        defaultMealType={selectedMealType}
      />

      <LabelScannerModal
        isOpen={showLabelScanner}
        onClose={() => setShowLabelScanner(false)}
        defaultMealType={selectedMealType}
        onAddFood={handleAddGenericFood}
      />

      <NaturalAiSearchModal
        isOpen={showNaturalAiModal}
        onClose={() => setShowNaturalAiModal(false)}
        weightKg={weightKg}
        heightCm={heightCm}
        userGoal={GOAL_ADJUSTMENTS[fitnessGoal]?.label || 'Equilibrado'}
        defaultMealType={selectedMealType}
        onAddFood={handleAddGenericFood}
      />

      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        defaultMealType={selectedMealType}
        onAddFood={handleAddGenericFood}
      />

      <ExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        weightKg={weightKg}
        onAddExercise={handleAddExercise}
      />

      <WeightTrackerModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        currentWeightKg={weightKg}
        calorieGoal={calorieGoal}
        onSaveWeight={handleSaveWeightLog}
      />

      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        userEmail={session.user.email || 'usuario@nutriscan.ai'}
        foodLogs={foodLogs}
        weightKg={weightKg}
        heightCm={heightCm}
        calorieGoal={calorieGoal}
      />

      <NutritionCoachModal
        isOpen={showNutritionCoach}
        onClose={() => setShowNutritionCoach(false)}
        context={{
          caloriesRemaining,
          caloriesConsumed: caloriesConsumedToday,
          calorieGoal: effectiveCalorieGoal,
          proteinRemaining: Math.max(0, proteinGoalG - Math.round(proteinConsumedToday)),
          carbsRemaining: Math.max(0, carbsGoalG - Math.round(carbsConsumedToday)),
          fatRemaining: Math.max(0, fatGoalG - Math.round(fatConsumedToday)),
          weightKg,
          heightCm,
          goal: GOAL_ADJUSTMENTS[fitnessGoal]?.label || 'Equilibrado',
        }}
        onAddFood={handleAddGenericFood}
      />

      <FastingTimerModal
        isOpen={showFastingTimer}
        onClose={() => setShowFastingTimer(false)}
      />

      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        streakCount={streakCount}
        proteinConsumedG={Math.round(proteinConsumedToday)}
        proteinGoalG={proteinGoalG}
        waterCurrentMl={waterMl}
        waterGoalMl={Math.round(weightKg * 35)}
        hasExercises={filteredExerciseLogs.length > 0}
        hasPhotoLogs={foodLogs.some((f) => f.source === 'gemini_photo')}
        calorieDiff={effectiveCalorieGoal - caloriesConsumedToday}
      />

      {fitMakerTarget && (
        <FitMakerModal
          isOpen={Boolean(fitMakerTarget)}
          onClose={() => setFitMakerTarget(null)}
          initialDishName={fitMakerTarget.name}
          initialCalories={fitMakerTarget.calories}
          onAddFood={handleAddGenericFood}
        />
      )}
    </div>
  );
}
