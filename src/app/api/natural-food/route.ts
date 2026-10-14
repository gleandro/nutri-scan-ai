// src/app/api/natural-food/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { query, mealType, weightKg, heightCm, userGoal } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Debes ingresar una descripción de los alimentos' }, { status: 400 });
    }

    const prompt = `
      Eres un nutricionista deportivo y analizador bioquímico de alimentos.
      El usuario describe lo que consumió en lenguaje natural o con cantidades caseras (tazas, cucharadas, unidades, porciones).
      
      Texto del usuario: "${query.trim()}"
      Momento del día: ${mealType || 'No especificado'}
      Objetivo del usuario: ${userGoal || 'Saludable'}
      Contexto antropométrico: Peso ${weightKg || 75} kg, Altura ${heightCm || 175} cm.

      Instrucciones:
      1. Extrae y estandariza cada alimento con su peso estimado en gramos.
      2. Calcula las calorías totales exactas, proteínas (g), carbohidratos (g), grasas (g) y fibra (g).
      3. Genera un nombre claro y profesional para el plato en español.
      4. Brinda una breve observación nutricional o recomendación para optimizar este plato.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: 'Nombre descriptivo del plato o conjunto de alimentos' },
            totalCalories: { type: Type.INTEGER, description: 'Calorías totales (kcal)' },
            proteinG: { type: Type.NUMBER, description: 'Proteínas totales en gramos' },
            carbsG: { type: Type.NUMBER, description: 'Carbohidratos totales en gramos' },
            fatG: { type: Type.NUMBER, description: 'Grasas totales en gramos' },
            fiberG: { type: Type.NUMBER, description: 'Fibra total en gramos' },
            advice: { type: Type.STRING, description: 'Comentario nutricional constructivo' },
            items: {
              type: Type.ARRAY,
              description: 'Desglose por ingrediente identificado',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nombre del ingrediente' },
                  estimatedGrams: { type: Type.INTEGER, description: 'Gramos calculados' },
                  calories: { type: Type.INTEGER, description: 'Calorías' },
                  proteinG: { type: Type.NUMBER, description: 'Proteínas (g)' },
                  carbsG: { type: Type.NUMBER, description: 'Carbohidratos (g)' },
                  fatG: { type: Type.NUMBER, description: 'Grasas (g)' },
                },
                required: ['name', 'estimatedGrams', 'calories'],
              },
            },
          },
          required: ['foodName', 'totalCalories', 'proteinG', 'carbsG', 'fatG', 'items'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error procesando búsqueda natural con Gemini:', error);
    return NextResponse.json(
      { error: 'Error al interpretar los alimentos con IA', details: error.message },
      { status: 500 }
    );
  }
}

