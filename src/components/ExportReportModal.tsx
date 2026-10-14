// src/components/ExportReportModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Printer, Check, Share2, FileText } from 'lucide-react';

interface FoodLogItem {
  id: string;
  food_name: string;
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at?: string;
  meal_type?: string;
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  foodLogs: FoodLogItem[];
  weightKg: number;
  heightCm: number;
  calorieGoal: number;
}

export function ExportReportModal({
  isOpen,
  onClose,
  userEmail,
  foodLogs,
  weightKg,
  heightCm,
  calorieGoal,
}: ExportReportModalProps) {
  const [printMode, setPrintMode] = useState(false);

  if (!isOpen) return null;

  function exportCSV() {
    const headers = ['Fecha y Hora', 'Alimento / Plato', 'Tiempo de Comida', 'Calorías (kcal)', 'Proteínas (g)', 'Carbohidratos (g)', 'Grasas (g)'];
    
    const rows = foodLogs.map((log) => [
      log.created_at ? new Date(log.created_at).toLocaleString() : new Date().toLocaleString(),
      `"${(log.food_name || '').replace(/"/g, '""')}"`,
      log.meal_type || 'General',
      log.total_calories || 0,
      log.protein_g || 0,
      log.carbs_g || 0,
      log.fat_g || 0,
    ]);

    const csvContent = [
      `# Reporte Nutricional NutriScan AI para ${userEmail}`,
      `# Peso actual: ${weightKg} kg | Altura: ${heightCm} cm | Meta diaria: ${calorieGoal} kcal`,
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nutriscan_reporte_${new Date().toLocaleDateString('en-CA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Exportar Informe Nutricional</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed">
            Genera un reporte profesional de tu historial calórico y desglose de macronutrientes para compartirlo con tu nutricionista, médico o entrenador personal.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Paciente / Usuario:</span>
              <span className="font-medium text-slate-300">{userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Comidas registradas en total:</span>
              <span className="font-bold text-emerald-400">{foodLogs.length} platos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parámetros antropométricos:</span>
              <span className="font-medium text-slate-300">{weightKg} kg · {heightCm} cm · Meta: {calorieGoal} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={exportCSV}
              className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" /> Descargar CSV (Excel)
            </button>

            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <Printer className="w-4 h-4 text-emerald-400" /> Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
