import React, { useState } from 'react';
import { Plus, Phone, Mail, TrendingDown } from 'lucide-react';
import { mockSuppliers, mockIngredients } from '../lib/mockData';
import type { Supplier, Ingredient } from '../types';

export const SuppliersPage: React.FC = () => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Proveedores</h1>
          <p className="page-subtitle text-gray-500">Directorio de proveedores y comparador de precios</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockSuppliers?.map((supplier: Supplier) => (
          <div key={supplier.id} className="glass-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-500">{supplier.contact}</p>
              </div>
              <span className="badge bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                {supplier.category}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{supplier.email}</span>
              </div>
            </div>

            {supplier.notes && (
              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-3 mb-4">
                {supplier.notes}
              </p>
            )}

            <button className="w-full mt-auto py-2 text-primary font-medium text-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
              Ver Precios ({supplier.prices?.length || 0})
            </button>
          </div>
        ))}
      </div>

      {/* Price Comparator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-primary" />
            Comparador de Precios
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un insumo para comparar</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
            >
              <option value="">-- Seleccione un insumo --</option>
              {mockIngredients?.map((ing: Ingredient) => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedIngredientId ? (
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Proveedor</th>
                  <th className="p-4 font-medium">Presentación</th>
                  <th className="p-4 font-medium">Costo Paquete</th>
                  <th className="p-4 font-medium">Costo Unitario Calculado</th>
                  <th className="p-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Mock data generation for comparator based on selected ingredient */}
                {[
                  { supp: 'Proveedor A', pack: '1 kg', cost: 120, unitCost: 0.12, best: false },
                  { supp: 'Proveedor B', pack: '5 kg', cost: 500, unitCost: 0.10, best: true },
                  { supp: 'Proveedor C', pack: '500 g', cost: 65, unitCost: 0.13, best: false },
                ].map((item, i) => (
                  <tr key={i} className={item.best ? 'bg-green-50/30' : ''}>
                    <td className="p-4 font-medium text-gray-900">{item.supp}</td>
                    <td className="p-4 text-gray-600">{item.pack}</td>
                    <td className="p-4 text-gray-600">${item.cost.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">${item.unitCost.toFixed(2)}</span>
                        {item.best && (
                          <span className="badge bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                            Mejor Precio
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Usar este precio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            Selecciona un insumo arriba para ver la comparativa de precios entre proveedores.
          </div>
        )}
      </div>
    </div>
  );
};
