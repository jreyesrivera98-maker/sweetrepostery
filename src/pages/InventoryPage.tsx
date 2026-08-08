import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertCircle, Package } from 'lucide-react';
import { mockIngredients } from '../lib/mockData';
import type { Ingredient } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastContext';
import { AlertDialog } from '../components/ui/AlertDialog';

export const InventoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const filter = searchParams.get('filter');

  const filteredIngredients = useMemo(() => {
    let result = ingredients;
    if (filter === 'low_stock') {
      result = result.filter(ing => ing.stock < ing.min_stock);
    }
    if (search) {
      result = result.filter(ing => ing.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [ingredients, filter, search]);

  const totalIngredients = ingredients.length;
  const lowStockCount = ingredients.filter(ing => ing.stock < ing.min_stock && ing.stock > 0).length;
  const outOfStockCount = ingredients.filter(ing => ing.stock === 0).length;

  const handleUpdateIngredient = async (id: string, field: string, value: number) => {
    // Optimistic update
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [field]: value };
        if (field === 'package_cost' || field === 'package_quantity') {
          updated.cost_per_unit = updated.package_cost / (updated.package_quantity || 1);
        }
        return updated;
      }
      return ing;
    }));

    try {
      const { error } = await supabase.from('ingredients').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      toast.success('Insumo actualizado correctamente');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al actualizar en base de datos. Modo local activo.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('ingredients').delete().eq('id', deleteId);
      if (error) throw error;
      
      setIngredients(prev => prev.filter(ing => ing.id !== deleteId));
      toast.success('Registro eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      // Fallback for mock mode
      setIngredients(prev => prev.filter(ing => ing.id !== deleteId));
      toast.info('Eliminado localmente (modo mock)');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario de Insumos</h1>
          <p className="page-subtitle">Gestiona tus ingredientes y controla el stock</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> Nuevo Insumo</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#EDE9FF', borderRadius: '0.75rem' }}><Package size={22} style={{ color: '#6C5CE7' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Total Insumos</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>{totalIngredients}</div>
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderColor: filter === 'low_stock' ? '#F4C430' : undefined }}
          onClick={() => setSearchParams(filter === 'low_stock' ? {} : { filter: 'low_stock' })}
        >
          <div style={{ padding: '0.75rem', background: '#FFF8E1', borderRadius: '0.75rem' }}><AlertCircle size={22} style={{ color: '#F4C430' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Stock Bajo</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E67E22' }}>{lowStockCount}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#FFF5F5', borderRadius: '0.75rem' }}><AlertCircle size={22} style={{ color: '#E74C3C' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Agotados</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E74C3C' }}>{outOfStockCount}</div>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div style={{ background: '#EDE9FF', border: '1px solid #D6BBFB', borderRadius: '0.625rem', padding: '0.625rem 1rem', marginBottom: '1rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#4834D4', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        📐 Costo Unitario = Precio Paquete ÷ Cantidad Paquete
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '350px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
        <input className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Buscar insumo..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="marea-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Precio Paquete ($)</th>
              <th>Cant. Paquete</th>
              <th style={{ background: '#EDE9FF', color: '#6C5CE7' }}>Costo/Unidad</th>
              <th>Stock Actual</th>
              <th>Stock Mín.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map(ing => (
              <tr key={ing.id} className={ing.stock < ing.min_stock ? 'low-stock-row' : ''}>
                <td>
                  <div style={{ fontWeight: 600 }}>{ing.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{ing.category}</span>
                    <span style={{ fontSize: '0.72rem', color: '#636E72' }}>{ing.unit}</span>
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    value={ing.package_cost || 0}
                    onChange={e => handleUpdateIngredient(ing.id, 'package_cost', Number(e.target.value))}
                    className="input-marea"
                    style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      value={ing.package_quantity || 1}
                      onChange={e => handleUpdateIngredient(ing.id, 'package_quantity', Number(e.target.value))}
                      className="input-marea"
                      style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#636E72' }}>{ing.unit}</span>
                  </div>
                </td>
                <td style={{ background: '#F4F3FF', fontWeight: 700, color: '#6C5CE7' }}>
                  ${(ing.package_cost / (ing.package_quantity || 1)).toFixed(4)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input
                      type="number"
                      value={ing.stock}
                      onChange={e => handleUpdateIngredient(ing.id, 'stock', Number(e.target.value))}
                      className="input-marea"
                      style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: ing.stock < ing.min_stock ? '#FEB2B2' : undefined, color: ing.stock < ing.min_stock ? '#C53030' : undefined }}
                    />
                    {ing.stock < ing.min_stock && <AlertCircle size={14} style={{ color: '#E74C3C' }} />}
                  </div>
                </td>
                <td style={{ color: '#636E72', fontSize: '0.875rem' }}>{ing.min_stock} {ing.unit}</td>
                <td>
                  {ing.stock === 0 ? (
                    <span className="badge badge-danger">Agotado</span>
                  ) : ing.stock <= ing.min_stock ? (
                    <span className="badge badge-warning">Stock Bajo</span>
                  ) : (
                    <span className="badge badge-success">Óptimo</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#EDE9FF', border: 'none', cursor: 'pointer', color: '#6C5CE7' }} onClick={() => toast.info('Función de edición detallada en desarrollo')}><Edit2 size={13} /></button>
                    <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C' }} onClick={() => setDeleteId(ing.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#636E72' }}>
                  No se encontraron insumos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar insumo"
        description="¿Estás seguro de eliminar este insumo? Esta acción no se puede deshacer y afectará el cálculo de recetas que lo utilicen."
      />
    </div>
  );
};
