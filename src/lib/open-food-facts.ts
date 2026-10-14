// src/lib/open-food-facts.ts
// Integración con Open Food Facts para escaneo y búsqueda de productos por código de barras

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  servingSize?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  caloriesServing?: number;
  proteinServing?: number;
  carbsServing?: number;
  fatServing?: number;
}

export async function fetchProductByBarcode(barcode: string): Promise<BarcodeProduct | null> {
  const cleanBarcode = barcode.trim().replace(/\D/g, '');
  if (!cleanBarcode) return null;

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`, {
      headers: {
        'User-Agent': 'NutriScanAI - WebApp - Version 1.0',
      },
    });

    if (!res.ok) return null;
    const json = await res.json();

    if (json.status !== 1 || !json.product) {
      return null;
    }

    const p = json.product;
    const nutriments = p.nutriments || {};

    const name = p.product_name_es || p.product_name || p.generic_name || 'Producto empaquetado';
    const brand = p.brands || 'Sin marca';
    const imageUrl = p.image_front_url || p.image_url;

    const caloriesPer100g = Math.round(
      Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0)
    );
    const proteinPer100g = Number((Number(nutriments['proteins_100g'] ?? 0)).toFixed(1));
    const carbsPer100g = Number((Number(nutriments['carbohydrates_100g'] ?? 0)).toFixed(1));
    const fatPer100g = Number((Number(nutriments['fat_100g'] ?? 0)).toFixed(1));
    const fiberPer100g = Number((Number(nutriments['fiber_100g'] ?? 0)).toFixed(1));

    const servingSize = p.serving_size;
    const caloriesServing = nutriments['energy-kcal_serving']
      ? Math.round(Number(nutriments['energy-kcal_serving']))
      : undefined;
    const proteinServing = nutriments['proteins_serving']
      ? Number(Number(nutriments['proteins_serving']).toFixed(1))
      : undefined;
    const carbsServing = nutriments['carbohydrates_serving']
      ? Number(Number(nutriments['carbohydrates_serving']).toFixed(1))
      : undefined;
    const fatServing = nutriments['fat_serving']
      ? Number(Number(nutriments['fat_serving']).toFixed(1))
      : undefined;

    return {
      barcode: cleanBarcode,
      name,
      brand,
      imageUrl,
      servingSize,
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      fiberPer100g,
      caloriesServing,
      proteinServing,
      carbsServing,
      fatServing,
    };
  } catch (error) {
    console.error('Error consultando Open Food Facts:', error);
    return null;
  }
}

