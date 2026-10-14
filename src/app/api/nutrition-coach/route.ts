// src/app/api/nutrition-coach/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { userMessage, context, history } = await request.json();

    const systemPrompt = `
      Eres el Asistente Nutricional IA de NutriScan AI, un dietista deportivo experto, empático, pragmático y motivador.
      Conoces en tiempo real el estado nutricional actual del usuario hoy:
      - Calorías restantes del día: ${context?.caloriesRemaining ?? 500} kcal
      - Calorías consumidas hoy: ${context?.caloriesConsumed ?? 1500} kcal (Meta: ${context?.calorieGoal ?? 2000} kcal)
      - Proteínas restantes para la meta: ${context?.proteinRemaining ?? 30} g
      - Carbohidratos restantes: ${context?.carbsRemaining ?? 40} g
      - Grasas restantes: ${context?.fatRemaining ?? 15} g
      - Peso actual: ${context?.weightKg ?? 75} kg, Altura: ${context?.heightCm ?? 175} cm
      - Objetivo principal: ${context?.goal ?? 'Saludable'}

      Instrucciones:
      1. Responde a la pregunta o solicitud del usuario de forma directa, cálida y práctica.
      2. Si el usuario pide ideas de comidas, cenas o snacks, sugiérele platos realistas y fáciles de preparar que se ajusten EXACTAMENTE a sus calorías y macros restantes sin pasarse.
      3. Si sugieres un plato específico, proporciona su nombre y macronutrientes estructurados en 'suggestedMeal' para que el usuario pueda registrarlo con un solo clic.
    `;

    const contents = [
      systemPrompt,
      ...(history || []).map((h: any) => `${h.role === 'user' ? 'Usuario' : 'Nutricionista'}: ${h.text}`),
      `Usuario: ${userMessage}`,
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'Respuesta conversacional del nutricionista en español' },
            suggestedMeal: {
              type: Type.OBJECT,
              description: 'Plato o comida sugerida opcional que el usuario puede registrar con 1 clic',
              properties: {
                name: { type: Type.STRING, description: 'Nombre del plato' },
                calories: { type: Type.INTEGER, description: 'Calorías estimadas' },
                proteinG: { type: Type.NUMBER, description: 'Gramos de proteína' },
                carbsG: { type: Type.NUMBER, description: 'Gramos de carbohidratos' },
                fatG: { type: Type.NUMBER, description: 'Gramos de grasa' },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Lista de ingredientes rápidos',
                },
              },
              required: ['name', 'calories', 'proteinG', 'carbsG', 'fatG'],
            },
          },
          required: ['reply'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en asistente nutricional con Gemini:', error);
    return NextResponse.json(
      { error: 'Error al consultar al nutricionista IA', details: error.message },
      { status: 500 }
    );
  }
}

