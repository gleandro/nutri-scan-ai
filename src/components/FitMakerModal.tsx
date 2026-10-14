// src/components/FitMakerModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Loader2, ArrowRight, Check } from 'lucide-react';

interface FitMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDishName?: string;
  initialCalories?: number;
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

export function FitMakerModal({
  isOpen,
  onClose,
  initialDishName = '',
  initialCalories = 800,
  onAddFood,
}: FitMakerModalProps) {
  const [dishName, setDishName] = useState(initialDishName || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  async function handleGenerateFitVersion(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/fit-maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName,
          calories: initialCalories || 800,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      alert('Error generando versión fitness: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAddFitMeal() {
    if (!result) return;
    onAddFood({
      name: `Fit: ${result.fitDishName}`,
      calories: result.fitCalories,
      proteinG: result.fitProteinG,
      carbsG: result.fitCarbsG,
      fatG: result.fitFatG,
      mealType: 'lunch',
      source: 'ai_natural',
    });
    alert(`¡"${result.fitDishName}" agregado a tu diario!`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Fit-Maker con IA</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-400">
            Convierte cualquier plato tradicional o comida calórica en una versión fitness con hasta un 50% menos calorías y el doble de proteína.
          </p>

          <form onSubmit={handleGenerateFitVersion} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Hamburguesa doble con queso y papas, Lasagna, Pizza..."
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !dishName.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Reinventar
            </button>
          </form>

          {/* Resultado del Fit-Maker */}
          {result && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                    Alternativa Fitness Creada
                  </span>
                  <h4 className="font-bold text-white text-base">{result.fitDishName}</h4>
                </div>
                {result.calorieSavingsPct && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black px-2.5 py-1 rounded-xl">
                    -{result.calorieSavingsPct}% Calorías
                  </span>
                )}
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Calorías</span>
                  <span className="text-sm font-extrabold text-emerald-400">{result.fitCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Proteína</span>
                  <span className="text-xs font-bold text-white">{result.fitProteinG}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Carbos</span>
                  <span className="text-xs font-bold text-white">{result.fitCarbsG}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Grasas</span>
                  <span className="text-xs font-bold text-white">{result.fitFatG}g</span>
                </div>
              </div>

              {/* Sustituciones inteligentes */}
              {result.substitutions && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">Sustituciones Clave:</span>
                  <div className="space-y-1 text-xs">
                    {result.substitutions.map((sub: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-rose-400 line-through text-[11px]">{sub.original}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-400 font-semibold">{sub.replacement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredientes & Pasos */}
              {result.instructions && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Preparación rápida:</span>
                  <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    {result.instructions.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                onClick={handleAddFitMeal}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" /> Registrar esta receta fitness en mi diario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

