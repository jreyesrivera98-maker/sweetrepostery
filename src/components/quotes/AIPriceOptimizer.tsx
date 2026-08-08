import React, { useState } from 'react';
import { Sparkles, TrendingUp, Check, AlertCircle, Loader2 } from 'lucide-react';
import { optimizePriceWithAI } from '../../lib/gemini';
import type { PriceOptimization } from '../../lib/gemini';

interface AIPriceOptimizerProps {
  recipeName: string;
  baseCost: number;
  complexity: string;
  marginPercent: number;
  calculatedPrice: number;
}

export const AIPriceOptimizer: React.FC<AIPriceOptimizerProps> = ({
  recipeName, baseCost, complexity, marginPercent, calculatedPrice,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceOptimization | null>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await optimizePriceWithAI({ recipe_name: recipeName, base_cost: baseCost, complexity, margin_percent: marginPercent, calculated_price: calculatedPrice });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al conectar con la IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7, #4834D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} style={{ color: 'white' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#2D3436' }}>Marea AI Price Optimizer</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#636E72' }}>Powered by Gemini 1.5 Flash</div>
          </div>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
          {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Analizando...</> : <><TrendingUp size={14} /> Analizar con IA</>}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '0.625rem', padding: '0.75rem', fontSize: '0.8rem', color: '#C53030', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          {error.includes('API_KEY') ? 'Agrega VITE_GEMINI_API_KEY en tu archivo .env para usar la IA.' : error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', animation: 'fadeIn 0.3s ease' }}>
          {/* Recommended price */}
          <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1rem', border: '2px solid #6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Precio recomendado por IA</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#6C5CE7' }}>
                ${result.recommended_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#636E72', marginBottom: '0.375rem' }}>Confianza</div>
              <div style={{ width: '80px', height: '6px', background: '#E8E3FF', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(result.confidence ?? 0.8) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6C5CE7, #A29BFE)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#6C5CE7', marginTop: '0.25rem' }}>
                {Math.round((result.confidence ?? 0.8) * 100)}%
              </div>
            </div>
          </div>

          {/* Argument */}
          <div style={{ background: 'white', borderRadius: '0.875rem', padding: '0.875rem', border: '1px solid #E8E3FF' }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: '#636E72', marginBottom: '0.375rem' }}>ARGUMENTO DE VENTA</div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#2D3436', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
              "{result.argument}"
            </p>
          </div>

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: '#636E72', marginBottom: '0.375rem' }}>CONSEJOS</div>
              {result.tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.375rem', fontSize: '0.8rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EDE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={10} style={{ color: '#6C5CE7' }} />
                  </div>
                  <span style={{ color: '#2D3436', lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#B2BEC3', textAlign: 'center', margin: '0.5rem 0 0' }}>
          Haz clic en "Analizar con IA" para obtener una recomendación de precio inteligente.
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};
