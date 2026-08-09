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

// ---- DESIGNER PROMPT ENHANCEMENT ----
export interface DesignerQuestion {
  id: string;
  question: string;
  options: string[];
}

export async function generateDesignerQuestions(
  idea: string,
  style: string,
  occasion: string
): Promise<DesignerQuestion[]> {
  const prompt = `
Eres un Master Chef Repostero consultor. Un cliente quiere este pastel:
- Idea: "${idea}"
- Estilo: ${style}
- Ocasión: ${occasion}

Para crear el diseño 3D fotográfico perfecto de UN SOLO pastel monumental, formula 3 preguntas clave de opción múltiple que definan los detalles visuales más importantes que faltan (ej. texturas, elementos decorativos específicos, formato de pisos, etc.).

Responde SOLO con un JSON válido con esta estructura exacta:
[
  {
    "id": "q1",
    "question": "¿Qué tipo de textura prefieres para la cubierta base?",
    "options": ["Fondant liso impecable", "Betún rústico texturizado", "Ganache brillante tipo espejo", "Semi-naked cake (bizcocho visible)"]
  }
]
`;

  const text = await callGemini(prompt);
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as DesignerQuestion[];
  } catch {
    console.error('Error parseando JSON de Gemini:', text);
    throw new Error('La IA no pudo generar las opciones. Intenta modificar tu idea.');
  }
}

export async function enhanceImagePrompt(
  idea: string,
  style: string,
  occasion: string,
  colors: string,
  answers: Record<string, string>
): Promise<string> {
  const answersText = Object.entries(answers)
    .map(([_, answer]) => `- ${answer}`)
    .join('\n');

  const prompt = `
Eres un experto en "Prompt Engineering" para modelos de difusión de imágenes (como Midjourney o FLUX).
El objetivo es crear un pastel hiperrealista increíble.

Concepto Base del Cliente: "${idea}"
Estilo Visual: ${style}
Ocasión: ${occasion}
Paleta de Colores: ${colors}
Detalles Clave Seleccionados:
${answersText}

Redacta EL MEJOR PROMPT EN INGLÉS para generar esta imagen.
Reglas estrictas para el prompt:
1. Solo describe la imagen, sin introducciones.
2. Solicita UN SOLO pastel monumental centrado ("A single, spectacular...").
3. NO incluyas textos, letras, ni números en el pastel (usa "no text, no letters, no watermark").
4. Solicita calidad extrema ("award winning food photography, 8k, ultra-detailed, photorealistic, cinematic studio lighting, neutral background").
5. Traduce fielmente la esencia de los requerimientos a términos visuales de repostería profesional.

Escribe el prompt resultante directamente:
`;

  return callGemini(prompt);
}
