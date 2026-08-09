import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface MoldScalerProps {
  recipe: any;
  onScaled?: (portions: number) => void;
}

export const MoldScaler: React.FC<MoldScalerProps> = ({ recipe }) => {
  const [targetVal1, setTargetVal1] = useState<number>(recipe.yield_portions || 10);
  const [targetVal2, setTargetVal2] = useState<number>(0);

  let scaleFactor = 1;

  if (recipe.mold_type === 'circular') {
    const originalDiameter = 20; // mock
    scaleFactor = Math.pow(targetVal1 / originalDiameter, 2);
  } else if (recipe.mold_type === 'rectangular') {
    const origArea = 20 * 30; // mock
    const targetArea = targetVal1 * (targetVal2 || 1);
    scaleFactor = targetArea / origArea;
  } else {
    scaleFactor = targetVal1 / (recipe.yield_portions || 1);
  }

  return (
    <div className="ai-panel glass-card bg-surface rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="font-bold text-text mb-4 flex items-center">
        <Calculator size={18} className="mr-2 text-primary" />
        Calculadora de Escalado
      </h3>
      
      <div className="space-y-4 mb-4">
        {recipe.mold_type === 'circular' && (
          <div>
            <label className="block text-sm text-muted mb-1">Nuevo Diámetro (cm)</label>
            <input 
              type="number" 
              value={targetVal1} 
              onChange={e => setTargetVal1(Number(e.target.value))} 
              className="input-marea w-full p-2 border rounded-lg"
            />
          </div>
        )}
        
        {recipe.mold_type === 'rectangular' && (
          <div className="flex space-x-2">
            <div>
              <label className="block text-sm text-muted mb-1">Nuevo Ancho</label>
              <input type="number" value={targetVal1} onChange={e => setTargetVal1(Number(e.target.value))} className="input-marea w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Nuevo Largo</label>
              <input type="number" value={targetVal2} onChange={e => setTargetVal2(Number(e.target.value))} className="input-marea w-full p-2 border rounded-lg" />
            </div>
          </div>
        )}
        
        {recipe.mold_type === 'na' && (
          <div>
            <label className="block text-sm text-muted mb-1">Nuevas Porciones</label>
            <input type="number" value={targetVal1} onChange={e => setTargetVal1(Number(e.target.value))} className="input-marea w-full p-2 border rounded-lg" />
          </div>
        )}
        
        <div className="bg-bg p-3 rounded-lg">
          <p className="text-sm font-semibold text-primary">Factor de escala: {scaleFactor.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  );
};
