// src/app/api/analyze-food/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, weightKg, heightCm, userGoal, mealType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 });
    }

    // Limpiar el prefijo "data:image/...;base64," si viene incluido
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
      Eres un nutricionista deportivo de élite y experto en visión computacional de alimentos.
      Analiza esta fotografía de comida con máxima precisión.
      
      Información de contexto del usuario:
      - Peso corporal: ${weightKg || 'No especificado'} kg
      - Altura: ${heightCm || 'No especificada'} cm
      - Momento del día / Tiempo de comida: ${mealType || 'No especificado'}
      - Objetivo de fitness: ${userGoal || 'Equilibrado / Saludable'}

      Instrucciones de análisis:
      1. Identifica el plato o preparación culinaria general en español.
      2. Detecta y desglosa CADA ingrediente o alimento visible con una estimación realista de su porción en gramos.
      3. Calcula las calorías totales del plato y sus macronutrientes (Proteínas, Carbohidratos, Grasas y Fibra en gramos).
      4. Asigna una puntuación nutricional de 1 a 100 basada en densidad de micronutrientes y calidad de los alimentos.
      5. Entrega una recomendación o consejo nutricional personalizado conciso, accionable y motivador para este usuario.
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
            foodName: { type: Type.STRING, description: 'Nombre general del plato en español' },
            totalCalories: { type: Type.INTEGER, description: 'Calorías totales estimadas (kcal)' },
            proteinG: { type: Type.NUMBER, description: 'Proteínas totales en gramos' },
            carbsG: { type: Type.NUMBER, description: 'Carbohidratos totales en gramos' },
            fatG: { type: Type.NUMBER, description: 'Grasas totales en gramos' },
            fiberG: { type: Type.NUMBER, description: 'Fibra dietética total en gramos' },
            healthScore: { type: Type.INTEGER, description: 'Puntaje saludable del plato (1 a 100)' },
            confidence: { type: Type.STRING, description: 'Nivel de confianza de la estimación visual: Alta, Media o Estimada' },
            advice: { type: Type.STRING, description: 'Consejo nutricional personalizado según objetivo y plato' },
            items: {
              type: Type.ARRAY,
              description: 'Desglose detallado de alimentos o ingredientes detectados',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nombre del alimento o ingrediente' },
                  estimatedGrams: { type: Type.INTEGER, description: 'Peso estimado en gramos' },
                  calories: { type: Type.INTEGER, description: 'Calorías de esta porción' },
                  proteinG: { type: Type.NUMBER, description: 'Proteínas en gramos' },
                  carbsG: { type: Type.NUMBER, description: 'Carbohidratos en gramos' },
                  fatG: { type: Type.NUMBER, description: 'Grasas en gramos' },
                },
                required: ['name', 'estimatedGrams', 'calories'],
              },
            },
          },
          required: ['foodName', 'totalCalories', 'proteinG', 'carbsG', 'fatG', 'advice', 'items'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error analizando imagen con Gemini Vision:', error);
    return NextResponse.json(
      { error: 'Error al analizar la imagen con IA', details: error.message },
      { status: 500 }
    );
  }
}
