// src/components/AchievementsModal.tsx
'use client';

import React from 'react';
import { X, Award, Flame, Droplets, Dumbbell, Camera, Target, Barcode, Check } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  proteinConsumedG: number;
  proteinGoalG: number;
  waterCurrentMl: number;
  waterGoalMl: number;
  hasExercises: boolean;
  hasPhotoLogs: boolean;
  calorieDiff: number;
}

export function AchievementsModal({
  isOpen,
  onClose,
  streakCount,
  proteinConsumedG,
  proteinGoalG,
  waterCurrentMl,
  waterGoalMl,
  hasExercises,
  hasPhotoLogs,
  calorieDiff,
}: AchievementsModalProps) {
  if (!isOpen) return null;

  const BADGES = [
    {
      id: 'streak_3',
      name: 'Racha Implacable',
      desc: 'Registra tus comidas durante al menos 3 días consecutivos.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      unlocked: streakCount >= 3,
      progress: `${streakCount}/3 días`,
    },
    {
      id: 'protein_king',
      name: 'Maestro de la Proteína',
      desc: 'Alcanza el 90% o más de tu meta de proteína en un día.',
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      unlocked: proteinConsumedG >= proteinGoalG * 0.9,
      progress: `${proteinConsumedG}/${Math.round(proteinGoalG * 0.9)}g`,
    },
    {
      id: 'water_master',
      name: 'Hidratación Perfecta',
      desc: 'Completa tu requerimiento hídrico diario en el Water Tracker.',
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      unlocked: waterCurrentMl >= waterGoalMl,
      progress: `${waterCurrentMl}/${waterGoalMl} ml`,
    },
    {
      id: 'workout_warrior',
      name: 'Guerrero Fitness',
      desc: 'Registra al menos una sesión de entrenamiento o ejercicio hoy.',
      icon: <Dumbbell className="w-5 h-5 text-sky-400" />,
      unlocked: hasExercises,
      progress: hasExercises ? 'Completado' : 'Pendiente',
    },
    {
      id: 'gemini_visionary',
      name: 'Ojo Biónico',
      desc: 'Analiza tu primer plato utilizando la cámara con Gemini Vision.',
      icon: <Camera className="w-5 h-5 text-violet-400" />,
      unlocked: hasPhotoLogs,
      progress: hasPhotoLogs ? 'Desbloqueado' : '0/1 fotos',
    },
    {
      id: 'calorie_sniper',
      name: 'Francotirador Calórico',
      desc: 'Finaliza el día a menos de 100 kcal de diferencia de tu meta diaria.',
      icon: <Target className="w-5 h-5 text-rose-400" />,
      unlocked: Math.abs(calorieDiff) <= 100,
      progress: `${Math.abs(calorieDiff)} kcal de desvío`,
    },
  ];

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Medallas y Logros</h3>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {unlockedCount} de {BADGES.length} desbloqueados
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                badge.unlocked
                  ? 'bg-slate-950 border-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    badge.unlocked
                      ? 'bg-slate-900 border-amber-500/40 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    {badge.name}
                    {badge.unlocked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{badge.desc}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    badge.unlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {badge.progress}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

