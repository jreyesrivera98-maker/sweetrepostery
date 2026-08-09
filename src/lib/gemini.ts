// ============================================================
// GEMINI AI CLIENT — Free tier (Gemini 1.5 Flash)
// ============================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY not set. Add it to your .env file.');
  }

  const res = await fetch(`${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data: GeminiResponse = await res.json();
  return data.candidates[0]?.content?.parts[0]?.text ?? '';
}

// ---- RECIPE GENERATION ----
export interface GeneratedRecipe {
  name: string;
  description: string;
  yield_portions: number;
  prep_minutes: number;
  steps: string;
  items: Array<{
    ingredient_name: string;
    quantity: number;
    unit: string;
  }>;
  flavor_pairings: string[];
}

export async function generateRecipeWithAI(idea: string): Promise<GeneratedRecipe> {
  const prompt = `
Eres un chef pastelero experto. Genera una receta detallada de repostería artesanal basada en esta idea:

IDEA: "${idea}"

Responde SOLO con un JSON válido (sin markdown, sin bloques de código) con esta estructura exacta:
{
  "name": "Nombre de la receta",
  "description": "Descripción apetitosa de 2-3 oraciones",
  "yield_portions": 12,
  "prep_minutes": 90,
  "steps": "Paso 1: ... \\nPaso 2: ... \\nPaso 3: ...",
  "items": [
    { "ingredient_name": "Harina", "quantity": 500, "unit": "g" },
    { "ingredient_name": "Azúcar", "quantity": 200, "unit": "g" }
  ],
  "flavor_pairings": ["Café", "Frambuesa"]
}
`;

  const text = await callGemini(prompt);
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as GeneratedRecipe;
  } catch {
    throw new Error('La IA no devolvió un JSON válido. Intenta de nuevo.');
  }
}

// ---- PRICE OPTIMIZATION ----
export interface PriceOptimization {
  recommended_price: number;
  argument: string;
  confidence: number;
  tips: string[];
}

export async function optimizePriceWithAI(params: {
  recipe_name: string;
  base_cost: number;
  complexity: string;
  margin_percent: number;
  calculated_price: number;
}): Promise<PriceOptimization> {
  const prompt = `
Eres un consultor de precios para pastelerías artesanales en México.

Analiza esta cotización:
- Producto: ${params.recipe_name}
- Costo base: $${params.base_cost} MXN
- Complejidad: ${params.complexity}
- Margen aplicado: ${params.margin_percent}%
- Precio calculado: $${params.calculated_price} MXN

Responde SOLO con JSON válido:
{
  "recommended_price": 850,
  "argument": "Argumento de venta persuasivo de 2 oraciones",
  "confidence": 0.87,
  "tips": ["Tip 1 de posicionamiento", "Tip 2 de ventas"]
}
`;

  const text = await callGemini(prompt);
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as PriceOptimization;
  } catch {
    return {
      recommended_price: params.calculated_price * 1.05,
      argument: 'Producto artesanal de alta calidad con ingredientes premium.',
      confidence: 0.75,
      tips: ['Destaca los ingredientes de calidad', 'Incluye fotos profesionales'],
    };
  }
}

// ---- INGREDIENT SUBSTITUTION ----
export async function getIngredientSubstitution(params: {
  ingredient: string;
  reason: string;
  recipe_context: string;
}): Promise<string> {
  const prompt = `
Como chef pastelero experto, sugiere una sustitución para este ingrediente:
- Ingrediente: ${params.ingredient}
- Razón de sustitución: ${params.reason}
- Contexto de la receta: ${params.recipe_context}

Responde en español con: sustituto recomendado, cantidad equivalente, ajuste de técnica y impacto en el sabor. Máximo 4 oraciones.
`;

  return callGemini(prompt);
}
