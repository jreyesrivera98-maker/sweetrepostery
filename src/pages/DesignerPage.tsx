import React, { useState } from 'react';
import { Wand2, Download, Image as ImageIcon } from 'lucide-react';
import { ColorPaletteEditor } from '../components/designer/ColorPaletteEditor';
import type { ColorSwatch } from '../components/designer/ColorPaletteEditor';
import { generateImageWithGemini } from '../lib/gemini';
import { useToast } from '../components/ui/ToastContext';

export const DesignerPage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('Minimalista');
  const [occasion, setOccasion] = useState('Cumpleaños');
  const [palette, setPalette] = useState<ColorSwatch[]>([
    { id: '1', hex: '#FFB6C1' },
    { id: '2', hex: '#E6E6FA' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState('');
  const { toast } = useToast();

  const styles = ['Minimalista', 'Romántico', 'Boho', 'Elegante', 'Infantil', 'Moderno'];
  const occasions = ['Cumpleaños', 'Boda', 'Baby Shower', 'Graduación', 'Corporativo', 'San Valentín'];

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `marea-render-concept.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab if fetch fails (e.g. CORS in prod)
      window.open(url, '_blank');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Cleanup previous object URL to avoid memory leaks
    if (generatedImage && generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImage);
    }
    setGeneratedImage(null);
    try {
      const colors = palette.map(p => p.hex).join(', ');
      const prompt = `A high-resolution product concept presentation sheet, 3-panel split view side-by-side, presenting 3 distinct design options for a ${style} ${occasion} cake. Colors: ${colors}. Concept: ${description}. Layout & Style: Clean studio presentation sheet, uniform studio lighting, neutral background, ultra-detailed, photorealistic, professional design showcase.`;
      
      setPromptUsed(prompt);
      
      const response = await fetch('https://free-image-generation-api.jreyesrivera98.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer saraReyna.664'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedImage(objectUrl);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al generar la imagen.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Diseñador IA — Image Studio</h1>
        <p className="page-subtitle text-gray-500">Crea conceptos visuales de pasteles usando Inteligencia Artificial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT FORM */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Descripción del Pastel</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pastel de dos pisos con decoración de flores de azúcar, textura suave..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Estilo Visual</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    style === s ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full mt-2 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="O escribe un estilo personalizado..."
              value={!styles.includes(style) ? style : ''}
              onChange={e => setStyle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Ocasión</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {occasions.map(o => (
                <button
                  key={o}
                  onClick={() => setOccasion(o)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    occasion === o ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full mt-2 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="O escribe una ocasión personalizada..."
              value={!occasions.includes(occasion) ? occasion : ''}
              onChange={e => setOccasion(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <ColorPaletteEditor value={palette} onChange={setPalette} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description}
            className="w-full btn-primary bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando Conceptos...
              </span>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generar Conceptos (3 Opciones)
              </>
            )}
          </button>
        </div>

        {/* RIGHT GALLERY */}
        <div className="lg:col-span-7">
          <div className="bg-gray-50 rounded-2xl p-6 h-full min-h-[600px] border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-poppins text-gray-900">Resultados</h2>
              {generatedImage && (
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Completado
                </span>
              )}
            </div>

            {isGenerating ? (
              <div className="w-full flex-1 bg-gray-200 rounded-xl animate-pulse min-h-[300px]"></div>
            ) : generatedImage ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex-1 flex items-center justify-center min-h-[300px]">
                  <img
                    src={generatedImage}
                    alt={`Render Concepto 3 Paneles`}
                    className="w-full h-auto max-h-full object-contain"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                    <button
                      onClick={() => window.open(generatedImage, '_blank')}
                      className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Ver en tamaño completo
                    </button>
                    <button
                      onClick={() => downloadImage(generatedImage)}
                      className="px-6 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm flex justify-center items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PNG
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Prompt:</span> {promptUsed}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <p className="max-w-xs text-center text-sm">
                  Configura los detalles en el panel izquierdo y haz clic en generar para ver los renders aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
