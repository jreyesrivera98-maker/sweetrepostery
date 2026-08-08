import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
// import { generateRecipeWithAI } from '../../../lib/gemini';

interface MareaRecipeAiProps {
  onRecipeGenerated: (recipe: any) => void;
}

export const MareaRecipeAi: React.FC<MareaRecipeAiProps> = ({ onRecipeGenerated }) => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      const mockAiRecipe = {
        name: "Torta Húmeda de Pistacho Mágica",
        description: "Una deliciosa creación inspirada en tu idea.",
        steps: ["Preparar el horno", "Mezclar pistachos", "Hornear con cuidado"],
        ai_generated: true
      };
      onRecipeGenerated(mockAiRecipe);
      setLoading(false);
    }, 2000);
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
      
      <textarea 
        value={idea}
        onChange={e => setIdea(e.target.value)}
        className="w-full p-3 border border-[#D6BBFB] rounded-xl mb-4 bg-white/80 focus:bg-white transition-colors"
        rows={3}
        placeholder="Ej: Torta húmeda de pistacho con chocolate blanco y relleno de frambuesa"
      ></textarea>
      
      <button 
        onClick={handleGenerate}
        disabled={loading || !idea}
        className="btn-primary w-full py-2 rounded-xl bg-[#6C5CE7] text-white font-semibold hover:bg-[#4834D4] disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <><Sparkles className="animate-spin mr-2" size={18} /> Generando magia...</>
        ) : (
          <><Sparkles className="mr-2" size={18} /> Generar Receta con IA</>
        )}
      </button>
    </div>
  );
};
