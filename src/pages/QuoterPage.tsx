import React, { useState } from 'react';
import { Calculator, Save, Printer, Clock, Star, Zap, Crown } from 'lucide-react';
import { mockRecipes, mockQuotes } from '../lib/mockData';
import type { ComplexityLevel } from '../types';
import { AIPriceOptimizer } from '../components/quotes/AIPriceOptimizer';
import { useToast } from '../components/ui/ToastContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COMPLEXITY_OPTIONS: { id: ComplexityLevel; label: string; icon: React.ReactNode; description: string; laborMultiplier: number; color: string }[] = [
  { id: 'simple', label: 'Simple', icon: <Star size={20} />, description: '1 color, sin decoración compleja', laborMultiplier: 1, color: '#28A745' },
  { id: 'media', label: 'Media', icon: <Zap size={20} />, description: 'Decoraciones básicas, 2-3 colores', laborMultiplier: 1.5, color: '#17A2B8' },
  { id: 'alta', label: 'Alta', icon: <Crown size={20} />, description: 'Flores, texturas, fondant detallado', laborMultiplier: 2.5, color: '#6C5CE7' },
  { id: 'premium', label: 'Premium', icon: <Crown size={20} style={{ fill: 'currentColor' }} />, description: 'Escultura, encaje, piezas artísticas', laborMultiplier: 4, color: '#4834D4' },
];

export const QuoterPage: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [complexity, setComplexity] = useState<ComplexityLevel>('simple');
  const [laborBase, setLaborBase] = useState(150);
  const [depreciation, setDepreciation] = useState(30);
  const [overheadPercent, setOverheadPercent] = useState(15);
  const [marginPercent, setMarginPercent] = useState(55);
  const [advancePercent, setAdvancePercent] = useState(50);
  const [tab, setTab] = useState<'form' | 'history'>('form');
  const { toast } = useToast();

  const selectedRecipe = mockRecipes.find(r => r.id === recipeId);
  const complexityOption = COMPLEXITY_OPTIONS.find(c => c.id === complexity)!;

  const ingredientCost = selectedRecipe
    ? selectedRecipe.items.reduce((s, i) => s + i.total_cost, 0) * quantity
    : 0;
  const laborCost = laborBase * complexityOption.laborMultiplier * quantity;
  const indirectsCost = ingredientCost * (overheadPercent / 100);
  const depreciationCost = depreciation * quantity;
  const totalCost = ingredientCost + laborCost + indirectsCost + depreciationCost;
  const suggestedPrice = marginPercent < 100 ? totalCost / (1 - marginPercent / 100) : 0;
  const advanceAmount = suggestedPrice * (advancePercent / 100);
  const balanceAmount = suggestedPrice - advanceAmount;

  const fmx = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizador Automático</h1>
          <p className="page-subtitle">Calcula precios basados en costos reales y margen objetivo</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => {
            setTab('form');
            setCustomerName('');
            setRecipeId('');
            setQuantity(1);
            setComplexity('simple');
            setLaborBase(150);
            setDepreciation(30);
            setOverheadPercent(15);
            setMarginPercent(55);
            setAdvancePercent(50);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Formulario reiniciado');
          }} className={tab === 'form' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>
            <Calculator size={15} /> Nueva Cotización
          </button>
          <button onClick={() => setTab('history')} className={tab === 'history' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>
            <Clock size={15} /> Historial
          </button>
        </div>
      </div>

      {tab === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Basic info */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#2D3436' }}>Información del pedido</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Cliente</label>
                  <input className="input-marea" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Receta</label>
                  <select className="input-marea" value={recipeId} onChange={e => setRecipeId(e.target.value)}>
                    <option value="">— Seleccionar receta —</option>
                    {mockRecipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Cantidad</label>
                  <input type="number" min={1} className="input-marea" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#2D3436' }}>Complejidad del diseño</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                {COMPLEXITY_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setComplexity(opt.id)} style={{
                    padding: '0.875rem 0.5rem', borderRadius: '0.875rem', border: `2px solid ${complexity === opt.id ? opt.color : '#E8E3FF'}`,
                    background: complexity === opt.id ? `${opt.color}12` : 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                  }}>
                    <div style={{ color: complexity === opt.id ? opt.color : '#636E72', display: 'flex', justifyContent: 'center', marginBottom: '0.375rem' }}>{opt.icon}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: complexity === opt.id ? opt.color : '#2D3436' }}>{opt.label}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#636E72', marginTop: '0.25rem' }}>{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Costs */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#2D3436' }}>Costos adicionales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Mano de obra base (MXN)</label>
                  <input type="number" min={0} className="input-marea" value={laborBase} onChange={e => setLaborBase(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Depreciación (MXN)</label>
                  <input type="number" min={0} className="input-marea" value={depreciation} onChange={e => setDepreciation(Number(e.target.value))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>
                    Gastos indirectos: <span style={{ color: '#6C5CE7' }}>{overheadPercent}%</span>
                  </label>
                  <input type="range" min={0} max={30} step={1} value={overheadPercent} onChange={e => setOverheadPercent(Number(e.target.value))} style={{ width: '100%', accentColor: '#6C5CE7' }} />
                </div>
              </div>
            </div>

            {/* Margin & Advance */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#2D3436' }}>Margen y anticipo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>
                    Margen de ganancia: <span style={{ color: '#6C5CE7' }}>{marginPercent}%</span>
                  </label>
                  <input type="range" min={30} max={80} step={1} value={marginPercent} onChange={e => setMarginPercent(Number(e.target.value))} style={{ width: '100%', accentColor: '#6C5CE7' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>
                    Anticipo requerido: <span style={{ color: '#6C5CE7' }}>{advancePercent}%</span>
                  </label>
                  <input type="range" min={0} max={100} step={10} value={advancePercent} onChange={e => setAdvancePercent(Number(e.target.value))} style={{ width: '100%', accentColor: '#6C5CE7' }} />
                </div>
              </div>
            </div>

            {/* AI Optimizer */}
            <AIPriceOptimizer recipeName={selectedRecipe?.name ?? 'Producto'} baseCost={totalCost} complexity={complexity} marginPercent={marginPercent} calculatedPrice={suggestedPrice} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { toast.success('Cotización guardada exitosamente'); setTab('history'); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Save size={16} /> Guardar Cotización</button>
              <button onClick={() => toast.info('Generando PDF...')} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}><Printer size={16} /> Generar PDF</button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', color: '#2D3436', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={18} style={{ color: '#6C5CE7' }} /> Resumen de Cotización
              </h3>

              {selectedRecipe && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#F4F3FF', borderRadius: '0.625rem' }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#2D3436' }}>{selectedRecipe.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#636E72' }}>× {quantity} {quantity > 1 ? 'piezas' : 'pieza'} · Complejidad {complexity}</div>
                </div>
              )}

              {/* Cost breakdown */}
              {[
                { label: 'Costo de Insumos', value: ingredientCost, color: '#2D3436' },
                { label: `Mano de Obra (×${complexityOption.laborMultiplier})`, value: laborCost, color: '#2D3436' },
                { label: `Indirectos (${overheadPercent}%)`, value: indirectsCost, color: '#2D3436' },
                { label: 'Depreciación', value: depreciationCost, color: '#2D3436' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F4F3FF', fontSize: '0.85rem' }}>
                  <span style={{ color: '#636E72' }}>{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{fmx(item.value)}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '2px solid #E8E3FF', marginTop: '0.25rem' }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>= Costo Total</span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{fmx(totalCost)}</span>
              </div>

              <div style={{ padding: '1rem 0 0.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72', marginBottom: '0.25rem' }}>Precio Sugerido ({marginPercent}% margen)</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#6C5CE7' }}>{fmx(suggestedPrice)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ background: '#E8FFF4', borderRadius: '0.625rem', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#0A6640', marginBottom: '0.25rem' }}>Anticipo ({advancePercent}%)</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#0A6640' }}>{fmx(advanceAmount)}</div>
                </div>
                <div style={{ background: '#FFF5F5', borderRadius: '0.625rem', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#C53030', marginBottom: '0.25rem' }}>Saldo</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#C53030' }}>{fmx(balanceAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="marea-table">
            <thead>
              <tr><th>Cliente</th><th>Receta</th><th>Complejidad</th><th>Precio Final</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {mockQuotes.map(q => (
                <tr key={q.id}>
                  <td>{q.customer_name}</td>
                  <td>{q.recipe_name}</td>
                  <td><span className="badge badge-primary">{q.complexity}</span></td>
                  <td style={{ fontWeight: 700, color: '#6C5CE7' }}>${q.final_price.toLocaleString('es-MX')}</td>
                  <td><span className={`badge ${q.status === 'accepted' ? 'badge-success' : q.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{q.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: '#636E72' }}>{format(new Date(q.created_at), 'dd MMM yyyy', { locale: es })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
