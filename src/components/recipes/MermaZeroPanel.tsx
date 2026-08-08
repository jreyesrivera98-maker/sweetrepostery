import React from 'react';
import { RecycleIcon, AlertCircle } from 'lucide-react';

export const MermaZeroPanel: React.FC<{ recipe: any }> = ({ recipe }) => {
  const isCake = recipe?.category === 'Tortas';
  
  if (!isCake) return null;

  const estimatedWasteGrams = 200; // Mock calculation based on trim
  const cakePops = Math.floor(estimatedWasteGrams / 20);

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-teal-800 mb-3 flex items-center">
        <RecycleIcon size={18} className="mr-2" />
        Panel Merma Zero
      </h3>
      
      <div className="mb-4">
        <p className="text-teal-700 text-sm">
          Estimado de recorte (barriga): <strong>{estimatedWasteGrams}g</strong> (aprox 8%)
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-teal-100">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
          <AlertCircle size={14} className="mr-1 text-teal-500" /> Oportunidad de Recuperación
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          Con este sobrante puedes preparar:
        </p>
        <div className="flex items-center justify-between bg-teal-50 p-2 rounded-lg">
          <span className="font-medium text-teal-800">Cake Pops</span>
          <span className="bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-bold">~{cakePops} unidades</span>
        </div>
      </div>
    </div>
  );
};
