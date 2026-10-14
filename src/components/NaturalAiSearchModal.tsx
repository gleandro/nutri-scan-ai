// src/components/NaturalAiSearchModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';

interface NaturalAiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightKg: number;
  heightCm: number;
  userGoal: string;
  defaultMealType?: string;
  onAddFood: (food: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
    source: string;
    breakdown?: any[];
  }) => void;
}

export function NaturalAiSearchModal({
  isOpen,
  onClose,
  weightKg,
  heightCm,
  userGoal,
  defaultMealType = 'lunch',
  onAddFood,
}: NaturalAiSearchModalProps) {
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState(defaultMealType);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/natural-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mealType,
          weightKg,
          heightCm,
          userGoal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo interpretar el plato');

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el motor de IA');
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmAdd() {
    if (!result) return;
    onAddFood({
      name: result.foodName,
      calories: result.totalCalories,
      proteinG: result.proteinG,
      carbsG: result.carbsG,
      fatG: result.fatG,
      mealType,
      source: 'ai_natural',
      breakdown: result.items,
    });
    setResult(null);
    setQuery('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Búsqueda Inteligente con IA</h3>
          </div>
          <button
            onClick={() => {
              setResult(null);
              setErrorMsg('');
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <p className="text-xs text-slate-400">
            Escribe de forma libre lo que comiste o bebiste (incluye medidas caseras como tazas, cucharadas o unidades). Gemini calculará automáticamente los gramos y macros exactos.
          </p>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Descripción de la comida:</label>
              <textarea
                rows={3}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. 2 huevos revueltos con 1 cucharada de aceite de oliva, 2 tostadas de pan integral y un café negro con 1 sobre de azúcar"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Momento del día:</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                >
                  <option value="breakfast">Desayuno</option>
                  <option value="lunch">Almuerzo</option>
                  <option value="dinner">Cena</option>
                  <option value="snack">Snack / Merienda</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Calculando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Interpretar con IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Plato detectado
                </span>
                <h4 className="font-bold text-white text-base">{result.foodName}</h4>
              </div>

              {/* Nutrientes calculados */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex justify-between items-center text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Calorías</span>
                  <span className="text-base font-extrabold text-emerald-400">{result.totalCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Proteína</span>
                  <span className="text-sm font-bold text-white">{result.proteinG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Carbos</span>
                  <span className="text-sm font-bold text-white">{result.carbsG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Grasas</span>
                  <span className="text-sm font-bold text-white">{result.fatG}g</span>
                </div>
              </div>

              {/* Desglose de ingredientes */}
              {result.items && result.items.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">Desglose calculado:</span>
                  <ul className="text-xs text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    {result.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center">
                        <span>• {item.name} (~{item.estimatedGrams}g)</span>
                        <span className="font-semibold text-slate-300">{item.calories} kcal</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.advice && (
                <p className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/50">
                  💡 <strong>Tip nutricional:</strong> {result.advice}
                </p>
              )}

              <button
                onClick={handleConfirmAdd}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" /> Agregar al Diario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

