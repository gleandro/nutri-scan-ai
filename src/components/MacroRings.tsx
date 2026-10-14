// src/components/MacroRings.tsx
'use client';

import React from 'react';
import { Flame, Dumbbell, Award, ArrowUpRight } from 'lucide-react';

interface MacroRingsProps {
  calorieGoal: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinGoalG: number;
  proteinConsumedG: number;
  carbsGoalG: number;
  carbsConsumedG: number;
  fatGoalG: number;
  fatConsumedG: number;
  streakCount?: number;
}

export function MacroRings({
  calorieGoal,
  caloriesConsumed,
  caloriesBurned,
  proteinGoalG,
  proteinConsumedG,
  carbsGoalG,
  carbsConsumedG,
  fatGoalG,
  fatConsumedG,
  streakCount = 1,
}: MacroRingsProps) {
  // Fórmula clásica: Objetivo - Consumidas + Ejercicio Quemado
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed + caloriesBurned);
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / (calorieGoal || 1)) * 100));

  const proteinPercent = Math.min(100, Math.round((proteinConsumedG / (proteinGoalG || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((carbsConsumedG / (carbsGoalG || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((fatConsumedG / (fatGoalG || 1)) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Fondo con brillo sutil */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado con Racha */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Balance Energético Diario</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            Calorías Restantes
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
          <span className="text-xs font-bold text-amber-300">Racha: {streakCount} {streakCount === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      {/* Grid Central: Calorías Restantes & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Anillo de Calorías Principal */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Anillo circular */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={427.25}
                strokeDashoffset={427.25 - (427.25 * caloriePercent) / 100}
                strokeLinecap="round"
                className="text-emerald-400 transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>

            {/* Texto en el centro */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {caloriesRemaining}
              </span>
              <span className="text-xs text-slate-400 font-medium">kcal restantes</span>
              <span className="text-[10px] text-emerald-400/90 font-semibold mt-0.5">
                {caloriePercent}% del objetivo
              </span>
            </div>
          </div>

          {/* Ecuación resumida */}
          <div className="flex items-center justify-between w-full max-w-xs text-xs text-slate-400 mt-4 px-2 py-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase">Meta</span>
              <span className="font-semibold text-white">{calorieGoal}</span>
            </div>
            <span className="text-slate-600 font-bold">-</span>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase">Comida</span>
              <span className="font-semibold text-rose-400">{caloriesConsumed}</span>
            </div>
            <span className="text-slate-600 font-bold">+</span>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase">Ejercicio</span>
              <span className="font-semibold text-sky-400">{caloriesBurned}</span>
            </div>
          </div>
        </div>

        {/* Barras de los 3 Macronutrientes */}
        <div className="md:col-span-7 space-y-4">
          {/* Proteínas */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Proteínas</span>
              </div>
              <span className="text-xs text-slate-300">
                <b className="text-emerald-400 font-bold">{proteinConsumedG}g</b> / {proteinGoalG}g ({proteinPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-xs font-bold text-white">Carbohidratos</span>
              </div>
              <span className="text-xs text-slate-300">
                <b className="text-sky-400 font-bold">{carbsConsumedG}g</b> / {carbsGoalG}g ({carbsPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-500 rounded-full"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Grasas */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-white">Grasas</span>
              </div>
              <span className="text-xs text-slate-300">
                <b className="text-amber-400 font-bold">{fatConsumedG}g</b> / {fatGoalG}g ({fatPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500 rounded-full"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

