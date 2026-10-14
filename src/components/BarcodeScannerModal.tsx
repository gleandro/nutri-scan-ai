// src/components/BarcodeScannerModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Barcode, Camera, Loader2, Check, AlertCircle, Search } from 'lucide-react';
import { fetchProductByBarcode, BarcodeProduct } from '@/lib/open-food-facts';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
    source: string;
  }) => void;
  defaultMealType?: string;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onAddFood,
  defaultMealType = 'lunch',
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [amountGrams, setAmountGrams] = useState(100);
  const [mealType, setMealType] = useState(defaultMealType);
  const [scannerActive, setScannerActive] = useState(false);

  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setProduct(null);
      setErrorMsg('');
      setManualCode('');
    }
  }, [isOpen]);

  async function handleSearch(codeToSearch?: string) {
    const code = codeToSearch || manualCode;
    if (!code.trim()) return;

    setSearching(true);
    setErrorMsg('');
    setProduct(null);

    const res = await fetchProductByBarcode(code);
    setSearching(false);

    if (res) {
      setProduct(res);
      stopScanner();
    } else {
      setErrorMsg(`No se encontró ningún producto con el código "${code}". Puedes ingresarlo manualmente o verificar el número.`);
    }
  }

  async function startScanner() {
    setErrorMsg('');
    setScannerActive(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          stopScanner();
          handleSearch(decodedText);
        },
        () => {
          // Callback de frame no detectado (silenciado)
        }
      );
    } catch (err: any) {
      console.warn('Error iniciando cámara para código de barras:', err);
      setScannerActive(false);
      setErrorMsg('No se pudo acceder a la cámara. Por favor escribe el código de barras manualmente abajo.');
    }
  }

  function stopScanner() {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        });
      } catch (e) {
        // Ignorar si ya estaba detenido
      }
    }
    setScannerActive(false);
  }

  if (!isOpen) return null;

  // Cálculos proporcionales según los gramos ingresados
  const factor = amountGrams / 100;
  const currentCalories = product ? Math.round(product.caloriesPer100g * factor) : 0;
  const currentProtein = product ? Number((product.proteinPer100g * factor).toFixed(1)) : 0;
  const currentCarbs = product ? Number((product.carbsPer100g * factor).toFixed(1)) : 0;
  const currentFat = product ? Number((product.fatPer100g * factor).toFixed(1)) : 0;

  function handleConfirmAdd() {
    if (!product) return;
    onAddFood({
      name: `${product.name} (${product.brand})`,
      calories: currentCalories,
      proteinG: currentProtein,
      carbsG: currentCarbs,
      fatG: currentFat,
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
            <Barcode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Escanear Código de Barras</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Cámara / Visor */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
            <div id="barcode-reader" className="w-full rounded-xl overflow-hidden mb-3 bg-black min-h-[160px] flex items-center justify-center">
              {!scannerActive && (
                <div className="flex flex-col items-center py-6 text-slate-500">
                  <Barcode className="w-12 h-12 mb-2 text-slate-600" />
                  <span className="text-xs">Cámara inactiva</span>
                </div>
              )}
            </div>

            {!scannerActive ? (
              <button
                onClick={startScanner}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" /> Activar Cámara del Celular / PC
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full py-2 bg-red-950/60 border border-red-800 text-red-300 font-semibold text-xs rounded-xl transition"
              >
                Detener Cámara
              </button>
            )}
          </div>

          {/* Búsqueda manual de código */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              O ingresa el código numérico manualmente:
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ej. 7501000111223"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-1.5 transition"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </form>
          </div>

          {/* Mensaje de error */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tarjeta del Producto Encontrado */}
          {product && (
            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
              <div className="flex gap-3 items-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded-xl bg-slate-900 p-1 border border-slate-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                    <Barcode className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {product.brand}
                  </span>
                  <h4 className="font-bold text-white text-sm line-clamp-2">{product.name}</h4>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {product.caloriesPer100g} kcal por cada 100g
                  </span>
                </div>
              </div>

              {/* Ajuste de Porción */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Porción a consumir (g / ml):</label>
                  <input
                    type="number"
                    min={1}
                    value={amountGrams}
                    onChange={(e) => setAmountGrams(Number(e.target.value) || 1)}
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
                    <option value="snack">Snack / Merienda</option>
                  </select>
                </div>
              </div>

              {/* Nutrientes calculados */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex justify-between items-center text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Calorías</span>
                  <span className="text-base font-extrabold text-emerald-400">{currentCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Proteína</span>
                  <span className="text-sm font-bold text-white">{currentProtein}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Carbos</span>
                  <span className="text-sm font-bold text-white">{currentCarbs}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Grasas</span>
                  <span className="text-sm font-bold text-white">{currentFat}g</span>
                </div>
              </div>

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

