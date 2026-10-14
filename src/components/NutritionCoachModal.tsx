// src/components/NutritionCoachModal.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Bot, User, Plus, Check } from 'lucide-react';

interface NutritionCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    caloriesRemaining: number;
    caloriesConsumed: number;
    calorieGoal: number;
    proteinRemaining: number;
    carbsRemaining: number;
    fatRemaining: number;
    weightKg: number;
    heightCm: number;
    goal: string;
  };
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

interface Message {
  role: 'assistant' | 'user';
  text: string;
  suggestedMeal?: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    ingredients?: string[];
  };
}

export function NutritionCoachModal({
  isOpen,
  onClose,
  context,
  onAddFood,
}: NutritionCoachModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `¡Hola! Soy tu Nutriólogo Deportivo IA. Veo que hoy te quedan **${context.caloriesRemaining} kcal** y **${context.proteinRemaining}g de proteína** para completar tu meta. ¿En qué te puedo ayudar hoy?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/nutrition-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          context,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al consultar al nutricionista');

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.reply,
          suggestedMeal: data.suggestedMeal,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { role: 'assistant', text: 'Lo siento, tuve un problema temporal al procesar tu solicitud. Intenta de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddSuggestedMeal(meal: any) {
    onAddFood({
      name: meal.name,
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      mealType: 'dinner',
      source: 'ai_natural',
    });
    alert(`¡Plato "${meal.name}" registrado en tu diario!`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header con Contexto */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-none">Nutriólogo Deportivo IA</h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Gemini 2.5 Flash Coach
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges de macros restantes */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
            <span className="bg-slate-800/80 text-emerald-400 px-2 py-0.5 rounded-md border border-slate-700">
              {context.caloriesRemaining} kcal restantes
            </span>
            <span className="bg-slate-800/80 text-emerald-400 px-2 py-0.5 rounded-md border border-slate-700">
              {context.proteinRemaining}g proteína restante
            </span>
            <span className="bg-slate-800/80 text-sky-400 px-2 py-0.5 rounded-md border border-slate-700">
              {context.carbsRemaining}g carbos
            </span>
            <span className="bg-slate-800/80 text-amber-400 px-2 py-0.5 rounded-md border border-slate-700">
              {context.fatRemaining}g grasas
            </span>
          </div>
        </div>

        {/* Mensajes del Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block ${
                    m.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Tarjeta de comida sugerida si Gemini recomendó una */}
                {m.suggestedMeal && (
                  <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                        Plato Sugerido
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {m.suggestedMeal.calories} kcal
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-xs">{m.suggestedMeal.name}</h5>
                    <div className="text-[10px] text-slate-400 flex gap-2">
                      <span>P: <b className="text-slate-200">{m.suggestedMeal.proteinG}g</b></span>
                      <span>C: <b className="text-slate-200">{m.suggestedMeal.carbsG}g</b></span>
                      <span>G: <b className="text-slate-200">{m.suggestedMeal.fatG}g</b></span>
                    </div>

                    <button
                      onClick={() => handleAddSuggestedMeal(m.suggestedMeal)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar este plato en mi diario
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>El nutricionista está analizando tus macros...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias Rápidas */}
        <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto scrollbar-none">
          {[
            '¿Qué ceno con mis macros restantes?',
            'Idea de snack rápido con proteína',
            '¿Cómo compenso si comí de más al almuerzo?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition whitespace-nowrap border border-slate-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Pregúntale lo que quieras sobre tu dieta..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

