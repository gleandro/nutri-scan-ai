// src/components/FastingTimerModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Play, Square, Award, Flame } from 'lucide-react';

interface FastingTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FASTING_PROTOCOLS = [
  { id: '16_8', name: '16:8 Popular', fastHours: 16, eatHours: 8, desc: 'Ideal para principiantes y pérdida de grasa' },
  { id: '18_6', name: '18:6 Intermedio', fastHours: 18, eatHours: 6, desc: 'Autofagia y mayor quema de grasa' },
  { id: '14_10', name: '14:10 Suave', fastHours: 14, eatHours: 10, desc: 'Fácil adaptación metabólica' },
  { id: '20_4', name: '20:4 Guerrero', fastHours: 20, eatHours: 4, desc: 'Una sola ventana corta de alimentación' },
];

export function FastingTimerModal({ isOpen, onClose }: FastingTimerModalProps) {
  const [protocol, setProtocol] = useState(FASTING_PROTOCOLS[0].id);
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nutriscan_fasting_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsFasting(parsed.isFasting);
        setStartTime(parsed.startTime);
        setProtocol(parsed.protocol || FASTING_PROTOCOLS[0].id);
      } catch (e) {}
    }
  }, []);

  // Timer en vivo
  useEffect(() => {
    let interval: any;
    if (isFasting && startTime) {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  if (!isOpen) return null;

  const currentProtocol = FASTING_PROTOCOLS.find((p) => p.id === protocol) || FASTING_PROTOCOLS[0];
  const targetSeconds = currentProtocol.fastHours * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  function handleStartFast() {
    const now = Date.now();
    setIsFasting(true);
    setStartTime(now);
    localStorage.setItem('nutriscan_fasting_state', JSON.stringify({ isFasting: true, startTime: now, protocol }));
  }

  function handleStopFast() {
    setIsFasting(false);
    setStartTime(null);
    setElapsedSeconds(0);
    localStorage.removeItem('nutriscan_fasting_state');
  }

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Cronómetro de Ayuno Intermitente</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          {/* Selector de Protocolo si no está corriendo */}
          {!isFasting && (
            <div>
              <label className="text-xs text-slate-400 block mb-2 font-medium">Selecciona tu protocolo:</label>
              <div className="grid grid-cols-2 gap-2">
                {FASTING_PROTOCOLS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProtocol(p.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                      protocol === p.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anillo de Tiempo */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="10" className="text-slate-800" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={427.25}
                strokeDashoffset={427.25 - (427.25 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-emerald-400 transition-all duration-500"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center text-center">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-400 font-semibold mt-0.5">
                {isFasting ? `Meta: ${currentProtocol.fastHours}h` : 'Ayuno Pausado'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1">
                {progressPercent}% completado
              </span>
            </div>
          </div>

          {/* Botón de Inicio / Pausa */}
          {!isFasting ? (
            <button
              onClick={handleStartFast}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Comenzar Ventana de Ayuno
            </button>
          ) : (
            <button
              onClick={handleStopFast}
              className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-rose-300" /> Finalizar y Romper Ayuno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

