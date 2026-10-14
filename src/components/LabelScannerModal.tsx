// src/components/LabelScannerModal.tsx
'use client';

import React, { useState } from 'react';
import { X, FileText, Camera, Loader2, Check, AlertCircle } from 'lucide-react';

interface LabelScannerModalProps {
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

export function LabelScannerModal({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  onAddFood,
}: LabelScannerModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [servingsCount, setServingsCount] = useState(1);
  const [mealType, setMealType] = useState(defaultMealType);

  if (!isOpen) return null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setResult(null);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyzeLabel() {
    if (!imagePreview) return;
    setAnalyzing(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze-nutrition-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imagePreview, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo leer la etiqueta');

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la imagen de la etiqueta');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleConfirmAdd() {
    if (!result) return;
    const finalCalories = Math.round((result.caloriesPerServing || 0) * servingsCount);
    const finalProtein = Number(((result.proteinG || 0) * servingsCount).toFixed(1));
    const finalCarbs = Number(((result.carbsG || 0) * servingsCount).toFixed(1));
    const finalFat = Number(((result.fatG || 0) * servingsCount).toFixed(1));

    onAddFood({
      name: `${result.productName} (${servingsCount} porc. de ${result.servingSizeG}g)`,
      calories: finalCalories,
      proteinG: finalProtein,
      carbsG: finalCarbs,
      fatG: finalFat,
      mealType,
      source: 'barcode',
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Escanear Tabla Nutricional (OCR)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-400">
            Toma una foto clara a la tabla de información nutrimental o ingredientes al reverso del paquete. Gemini Vision extraerá automáticamente todos los valores.
          </p>

          {/* Área de Cámara */}
          <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/60 transition overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="Etiqueta nutricional" className="max-h-56 w-full object-contain p-2" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                <Camera className="w-10 h-10 mb-2 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Tomar foto o subir foto de la tabla</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Asegúrate de que los números sean legibles</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </label>

          {imagePreview && !result && (
            <button
              onClick={handleAnalyzeLabel}
              disabled={analyzing}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Leyendo tabla nutricional con OCR...
                </>
              ) : (
                'Extraer Información Nutricional'
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resultado Extraído */}
          {result && (
            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Lectura Exitosa
                </span>
                <h4 className="font-bold text-white text-base">{result.productName}</h4>
                <span className="text-xs text-slate-400">Porción base: {result.servingSizeG} g/ml</span>
              </div>

              {/* Ajuste de Porciones */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Porciones consumidas:</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    value={servingsCount}
                    onChange={(e) => setServingsCount(Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tiempo de comida:</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white"
                  >
                    <option value="breakfast">Desayuno</option>
                    <option value="lunch">Almuerzo</option>
                    <option value="dinner">Cena</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              {/* Valores calculados */}
              <div className="grid grid-cols-4 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Calorías</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {Math.round(result.caloriesPerServing * servingsCount)} kcal
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Proteína</span>
                  <span className="text-sm font-bold text-white">
                    {Number((result.proteinG * servingsCount).toFixed(1))}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Carbos</span>
                  <span className="text-sm font-bold text-white">
                    {Number((result.carbsG * servingsCount).toFixed(1))}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Grasas</span>
                  <span className="text-sm font-bold text-white">
                    {Number((result.fatG * servingsCount).toFixed(1))}g
                  </span>
                </div>
              </div>

              {result.summary && (
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  {result.summary}
                </p>
              )}

              <button
                onClick={handleConfirmAdd}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" /> Registrar en el Diario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

