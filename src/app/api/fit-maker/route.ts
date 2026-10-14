// src/app/api/fit-maker/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { dishName, calories, proteinG, carbsG, fatG } = await request.json();

    if (!dishName) {
      return NextResponse.json({ error: 'Debes indicar el nombre del plato' }, { status: 400 });
    }

    const prompt = `
      Eres un chef fitness de alta cocina y nutricionista deportivo.
      El usuario te presenta un plato tradicional o calórico: "${dishName}" (aproximadamente ${calories || 800} kcal).

      Tu misión:
      Crea una "Versión Fitness" irresistible de este mismo plato:
      1. Reduce las calorías entre un 35% y un 50% sustituyendo ingredientes inteligentes (ej. harina de avena, claras de huevo, yogur griego, freidora de aire, etc.).
      2. Maximiza el contenido de proteína.
      3. Conserva el sabor y textura del plato original.
      4. Explica la preparación en 3 a 5 pasos rápidos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fitDishName: { type: Type.STRING, description: 'Nombre creativo de la versión fitness' },
            calorieSavingsPct: { type: Type.INTEGER, description: 'Porcentaje de calorías ahorradas' },
            fitCalories: { type: Type.INTEGER, description: 'Nuevas calorías estimadas' },
            fitProteinG: { type: Type.NUMBER, description: 'Proteínas en la versión fitness' },
            fitCarbsG: { type: Type.NUMBER, description: 'Carbohidratos en la versión fitness' },
            fitFatG: { type: Type.NUMBER, description: 'Grasas en la versión fitness' },
            substitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['original', 'replacement'],
              },
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['fitDishName', 'fitCalories', 'fitProteinG', 'substitutions', 'ingredients', 'instructions'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en fit-maker:', error);
    return NextResponse.json(
      { error: 'Error al generar versión fitness', details: error.message },
      { status: 500 }
    );
  }
}

