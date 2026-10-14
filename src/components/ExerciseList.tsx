// src/components/ExerciseList.tsx
'use client';

import React from 'react';
import { Dumbbell, Flame, Clock, Trash2, Plus } from 'lucide-react';

export interface ExerciseItem {
  id: string;
  activity_name: string;
  duration_min: number;
  calories_burned: number;
  created_at?: string;
}

interface ExerciseListProps {
  exercises: ExerciseItem[];
  onDeleteExercise: (id: string) => void;
  onOpenAddModal: () => void;
}

export function ExerciseList({
  exercises,
  onDeleteExercise,
  onOpenAddModal,
}: ExerciseListProps) {
  const totalBurned = exercises.reduce((acc, ex) => acc + (Number(ex.calories_burned) || 0), 0);
  const totalMinutes = exercises.reduce((acc, ex) => acc + (Number(ex.duration_min) || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Sesiones de Ejercicio Registradas</h3>
            <span className="text-xs text-slate-400">
              {exercises.length === 0
                ? 'Ninguna actividad registrada hoy'
                : `${totalMinutes} min activos · ${totalBurned} kcal quemadas`}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-2 px-3.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md shadow-sky-500/10"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {/* Lista de entrenamientos */}
      {exercises.length === 0 ? (
        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
          No hay ejercicios registrados para hoy. ¡Registra tu entrenamiento de fuerza o cardio para sumar calorías a tu meta!
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 font-bold border border-slate-800 text-xs">
                  🏃
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{ex.activity_name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    {ex.duration_min > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {ex.duration_min} min
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sky-400 font-semibold">
                      <Flame className="w-3 h-3 fill-sky-400" /> {ex.calories_burned} kcal
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-sky-400 hidden sm:inline">
                  +{ex.calories_burned} kcal
                </span>
                <button
                  onClick={() => onDeleteExercise(ex.id)}
                  title="Eliminar registro de ejercicio"
                  className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

