// src/components/WeightTrackerModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Scale, Ruler, Zap, Check, TrendingDown, TrendingUp } from 'lucide-react';
import { calculateAdaptiveTDEE } from '@/lib/nutrition-calculator';

interface WeightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeightKg: number;
  calorieGoal: number;
  onSaveWeight: (log: {
    weightKg: number;
    waistCm?: number;
    chestCm?: number;
    armsCm?: number;
    notes?: string;
    newCalorieGoal?: number;
  }) => void;
}

export function WeightTrackerModal({
  isOpen,
  onClose,
  currentWeightKg,
  calorieGoal,
  onSaveWeight,
}: WeightTrackerModalProps) {
  const [newWeight, setNewWeight] = useState<number>(currentWeightKg || 75);
  const [waistCm, setWaistCm] = useState<number | ''>('');
  const [chestCm, setChestCm] = useState<number | ''>('');
  const [armsCm, setArmsCm] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [applyAdaptive, setApplyAdaptive] = useState(false);

  if (!isOpen) return null;

  // Cálculo de variación
  const weightDiff = Number((newWeight - (currentWeightKg || newWeight)).toFixed(2));
  // Simulación de estimación adaptativa si hubo cambio de peso (considerando 7 días transcurridos y calorías base)
  const adaptiveResult = calculateAdaptiveTDEE(currentWeightKg || newWeight, newWeight, 7, calorieGoal);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSaveWeight({
      weightKg: newWeight,
      waistCm: waistCm === '' ? undefined : Number(waistCm),
      chestCm: chestCm === '' ? undefined : Number(chestCm),
      armsCm: armsCm === '' ? undefined : Number(armsCm),
      notes: notes.trim() || undefined,
      newCalorieGoal: applyAdaptive && adaptiveResult.realTDEE !== calorieGoal ? adaptiveResult.realTDEE : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Registrar Peso y Medidas</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Peso Principal */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Peso Corporal Actual (kg)
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                step="0.1"
                required
                min={30}
                max={300}
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-3xl font-black text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
              />
              <span className="text-lg font-bold text-slate-400">kg</span>
            </div>

            {weightDiff !== 0 && (
              <div className="mt-2 text-xs flex items-center justify-center gap-1 font-semibold">
                {weightDiff < 0 ? (
                  <span className="text-emerald-400 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-0.5" /> {weightDiff} kg respecto al peso previo
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-0.5" /> +{weightDiff} kg respecto al peso previo
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Medidas corporales opcionales */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-slate-400" /> Medidas Corporales Opcionales (cm):
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Cintura</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="cm"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Pecho</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="cm"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Brazos</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="cm"
                  value={armsCm}
                  onChange={(e) => setArmsCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white text-center"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nota o sensaciones:</label>
            <input
              type="text"
              placeholder="Ej. Pesaje en ayunas, semana con buena energía..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
            />
          </div>

          {/* TDEE Adaptativo */}
          {weightDiff !== 0 && (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-xs font-bold text-white">Ajuste Dinámico de Calorías (TDEE Adaptativo)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Basado en tu nuevo peso, tu nuevo gasto metabólico estimado es de{' '}
                <strong className="text-emerald-400">{adaptiveResult.realTDEE} kcal/día</strong>.
              </p>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={applyAdaptive}
                  onChange={(e) => setApplyAdaptive(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-emerald-300 font-medium">
                  Actualizar mi meta diaria automáticamente a {adaptiveResult.realTDEE} kcal
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4" /> Guardar Nuevo Registro
          </button>
        </form>
      </div>
    </div>
  );
}

