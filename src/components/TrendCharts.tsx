// src/components/TrendCharts.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Scale, Flame, Award } from 'lucide-react';

interface WeightEntry {
  date: string;
  weight: number;
}

interface CalorieDayEntry {
  dayName: string;
  calories: number;
  goal: number;
}

interface TrendChartsProps {
  weightHistory: WeightEntry[];
  calorieHistory: CalorieDayEntry[];
  currentGoal: number;
}

export function TrendCharts({ weightHistory, calorieHistory, currentGoal }: TrendChartsProps) {
  const [activeTab, setActiveTab] = useState<'calories' | 'weight'>('calories');

  // Cálculos para gráfico de peso
  const weights = weightHistory.map((w) => w.weight);
  const minWeight = weights.length ? Math.min(...weights) - 1 : 70;
  const maxWeight = weights.length ? Math.max(...weights) + 1 : 80;
  const weightRange = maxWeight - minWeight || 1;

  // Cálculos para gráfico de calorías
  const maxCalories = Math.max(...calorieHistory.map((c) => Math.max(c.calories, c.goal)), 2500);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Switch de pestaña */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Analítica & Progreso</span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            Tendencias y Evolución
          </h3>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('calories')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'calories'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Consumo Calórico
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'weight'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Historial de Peso
          </button>
        </div>
      </div>

      {activeTab === 'calories' ? (
        /* Gráfico de Barras de Calorías de los últimos 7 días */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Últimos 7 días de registro</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Dentro de la meta
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 ml-2" /> Objetivo: {currentGoal} kcal
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-800 relative">
            {/* Línea horizontal de meta calórica */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-emerald-400/40 pointer-events-none"
              style={{ bottom: `${(currentGoal / maxCalories) * 100}%` }}
            >
              <span className="absolute right-0 -top-4 text-[10px] text-emerald-400 font-semibold bg-slate-900 px-1">
                Meta ({currentGoal})
              </span>
            </div>

            {calorieHistory.map((item, idx) => {
              const heightPct = Math.min(100, Math.round((item.calories / maxCalories) * 100));
              const isOver = item.calories > item.goal * 1.1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip flotante */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 bg-slate-800 border border-slate-700 text-[11px] font-bold text-white px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                    {item.calories} kcal
                  </div>

                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                      isOver
                        ? 'bg-gradient-to-t from-amber-500 to-rose-400'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-400 hover:brightness-110'
                    }`}
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                  />
                  <span className="text-[11px] text-slate-400 mt-2 font-medium">{item.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Gráfico de Línea de Evolución del Peso */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Evolución en la báscula</span>
            <span className="font-semibold text-white">
              {weights.length > 0 ? `${weights[weights.length - 1]} kg actuales` : 'Sin registros'}
            </span>
          </div>

          {weightHistory.length <= 1 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-400">
              <Scale className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs">
                Registra tu peso en diferentes días con el botón <strong>"Registrar Peso"</strong> para ver tu curva de progreso.
              </p>
            </div>
          ) : (
            <div className="h-52 w-full pt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                {/* Líneas de cuadrícula */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />

                {/* Línea de tendencia */}
                {(() => {
                  const points = weightHistory.map((w, idx) => {
                    const x = (idx / (weightHistory.length - 1)) * 480 + 10;
                    const y = 140 - ((w.weight - minWeight) / weightRange) * 120;
                    return { x, y, weight: w.weight, date: w.date };
                  });

                  const pathD = points.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ''
                  );

                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#047857" stroke="#34d399" strokeWidth="2" />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {pt.weight}kg
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between text-[10px] text-slate-500 mt-3 px-1">
                {weightHistory.map((w, i) => (
                  <span key={i}>{w.date}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

