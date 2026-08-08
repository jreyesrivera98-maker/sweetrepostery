import React, { useState } from 'react';
import { Wand2, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateRecipeWithAI, type GeneratedRecipe } from '../../../lib/gemini';

interface MareaRecipeAiProps {
  onRecipeGenerated: (recipe: GeneratedRecipe) => void;
}

export const MareaRecipeAi: React.FC<MareaRecipeAiProps> = ({ onRecipeGenerated }) => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<GeneratedRecipe | null>(null);
  const [error, setError] = useState('');

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setPreview(null);
    setError('');
    try {
      const result = await generateRecipeWithAI(idea.trim());
      setPreview(result);
    } catch (err: any) {
      setError(err.message ?? 'Error al conectar con la IA. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!preview) return;
    onRecipeGenerated(preview);
    setPreview(null);
    setIdea('');
  };

  return (
    <div className="ai-panel bg-gradient-to-r from-[#F4F3FF] to-[#EDE9FF] rounded-2xl p-6 border border-[#D6BBFB] shadow-sm mb-6">
      <h3 className="font-bold text-[#4834D4] mb-2 flex items-center text-lg">
        <Wand2 size={20} className="mr-2" />
        Generador de Recetas con IA
      </h3>
      <p className="text-sm text-[#636E72] mb-4">
        Describe la receta que tienes en mente y Marea Dulce creará la fórmula base para ti.
      </p>

      {!hasApiKey && (
        <div style={{ background: '#FFF3CD', border: '1px solid #FFEAA7', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#856404' }}>
          ⚠️ Para usar la IA agrega <code>VITE_GEMINI_API_KEY</code> en tu archivo <code>.env</code> y en las variables de Vercel.
        </div>
      )}

      <textarea
        value={idea}
        onChange={e => setIdea(e.target.value)}
        className="w-full p-3 border border-[#D6BBFB] rounded-xl mb-4 bg-white/80 focus:bg-white transition-colors"
        rows={3}
        placeholder="Ej: Torta húmeda de pistacho con chocolate blanco y relleno de frambuesa"
      />

      {error && (
        <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: '#C53030' }}>
          {error}
        </div>
      )}

      {/* Preview of AI-generated recipe before applying */}
      {preview && (
        <div style={{ background: 'white', border: '1px solid #D6BBFB', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ color: '#28A745' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#2D3436' }}>
              ¡Receta generada!
            </span>
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#4834D4', marginBottom: '0.25rem' }}>
            {preview.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#636E72', marginBottom: '0.75rem' }}>
            {preview.description}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#636E72', marginBottom: '0.875rem' }}>
            <span>⏱ {preview.prep_minutes} min</span>
            <span>🍰 {preview.yield_portions} porciones</span>
            <span>🧂 {preview.items?.length ?? 0} ingredientes</span>
          </div>
          <button
            onClick={handleApply}
            className="btn-primary w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: '#28A745' }}
          >
            <CheckCircle2 size={15} /> Aplicar al formulario
          </button>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !idea.trim()}
        className="btn-primary w-full py-2 rounded-xl bg-[#6C5CE7] text-white font-semibold hover:bg-[#4834D4] disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <><Sparkles className="animate-spin mr-2" size={18} /> Generando con IA...</>
        ) : (
          <><Sparkles className="mr-2" size={18} /> {preview ? 'Generar otra versión' : 'Generar Receta con IA'}</>
        )}
      </button>
    </div>
  );
};

