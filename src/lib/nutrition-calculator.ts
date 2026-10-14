// src/lib/nutrition-calculator.ts
// Fórmulas científicas antropométricas (Mifflin-St Jeor, Harris-Benedict) y TDEE Adaptativo

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 
  | 'deficit_aggressive'  // -500 kcal / día
  | 'deficit_moderate'    // -300 kcal / día
  | 'maintenance'         // 0 kcal
  | 'surplus_lean'        // +250 kcal / día
  | 'surplus_heavy';       // +500 kcal / día

export type MacroPreset = 'balanced' | 'high_protein' | 'keto' | 'low_carb' | 'custom';

export interface MacroDistribution {
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface ProfileCalculationInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  macroPreset?: MacroPreset;
  customProteinPct?: number;
  customCarbsPct?: number;
  customFatPct?: number;
}

/**
 * 1. Tasa Metabólica Basal (BMR) - Fórmula Mifflin-St Jeor (Estándar de Oro Clínico)
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (!weightKg || !heightCm || !age) return 1600;
  
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Multiplicadores de Nivel de Actividad Física
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { factor: number; label: string; desc: string }> = {
  sedentary: { factor: 1.2, label: 'Sedentario', desc: 'Trabajo de oficina, poco o ningún ejercicio' },
  light: { factor: 1.375, label: 'Ligero', desc: 'Ejercicio ligero 1 a 3 días por semana' },
  moderate: { factor: 1.55, label: 'Moderado', desc: 'Entrenamiento moderado 3 a 5 días por semana' },
  active: { factor: 1.725, label: 'Activo', desc: 'Entrenamiento intenso 6 a 7 días por semana' },
  very_active: { factor: 1.9, label: 'Muy Activo', desc: 'Entrenamientos dobles o trabajo físico muy demandante' },
};

/**
 * 2. Gasto Energético Total Diario (TDEE / Mantenimiento)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * 3. Calorías Objetivo según la Meta
 */
export const GOAL_ADJUSTMENTS: Record<FitnessGoal, { delta: number; label: string; desc: string }> = {
  deficit_aggressive: { delta: -500, label: 'Pérdida Rápida', desc: 'Déficit de ~500 kcal/día (~0.5 kg/semana)' },
  deficit_moderate: { delta: -300, label: 'Pérdida Gradual', desc: 'Déficit sostenible de ~300 kcal/día' },
  maintenance: { delta: 0, label: 'Mantenimiento', desc: 'Mantener peso y recomposición corporal' },
  surplus_lean: { delta: 250, label: 'Volumen Limpio', desc: 'Superávit moderado para ganar músculo magro' },
  surplus_heavy: { delta: 500, label: 'Volumen Máximo', desc: 'Superávit alto para fuerza y peso rápido' },
};

export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  const adjustment = GOAL_ADJUSTMENTS[goal]?.delta ?? 0;
  return Math.max(1200, Math.round(tdee + adjustment));
}

/**
 * 4. Presets de Distribución de Macronutrientes
 */
export const MACRO_PRESET_CONFIGS: Record<Exclude<MacroPreset, 'custom'>, { protein: number; carbs: number; fat: number; label: string }> = {
  balanced: { protein: 30, carbs: 40, fat: 30, label: 'Equilibrada (30P / 40C / 30G)' },
  high_protein: { protein: 40, carbs: 35, fat: 25, label: 'Alta en Proteína / Fitness (40P / 35C / 25G)' },
  low_carb: { protein: 35, carbs: 20, fat: 45, label: 'Baja en Carbohidratos (35P / 20C / 45G)' },
  keto: { protein: 25, carbs: 5, fat: 70, label: 'Cetogénica / Keto (25P / 5C / 70G)' },
};

/**
 * Calcula los gramos de macronutrientes a partir de las calorías totales
 */
export function calculateMacros(
  calories: number,
  preset: MacroPreset = 'balanced',
  customP = 30,
  customC = 40,
  customF = 30
): MacroDistribution {
  let pPct = customP;
  let cPct = customC;
  let fPct = customF;

  if (preset !== 'custom' && MACRO_PRESET_CONFIGS[preset]) {
    pPct = MACRO_PRESET_CONFIGS[preset].protein;
    cPct = MACRO_PRESET_CONFIGS[preset].carbs;
    fPct = MACRO_PRESET_CONFIGS[preset].fat;
  }

  // Normalizar porcentajes si la suma no es 100
  const totalPct = pPct + cPct + fPct || 100;
  pPct = (pPct / totalPct) * 100;
  cPct = (cPct / totalPct) * 100;
  fPct = (fPct / totalPct) * 100;

  // Proteína: 4 kcal/g, Carbos: 4 kcal/g, Grasas: 9 kcal/g
  const proteinG = Math.round((calories * (pPct / 100)) / 4);
  const carbsG = Math.round((calories * (cPct / 100)) / 4);
  const fatG = Math.round((calories * (fPct / 100)) / 9);

  return {
    proteinG,
    carbsG,
    fatG,
    proteinPct: Math.round(pPct),
    carbsPct: Math.round(cPct),
    fatPct: Math.round(fPct),
  };
}

/**
 * 5. Ciclo de Carbohidratos (Carb-cycling / Días de Entrenamiento vs Descanso)
 */
export function calculateCarbCycling(baseCalories: number, macros: MacroDistribution) {
  // Días de entrenamiento: +15% calorías, mayoritariamente carbohidratos
  const workoutCalories = Math.round(baseCalories * 1.15);
  const workoutCarbsG = Math.round(macros.carbsG * 1.3);

  // Días de descanso: -15% calorías, menos carbohidratos, grasas de soporte
  const restCalories = Math.round(baseCalories * 0.85);
  const restCarbsG = Math.round(macros.carbsG * 0.7);

  return {
    workoutDay: {
      calories: workoutCalories,
      proteinG: macros.proteinG,
      carbsG: workoutCarbsG,
      fatG: macros.fatG,
    },
    restDay: {
      calories: restCalories,
      proteinG: macros.proteinG,
      carbsG: restCarbsG,
      fatG: macros.fatG,
    },
  };
}

/**
 * 6. TDEE Adaptativo: Recalcula calorías dinámicamente según la pérdida o ganancia real de peso
 * 1 kg de grasa corporal almacena aproximadamente ~7700 kcal.
 */
export function calculateAdaptiveTDEE(
  previousWeightKg: number,
  currentWeightKg: number,
  daysElapsed: number,
  avgDailyIntake: number
): { realTDEE: number; weightDeltaKg: number; weeklyRateKg: number } {
  if (daysElapsed <= 0) {
    return { realTDEE: avgDailyIntake, weightDeltaKg: 0, weeklyRateKg: 0 };
  }

  const weightDeltaKg = currentWeightKg - previousWeightKg;
  // Gasto calórico derivado de la variación de peso corporal
  const caloricSurplusOrDeficit = (weightDeltaKg * 7700) / daysElapsed;
  const realTDEE = Math.round(avgDailyIntake - caloricSurplusOrDeficit);
  const weeklyRateKg = Number(((weightDeltaKg / daysElapsed) * 7).toFixed(2));

  return {
    realTDEE: Math.max(1200, realTDEE),
    weightDeltaKg: Number(weightDeltaKg.toFixed(2)),
    weeklyRateKg,
  };
}

