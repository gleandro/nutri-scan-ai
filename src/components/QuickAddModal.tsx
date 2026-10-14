// src/components/QuickAddModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: string;
  onAddFood: (food: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
    source: string;
  }) => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  defaultMealType = 'snack',
  onAddFood,
}: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [proteinG, setProteinG] = useState<number | ''>('');
  const [carbsG, setCarbsG] = useState<number | ''>('');
  const [fatG, setFatG] = useState<number | ''>('');
  const [mealType, setMealType] = useState(defaultMealType);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!calories) return;

    onAddFood({
      name: name.trim() || 'Comida Rápida',
      calories: Number(calories),
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
      mealType,
      source: 'quick_add',
    });

    setName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Registro Rápido de Calorías</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nombre o descripción (opcional):</label>
            <input
              type="text"
              placeholder="Ej. Almuerzo en restaurante, Snack libre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Calorías (kcal) *:</label>
              <input
                type="number"
                required
                min={1}
                placeholder="Ej. 450"
                value={calories}
                onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white font-bold text-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tiempo de comida:</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white"
              >
                <option value="breakfast">Desayuno</option>
                <option value="lunch">Almuerzo</option>
                <option value="dinner">Cena</option>
                <option value="snack">Snack / Merienda</option>
              </select>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Macronutrientes estimados (opcional):</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Proteínas (g)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Carbos (g)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Grasas (g)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition mt-2"
          >
            <Check className="w-4 h-4" /> Guardar Calorías Directas
          </button>
        </form>
      </div>
    </div>
  );
}

