// src/lib/date-utils.ts

/**
 * Convierte un Date o string ISO a formato 'YYYY-MM-DD' en el huso horario LOCAL del usuario.
 * Resuelve el problema donde new Date().toISOString() usa UTC (causando que comidas registradas
 * después de las 7:00 PM en UTC-5 se guarden con la fecha del día siguiente).
 */
export function getLocalDateString(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Suma o resta días a una fecha 'YYYY-MM-DD' respetando la hora local
 */
export function shiftDateString(dateStr: string, deltaDays: number): string {
  if (!dateStr) return getLocalDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return getLocalDateString(date);
}

