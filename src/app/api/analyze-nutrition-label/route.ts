// src/app/api/analyze-nutrition-label/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
      Eres un sistema OCR experto en lectura e interpretación de tablas nutricionales e información nutrimental en empaques de alimentos.
      Analiza minuciosamente la fotografía de esta etiqueta o tabla nutricional.
      
      Instrucciones:
      1. Extrae el nombre o tipo de producto si es legible en el empaque (o 'Producto empaquetado').
      2. Identifica el tamaño de la porción recomendada (en gramos o ml). Si dice por 100g, toma 100g como base.
      3. Extrae las calorías por porción (kcal), proteínas (g), carbohidratos totales (g), grasas totales (g), fibra dietética (g) y sodio (mg).
      4. Si hay valores no especificados, estima un valor prudente o 0.
      5. Entrega una breve observación sobre la calidad de los ingredientes (ej. bajo en azúcar, alto en sodio, buena fuente de proteína).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, description: 'Nombre del producto detectado' },
            servingSizeG: { type: Type.INTEGER, description: 'Tamaño de la porción en gramos o ml' },
            caloriesPerServing: { type: Type.INTEGER, description: 'Calorías por porción (kcal)' },
            proteinG: { type: Type.NUMBER, description: 'Gramos de proteína por porción' },
            carbsG: { type: Type.NUMBER, description: 'Gramos de carbohidratos por porción' },
            fatG: { type: Type.NUMBER, description: 'Gramos de grasa por porción' },
            fiberG: { type: Type.NUMBER, description: 'Gramos de fibra dietética por porción' },
            sodiumMg: { type: Type.INTEGER, description: 'Miligramos de sodio por porción' },
            summary: { type: Type.STRING, description: 'Breve resumen nutricional de la etiqueta' },
          },
          required: ['productName', 'servingSizeG', 'caloriesPerServing', 'proteinG', 'carbsG', 'fatG'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error analizando etiqueta nutricional con Gemini:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la etiqueta nutricional', details: error.message },
      { status: 500 }
    );
  }
}

