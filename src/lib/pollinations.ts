// ============================================================
// POLLINATIONS.AI — Free Image Generation (no API key needed)
// ============================================================

export interface PollinationsOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
  model?: 'flux' | 'flux-realism' | 'flux-pro' | 'turbo';
}

/**
 * Generates an image URL using Pollinations.ai (completely free, no key needed)
 * The returned URL can be used directly as <img src={url} />
 */
export function generateImageUrl(
  prompt: string,
  options: PollinationsOptions = {}
): string {
  const {
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 99999),
    nologo = true,
    enhance = true,
    model = 'flux-realism',
  } = options;

  const encoded = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: String(nologo),
    enhance: String(enhance),
    model,
  });

  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`;
}

/**
 * Builds a photorealistic bakery cake prompt for Pollinations
 */
export function buildCakePrompt(params: {
  description: string;
  style: string;
  occasion: string;
  colors: string[];
}): string {
  const colorStr = params.colors.length > 0
    ? `color palette: ${params.colors.join(', ')}`
    : 'elegant pastel colors';

  return (
    `Professional food photography of a ${params.style} cake for ${params.occasion}. ` +
    `${params.description}. ${colorStr}. ` +
    `Shot on white marble surface, soft natural light, shallow depth of field, ` +
    `ultra-realistic, high-end bakery photography, 8K resolution`
  );
}
