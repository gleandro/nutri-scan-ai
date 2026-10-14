// src/components/ExerciseModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Dumbbell, Flame, Check, Plus } from 'lucide-react';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightKg: number;
  onAddExercise: (exercise: {
    activityName: string;
    durationMin: number;
    caloriesBurned: number;
  }) => void;
}

const PRESET_EXERCISES = [
  { id: 'weights', name: 'Entrenamiento de Pesas / Fuerza', met: 5.0, icon: '🏋️‍♂️' },
  { id: 'running', name: 'Running / Carrera continua', met: 8.5, icon: '🏃‍♂️' },
  { id: 'walking', name: 'Caminata rápida / Pasos', met: 3.8, icon: '🚶‍♂️' },
  { id: 'cycling', name: 'Ciclismo (bici de ruta o estática)', met: 7.5, icon: '🚴‍♂️' },
  { id: 'swimming', name: 'Natación', met: 7.0, icon: '🏊‍♂️' },
  { id: 'hiit', name: 'HIIT / Entrenamiento Funcional', met: 8.0, icon: '⚡' },
];

export function ExerciseModal({
  isOpen,
  onClose,
  weightKg,
  onAddExercise,
}: ExerciseModalProps) {
  const [selectedActivity, setSelectedActivity] = useState(PRESET_EXERCISES[0].id);
  const [durationMin, setDurationMin] = useState(45);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>('');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  // Cálculo MET: Calorías = (MET * 3.5 * pesoKg / 200) * minutos
  const currentPreset = PRESET_EXERCISES.find((p) => p.id === selectedActivity) || PRESET_EXERCISES[0];
  const calculatedCalories = isCustom
    ? Number(customCalories) || 0
    : Math.round(((currentPreset.met * 3.5 * (weightKg || 75)) / 200) * durationMin);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = isCustom ? (customName.trim() || 'Ejercicio Personalizado') : currentPreset.name;

    onAddExercise({
      activityName: finalName,
      durationMin: isCustom ? 0 : durationMin,
      caloriesBurned: calculatedCalories,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-lg">Registrar Ejercicio / Actividad</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`flex-1 py-2 rounded-lg transition ${
                !isCustom ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Actividades Populares
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex-1 py-2 rounded-lg transition ${
                isCustom ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual / Smartwatch
            </button>
          </div>

          {!isCustom ? (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de entrenamiento:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {PRESET_EXERCISES.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => setSelectedActivity(ex.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                        selectedActivity === ex.id
                          ? 'bg-sky-500/10 border-sky-500/50 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{ex.icon}</span>
                        {ex.name}
                      </span>
                      {selectedActivity === ex.id && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Duración del entrenamiento:</label>
                  <span className="text-xs font-bold text-sky-400">{durationMin} minutos</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre de la actividad:</label>
                <input
                  type="text"
                  placeholder="Ej. Partido de pádel, Sesión de crossfit..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Calorías quemadas (según Apple Watch, Garmin, Fitbit, etc.):
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 350"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white"
                />
              </div>
            </>
          )}

          {/* Resultado Calórico */}
          <div className="bg-sky-950/30 border border-sky-800/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-400">
                <Flame className="w-5 h-5 fill-sky-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Calorías Quemadas</span>
                <span className="text-xl font-extrabold text-white">{calculatedCalories} kcal</span>
              </div>
            </div>
            <span className="text-[11px] text-sky-300 bg-sky-900/50 px-2.5 py-1 rounded-lg">
              Se suma a tus calorías restantes
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4" /> Agregar al Balance Diario
          </button>
        </form>
      </div>
    </div>
  );
}

