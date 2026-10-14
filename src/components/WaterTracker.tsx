// src/components/WaterTracker.tsx
'use client';

import React from 'react';
import { Droplets, Plus, Minus, RotateCcw } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  weightKg: number;
  onChangeWater: (newMl: number) => void;
}

export function WaterTracker({ currentMl, weightKg, onChangeWater }: WaterTrackerProps) {
  // Meta recomendada estándar: 35 ml por cada kg de peso corporal
  const goalMl = Math.round((weightKg || 75) * 35);
  const percentage = Math.min(100, Math.round((currentMl / (goalMl || 1)) * 100));

  function addWater(amount: number) {
    const updated = Math.max(0, currentMl + amount);
    onChangeWater(updated);
  }

  function resetWater() {
    onChangeWater(0);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
            <Droplets className="w-5 h-5 fill-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Control de Hidratación</h3>
            <span className="text-xs text-slate-400">
              <strong className="text-cyan-400">{currentMl} ml</strong> de {goalMl} ml ({percentage}%)
            </span>
          </div>
        </div>

        {currentMl > 0 && (
          <button
            onClick={resetWater}
            title="Reiniciar agua de hoy"
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg transition text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Barra de Progreso de Agua */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Botones de acción rápida */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addWater(250)}
          className="flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> 250 ml (Vaso)
        </button>

        <button
          onClick={() => addWater(500)}
          className="flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> 500 ml (Botella)
        </button>

        {currentMl > 0 && (
          <button
            onClick={() => addWater(-250)}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition text-xs"
            title="Restar 250 ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

